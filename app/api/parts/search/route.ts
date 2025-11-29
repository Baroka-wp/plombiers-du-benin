import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { fullTextSearchQuerySchema } from '@/lib/validations/part';

// Cache configuration: revalidate every 15 minutes
export const revalidate = 900;

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
            q: searchParams.get('q') || '',
            category: searchParams.get('category') || undefined,
            page: searchParams.get('page') || '1',
            limit: searchParams.get('limit') || '20',
        };

        const validatedParams = fullTextSearchQuerySchema.parse(queryParams);
        const { q, category, page, limit } = validatedParams;
        const skip = (page - 1) * limit;

        // Build where clause for full-text search
        const where: any = {
            isActive: true,
        };

        if (category) {
            where.categoryId = category;
        }

        // PostgreSQL full-text search
        // Note: Prisma doesn't support full-text search directly, so we use contains for now
        // For production, consider using raw queries with PostgreSQL's full-text search
        if (q) {
            const searchTerms = q.trim().split(/\s+/).filter(term => term.length > 0);
            
            if (searchTerms.length > 0) {
                where.OR = searchTerms.map(term => [
                    { name: { contains: term, mode: 'insensitive' as const } },
                    { description: { contains: term, mode: 'insensitive' as const } },
                    { reference: { contains: term, mode: 'insensitive' as const } },
                    { brand: { contains: term, mode: 'insensitive' as const } },
                ]).flat();
            }
        }

        // Fetch parts
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
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.part.count({ where }),
        ]);

        // Calculate pagination
        const totalPages = Math.ceil(totalCount / limit);

        // Simple highlight: wrap matching terms in results
        // For better highlighting, consider using a search engine like Elasticsearch
        const highlightedParts = parts.map(part => ({
            ...part,
            // Highlight logic could be added here
        }));

        return NextResponse.json(
            {
                parts: highlightedParts,
                pagination: {
                    page,
                    limit,
                    totalCount,
                    totalPages,
                },
                query: q,
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
        logger.error('Error searching parts', error instanceof Error ? error : new Error(String(error)), {
            url: request.url,
        });

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to search parts' },
            { status: 500 }
        );
    }
}

