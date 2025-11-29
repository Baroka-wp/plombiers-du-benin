import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { addFavoriteSchema } from '@/lib/validations/favorite';

// Cache configuration: revalidate every 5 minutes for authenticated routes
export const revalidate = 300;

export async function GET(request: NextRequest) {
    // Rate limiting: 200 requests per minute for authenticated users
    const rateLimitResult = checkRateLimit(request, {
        windowMs: 60 * 1000,
        maxRequests: 200,
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
                    'X-RateLimit-Limit': '200',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                    'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                },
            }
        );
    }

    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const plumberId = session.user.id;

        // Fetch favorites
        const favorites = await prisma.favorite.findMany({
            where: {
                plumberId,
            },
            include: {
                part: {
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                        prices: {
                            where: { isCurrent: true },
                            orderBy: { price: 'asc' },
                            take: 1, // Get lowest price
                            select: {
                                price: true,
                                supplier: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(
            {
                favorites: favorites.map(fav => ({
                    id: fav.id,
                    part: {
                        id: fav.part.id,
                        name: fav.part.name,
                        slug: fav.part.slug,
                        description: fav.part.description,
                        reference: fav.part.reference,
                        brand: fav.part.brand,
                        imageUrl: fav.part.imageUrl,
                        unit: fav.part.unit,
                        category: fav.part.category,
                        lowestPrice: fav.part.prices[0] ? Number(fav.part.prices[0].price) : null,
                        lowestPriceSupplier: fav.part.prices[0]?.supplier.name || null,
                    },
                    createdAt: fav.createdAt,
                })),
                count: favorites.length,
            },
            {
                headers: {
                    'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
                    'X-RateLimit-Limit': '200',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                },
            }
        );
    } catch (error) {
        logger.error('Error fetching favorites', error instanceof Error ? error : new Error(String(error)));

        return NextResponse.json(
            { error: 'Failed to fetch favorites' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    // Rate limiting: 200 requests per minute
    const rateLimitResult = checkRateLimit(request, {
        windowMs: 60 * 1000,
        maxRequests: 200,
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
                    'X-RateLimit-Limit': '200',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                },
            }
        );
    }

    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const plumberId = session.user.id;

        // Parse and validate request body
        const body = await request.json();
        const validatedData = addFavoriteSchema.parse(body);
        const { partId } = validatedData;

        // Verify part exists and is active
        const part = await prisma.part.findUnique({
            where: { id: partId, isActive: true },
            select: { id: true },
        });

        if (!part) {
            return NextResponse.json(
                { error: 'Part not found or inactive' },
                { status: 404 }
            );
        }

        // Check if favorite already exists
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                plumberId_partId: {
                    plumberId,
                    partId,
                },
            },
        });

        if (existingFavorite) {
            return NextResponse.json(
                { error: 'Part already in favorites' },
                { status: 409 }
            );
        }

        // Create favorite
        const favorite = await prisma.favorite.create({
            data: {
                plumberId,
                partId,
            },
            include: {
                part: {
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(
            {
                favorite: {
                    id: favorite.id,
                    part: {
                        id: favorite.part.id,
                        name: favorite.part.name,
                        slug: favorite.part.slug,
                        category: favorite.part.category,
                    },
                    createdAt: favorite.createdAt,
                },
            },
            {
                status: 201,
                headers: {
                    'X-RateLimit-Limit': '200',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                },
            }
        );
    } catch (error) {
        logger.error('Error adding favorite', error instanceof Error ? error : new Error(String(error)));

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to add favorite' },
            { status: 500 }
        );
    }
}

