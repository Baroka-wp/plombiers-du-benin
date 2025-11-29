import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';

// Cache configuration: revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

/**
 * Build hierarchical category tree
 */
function buildCategoryTree(categories: any[]): any[] {
    const categoryMap = new Map();
    const rootCategories: any[] = [];

    // First pass: create map of all categories
    categories.forEach(cat => {
        categoryMap.set(cat.id, {
            ...cat,
            children: [],
        });
    });

    // Second pass: build tree
    categories.forEach(cat => {
        const category = categoryMap.get(cat.id);
        if (cat.parentId) {
            const parent = categoryMap.get(cat.parentId);
            if (parent) {
                parent.children.push(category);
            } else {
                // Parent not found, treat as root
                rootCategories.push(category);
            }
        } else {
            rootCategories.push(category);
        }
    });

    // Sort by order
    const sortByOrder = (a: any, b: any) => a.order - b.order;
    rootCategories.sort(sortByOrder);
    categoryMap.forEach(cat => {
        if (cat.children.length > 0) {
            cat.children.sort(sortByOrder);
        }
    });

    return rootCategories;
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
        // Fetch all active categories
        const categories = await prisma.category.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                parentId: true,
                icon: true,
                order: true,
                _count: {
                    select: {
                        parts: {
                            where: {
                                isActive: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });

        // Build hierarchical tree
        const tree = buildCategoryTree(categories);

        return NextResponse.json(
            { categories: tree },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
                    'X-RateLimit-Limit': '100',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                },
            }
        );
    } catch (error) {
        logger.error('Error fetching categories', error instanceof Error ? error : new Error(String(error)));

        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

