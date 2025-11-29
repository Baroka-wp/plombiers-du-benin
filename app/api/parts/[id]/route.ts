import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';

// Cache configuration: revalidate every 15 minutes
export const revalidate = 900;

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
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
        const { id } = params;

        // Validate UUID format
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return NextResponse.json(
                { error: 'Invalid part ID format' },
                { status: 400 }
            );
        }

        const part = await prisma.part.findUnique({
            where: { id, isActive: true },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        parent: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
                prices: {
                    where: { isCurrent: true },
                    include: {
                        supplier: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                                phone: true,
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
                    take: 10, // Limit to 10 prices for performance
                },
            },
        });

        if (!part) {
            return NextResponse.json(
                { error: 'Part not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { part },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
                    'X-RateLimit-Limit': '100',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                },
            }
        );
    } catch (error) {
        logger.error('Error fetching part details', error instanceof Error ? error : new Error(String(error)), {
            partId: params.id,
        });

        return NextResponse.json(
            { error: 'Failed to fetch part details' },
            { status: 500 }
        );
    }
}

