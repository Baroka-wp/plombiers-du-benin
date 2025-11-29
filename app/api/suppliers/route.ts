import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { searchSuppliersQuerySchema } from '@/lib/validations/supplier';

// Cache configuration: revalidate every 30 minutes
export const revalidate = 1800;

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

export async function GET(request: NextRequest) {
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
        const searchParams = request.nextUrl.searchParams;
        
        const queryParams = {
            departement: searchParams.get('departement') || undefined,
            ville: searchParams.get('ville') || undefined,
            lat: searchParams.get('lat') || undefined,
            lng: searchParams.get('lng') || undefined,
            radius: searchParams.get('radius') || undefined,
        };

        const validatedParams = searchSuppliersQuerySchema.parse(queryParams);
        const { departement, ville, lat, lng, radius } = validatedParams;

        // Build where clause
        const where: any = {
            isActive: true,
        };

        if (departement) {
            where.departement = departement;
        }

        if (ville) {
            where.ville = ville;
        }

        // Fetch suppliers
        const suppliers = await prisma.supplier.findMany({
            where,
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
            orderBy: {
                name: 'asc',
            },
        });

        // Calculate distances if coordinates provided
        let suppliersWithDistance = suppliers;
        if (lat !== undefined && lng !== undefined && suppliers.length > 0) {
            suppliersWithDistance = suppliers
                .filter(supplier => supplier.latitude !== null && supplier.longitude !== null)
                .map(supplier => ({
                    ...supplier,
                    distance: calculateDistance(
                        lat,
                        lng,
                        supplier.latitude!,
                        supplier.longitude!
                    ),
                }))
                .filter(supplier => {
                    // Filter by radius if provided
                    if (radius !== undefined) {
                        return supplier.distance <= radius;
                    }
                    return true;
                })
                .sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        return NextResponse.json(
            {
                suppliers: suppliersWithDistance,
                count: suppliersWithDistance.length,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
                    'X-RateLimit-Limit': '100',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                },
            }
        );
    } catch (error) {
        logger.error('Error fetching suppliers', error instanceof Error ? error : new Error(String(error)), {
            url: request.url,
        });

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch suppliers' },
            { status: 500 }
        );
    }
}

