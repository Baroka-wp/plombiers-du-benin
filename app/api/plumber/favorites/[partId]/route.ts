import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ partId: string }> }
) {
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
        const { partId } = await params;

        // Validate UUID format
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(partId)) {
            return NextResponse.json(
                { error: 'Invalid part ID format' },
                { status: 400 }
            );
        }

        // Check if favorite exists
        const favorite = await prisma.favorite.findUnique({
            where: {
                plumberId_partId: {
                    plumberId,
                    partId,
                },
            },
        });

        if (!favorite) {
            return NextResponse.json(
                { error: 'Favorite not found' },
                { status: 404 }
            );
        }

        // Delete favorite
        await prisma.favorite.delete({
            where: {
                id: favorite.id,
            },
        });

        return NextResponse.json(
            { message: 'Favorite removed successfully' },
            {
                headers: {
                    'X-RateLimit-Limit': '200',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                },
            }
        );
    } catch (error) {
        const { partId } = await params;
        logger.error('Error removing favorite', error instanceof Error ? error : new Error(String(error)), {
            partId,
        });

        return NextResponse.json(
            { error: 'Failed to remove favorite' },
            { status: 500 }
        );
    }
}

