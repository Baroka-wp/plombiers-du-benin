import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { searchPricesQuerySchema } from '@/lib/validations/price';

// Cache configuration: revalidate every 15 minutes
export const revalidate = 900;

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { partId: string } }
) {
    // Rate limiting: 100 requests per minute
    const rateLimitResult = checkRateLimit(request, {
        windowMs: 60 * 1000,
        maxRequests: 100,
    });

    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            {
                error: 'Too many requests',
                message: 'Rate limit exceeded. Please try again later.',
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': '100',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                    'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                },
            }
        );
    }

    try {
        const { partId } = params;

        // Validate UUID format
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(partId)) {
            return NextResponse.json(
                { error: 'Invalid part ID format' },
                { status: 400 }
            );
        }

        // Validate query parameters
        const searchParams = request.nextUrl.searchParams;
        const queryParams = {
            lat: searchParams.get('lat') || undefined,
            lng: searchParams.get('lng') || undefined,
            radius: searchParams.get('radius') || undefined,
        };

        const validatedParams = searchPricesQuerySchema.parse(queryParams);
        const { lat, lng, radius } = validatedParams;

        // Verify part exists
        const part = await prisma.part.findUnique({
            where: { id: partId, isActive: true },
            select: { id: true, name: true },
        });

        if (!part) {
            return NextResponse.json(
                { error: 'Part not found' },
                { status: 404 }
            );
        }

        // Fetch current prices for this part
        const prices = await prisma.price.findMany({
            where: {
                partId,
                isCurrent: true,
            },
            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        phone: true,
                        email: true,
                        address: true,
                        departement: true,
                        ville: true,
                        quartier: true,
                        latitude: true,
                        longitude: true,
                    },
                },
            },
            orderBy: {
                price: 'asc',
            },
        });

        // Calculate distances if coordinates provided
        let pricesWithDistance = prices;
        if (lat !== undefined && lng !== undefined && prices.length > 0) {
            pricesWithDistance = prices
                .filter(price => price.supplier.latitude !== null && price.supplier.longitude !== null)
                .map(price => ({
                    ...price,
                    distance: calculateDistance(
                        lat,
                        lng,
                        price.supplier.latitude!,
                        price.supplier.longitude!
                    ),
                }))
                .filter(price => {
                    // Filter by radius if provided
                    if (radius !== undefined) {
                        return price.distance <= radius;
                    }
                    return true;
                })
                .sort((a, b) => {
                    // Sort by distance first, then by price
                    if (a.distance !== undefined && b.distance !== undefined) {
                        return a.distance - b.distance;
                    }
                    return Number(a.price) - Number(b.price);
                });
        }

        // Extract unique suppliers
        const supplierMap = new Map();
        pricesWithDistance.forEach(price => {
            if (!supplierMap.has(price.supplier.id)) {
                supplierMap.set(price.supplier.id, {
                    ...price.supplier,
                    distance: price.distance,
                });
            }
        });

        return NextResponse.json(
            {
                part: {
                    id: part.id,
                    name: part.name,
                },
                prices: pricesWithDistance.map(p => ({
                    id: p.id,
                    price: Number(p.price),
                    supplier: {
                        id: p.supplier.id,
                        name: p.supplier.name,
                        type: p.supplier.type,
                        phone: p.supplier.phone,
                        address: p.supplier.address,
                        departement: p.supplier.departement,
                        ville: p.supplier.ville,
                        quartier: p.supplier.quartier,
                        latitude: p.supplier.latitude,
                        longitude: p.supplier.longitude,
                        distance: p.distance,
                    },
                    notes: p.notes,
                    createdAt: p.createdAt,
                })),
                suppliers: Array.from(supplierMap.values()),
                count: pricesWithDistance.length,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
                    'X-RateLimit-Limit': '100',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                },
            }
        );
    } catch (error) {
        logger.error('Error fetching prices', error instanceof Error ? error : new Error(String(error)), {
            partId: params.partId,
        });

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch prices' },
            { status: 500 }
        );
    }
}

