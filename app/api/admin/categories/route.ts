import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAdminAuth, checkAdminAuth } from '@/lib/admin-auth';
import { createCategorySchema, updateCategorySchema } from '@/lib/validations/category';
import { sanitizeString } from '@/lib/sanitize';

const ADMIN_RATE_LIMIT = {
    windowMs: 60 * 1000,
    maxRequests: 500,
};

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
        if (body.icon) body.icon = sanitizeString(body.icon);

        const validatedData = createCategorySchema.parse(body);

        // Check if slug already exists
        const existingCategory = await prisma.category.findUnique({
            where: { slug: validatedData.slug },
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category with this slug already exists' },
                { status: 409 }
            );
        }

        // Verify parent exists if provided
        if (validatedData.parentId) {
            const parent = await prisma.category.findUnique({
                where: { id: validatedData.parentId },
            });

            if (!parent) {
                return NextResponse.json(
                    { error: 'Parent category not found' },
                    { status: 404 }
                );
            }
        }

        const category = await prisma.category.create({
            data: validatedData,
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        logger.info('Category created', { categoryId: category.id, createdBy: session.user.id });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        logger.error('Error creating category', error instanceof Error ? error : new Error(String(error)));

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
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
        if (body.icon) body.icon = sanitizeString(body.icon);

        const validatedData = updateCategorySchema.parse(body);

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id: validatedData.id },
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Check slug uniqueness if slug is being updated
        if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
            const slugExists = await prisma.category.findUnique({
                where: { slug: validatedData.slug },
            });

            if (slugExists) {
                return NextResponse.json(
                    { error: 'Category with this slug already exists' },
                    { status: 409 }
                );
            }
        }

        // Verify parent if being updated
        if (validatedData.parentId !== undefined) {
            if (validatedData.parentId === validatedData.id) {
                return NextResponse.json(
                    { error: 'Category cannot be its own parent' },
                    { status: 400 }
                );
            }

            if (validatedData.parentId) {
                const parent = await prisma.category.findUnique({
                    where: { id: validatedData.parentId },
                });

                if (!parent) {
                    return NextResponse.json(
                        { error: 'Parent category not found' },
                        { status: 404 }
                    );
                }
            }
        }

        const updatedCategory = await prisma.category.update({
            where: { id: validatedData.id },
            data: validatedData,
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        logger.info('Category updated', { categoryId: validatedData.id, updatedBy: session.user.id });

        return NextResponse.json({ category: updatedCategory });
    } catch (error) {
        logger.error('Error updating category', error instanceof Error ? error : new Error(String(error)));

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
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
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return NextResponse.json(
                { error: 'Invalid category ID' },
                { status: 400 }
            );
        }

        // Check if category exists
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        children: true,
                        parts: true,
                    },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Check if category has children or parts
        if (category._count.children > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category with subcategories' },
                { status: 400 }
            );
        }

        if (category._count.parts > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category with associated parts' },
                { status: 400 }
            );
        }

        // Soft delete
        await prisma.category.update({
            where: { id },
            data: { isActive: false },
        });

        logger.info('Category deleted (soft)', { categoryId: id, deletedBy: session.user.id });

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        logger.error('Error deleting category', error instanceof Error ? error : new Error(String(error)));

        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}

