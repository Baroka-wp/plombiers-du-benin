import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { searchPartsQuerySchema } from '@/lib/validations/part';

// Cache configuration: revalidate every 15 minutes (900 seconds)
export const revalidate = 900;

export async function GET(request: NextRequest) {
    // Rate limiting: 100 requests per minute for public API
    const rateLimitResult = checkRateLimit(request, {
        windowMs: 60 * 1000,
        maxRequests: 100,
    });

    if (!rateLimitResult.allowed) {
        logger.warn('Rate limit exceeded for parts API', undefined, {
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        });

        return NextResponse.json(
            {
                error: 'Too many requests',
                message: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': '100',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                    'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                    'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                },
            }
        );
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        
        // Validate query parameters
        const queryParams = {
            category: searchParams.get('category') || undefined,
            search: searchParams.get('search') || undefined,
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '20',
            sort: (searchParams.get('sort') || 'createdAt') as 'name' | 'createdAt' | 'price',
            sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
        };

        const validatedParams = searchPartsQuerySchema.parse(queryParams);

        const { page, limit, category, search, sort, sortOrder } = validatedParams;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            isActive: true,
        };

        if (category) {
            where.categoryId = category;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
                { reference: { contains: search, mode: 'insensitive' as const } },
                { brand: { contains: search, mode: 'insensitive' as const } },
            ];
        }

        // Build orderBy
        let orderBy: any = {};
        if (sort === 'name') {
            orderBy = { name: sortOrder };
        } else if (sort === 'createdAt') {
            orderBy = { createdAt: sortOrder };
        } else if (sort === 'price') {
            // For price sorting, we'll need to join with prices and sort after fetching
            // For now, sort by createdAt and handle price sorting in application logic if needed
            orderBy = { createdAt: sortOrder };
        }

        // Fetch parts with category
        const [parts, totalCount] = await Promise.all([
            prisma.part.findMany({
                where,
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.part.count({ where }),
        ]);

        // Calculate pagination
        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json(
            {
                parts,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages,
                },
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
                    'X-RateLimit-Limit': '100',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                    'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                },
            }
        );
    } catch (error) {
        logger.error('Error fetching parts', error instanceof Error ? error : new Error(String(error)), {
            url: request.url,
        });

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch parts' },
            { status: 500 }
        );
    }
}

