import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAdminAuth, checkAdminAuth } from '@/lib/admin-auth';
import { createPartSchema, updatePartSchema } from '@/lib/validations/part';
import { sanitizeString } from '@/lib/sanitize';

// Rate limiting: 500 requests per minute for admin
const ADMIN_RATE_LIMIT = {
    windowMs: 60 * 1000,
    maxRequests: 500,
};

export async function GET(request: NextRequest) {
    const authError = await requireAdminAuth();
    if (authError) return authError;

    const rateLimitResult = checkRateLimit(request, ADMIN_RATE_LIMIT);
    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
        );
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const categoryId = searchParams.get('categoryId') || undefined;
        const isActive = searchParams.get('isActive');

        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
                { reference: { contains: search, mode: 'insensitive' as const } },
                { brand: { contains: search, mode: 'insensitive' as const } },
            ];
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (isActive !== null && isActive !== undefined) {
            where.isActive = isActive === 'true';
        }

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
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.part.count({ where }),
        ]);

        return NextResponse.json({
            parts,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        logger.error('Error fetching parts (admin)', error instanceof Error ? error : new Error(String(error)));
        return NextResponse.json(
            { error: 'Failed to fetch parts' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const authError = await requireAdminAuth();
    if (authError) return authError;

    const session = await checkAdminAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rateLimitResult = checkRateLimit(request, ADMIN_RATE_LIMIT);
    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        
        // Sanitize inputs
        if (body.name) body.name = sanitizeString(body.name);
        if (body.slug) body.slug = sanitizeString(body.slug);
        if (body.description) body.description = sanitizeString(body.description);
        if (body.reference) body.reference = sanitizeString(body.reference);
        if (body.brand) body.brand = sanitizeString(body.brand);

        const validatedData = createPartSchema.parse(body);

        // Check if slug already exists
        const existingPart = await prisma.part.findUnique({
            where: { slug: validatedData.slug },
        });

        if (existingPart) {
            return NextResponse.json(
                { error: 'Part with this slug already exists' },
                { status: 409 }
            );
        }

        // Verify category exists
        const category = await prisma.category.findUnique({
            where: { id: validatedData.categoryId },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        const part = await prisma.part.create({
            data: validatedData,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        logger.info('Part created', { partId: part.id, createdBy: session.user.id });

        return NextResponse.json({ part }, { status: 201 });
    } catch (error) {
        logger.error('Error creating part', error instanceof Error ? error : new Error(String(error)));

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create part' },
            { status: 500 }
        );
    }
}

