import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';
import { requireAdminAuth, checkAdminAuth } from '@/lib/admin-auth';
import { updatePartSchema } from '@/lib/validations/part';
import { sanitizeString } from '@/lib/sanitize';

const ADMIN_RATE_LIMIT = {
    windowMs: 60 * 1000,
    maxRequests: 500,
};

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
        const { id } = params;

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return NextResponse.json(
                { error: 'Invalid part ID format' },
                { status: 400 }
            );
        }

        const body = await request.json();
        
        // Sanitize inputs
        if (body.name) body.name = sanitizeString(body.name);
        if (body.slug) body.slug = sanitizeString(body.slug);
        if (body.description) body.description = sanitizeString(body.description);
        if (body.reference) body.reference = sanitizeString(body.reference);
        if (body.brand) body.brand = sanitizeString(body.brand);

        const validatedData = updatePartSchema.parse({ ...body, id });

        // Check if part exists
        const existingPart = await prisma.part.findUnique({
            where: { id },
        });

        if (!existingPart) {
            return NextResponse.json(
                { error: 'Part not found' },
                { status: 404 }
            );
        }

        // Check slug uniqueness if slug is being updated
        if (validatedData.slug && validatedData.slug !== existingPart.slug) {
            const slugExists = await prisma.part.findUnique({
                where: { slug: validatedData.slug },
            });

            if (slugExists) {
                return NextResponse.json(
                    { error: 'Part with this slug already exists' },
                    { status: 409 }
                );
            }
        }

        // Verify category if being updated
        if (validatedData.categoryId && validatedData.categoryId !== existingPart.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: validatedData.categoryId },
            });

            if (!category) {
                return NextResponse.json(
                    { error: 'Category not found' },
                    { status: 404 }
                );
            }
        }

        const updatedPart = await prisma.part.update({
            where: { id },
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

        logger.info('Part updated', { partId: id, updatedBy: session.user.id });

        return NextResponse.json({ part: updatedPart });
    } catch (error) {
        logger.error('Error updating part', error instanceof Error ? error : new Error(String(error)));

        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid data', details: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update part' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
        const { id } = params;

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
            return NextResponse.json(
                { error: 'Invalid part ID format' },
                { status: 400 }
            );
        }

        // Check if part exists
        const part = await prisma.part.findUnique({
            where: { id },
        });

        if (!part) {
            return NextResponse.json(
                { error: 'Part not found' },
                { status: 404 }
            );
        }

        // Soft delete: set isActive to false
        await prisma.part.update({
            where: { id },
            data: { isActive: false },
        });

        logger.info('Part deleted (soft)', { partId: id, deletedBy: session.user.id });

        return NextResponse.json({ message: 'Part deleted successfully' });
    } catch (error) {
        logger.error('Error deleting part', error instanceof Error ? error : new Error(String(error)));

        return NextResponse.json(
            { error: 'Failed to delete part' },
            { status: 500 }
        );
    }
}

