import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        const skip = (page - 1) * limit;

        // Build orderBy object based on sortBy parameter
        let orderBy: Record<string, "asc" | "desc"> = {};

        if (sortBy === 'name') {
            orderBy = { nom: sortOrder };
        } else if (sortBy === 'rating') {
            // For rating, we'll sort after fetching since it's calculated
            orderBy = { createdAt: 'desc' };
        } else {
            orderBy = { [sortBy]: sortOrder };
        }

        // Fetch plumbers with their reviews for rating calculation
        const [plumbers, totalCount] = await Promise.all([
            prisma.plumber.findMany({
                skip,
                take: limit,
                orderBy,
                include: {
                    reviews: {
                        select: {
                            rating: true,
                        },
                    },
                },
            }),
            prisma.plumber.count(),
        ]);

        // Calculate average rating for each plumber
        let plumbersWithRating = plumbers.map((plumber) => {
            const totalRating = plumber.reviews.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = plumber.reviews.length > 0
                ? totalRating / plumber.reviews.length
                : 0;

            return {
                id: plumber.id,
                nom: plumber.nom,
                prenom: plumber.prenom,
                telephone: plumber.telephone,
                photoUrl: plumber.photoUrl,
                departement: plumber.departement,
                ville: plumber.ville,
                quartier: plumber.quartier,
                isVerified: plumber.isVerified,
                hasPaid: plumber.hasPaid,
                membershipId: plumber.membershipId,
                averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
                reviewCount: plumber.reviews.length,
            };
        });

        // Sort by rating if requested
        if (sortBy === 'rating') {
            plumbersWithRating.sort((a, b) => {
                return sortOrder === 'asc'
                    ? a.averageRating - b.averageRating
                    : b.averageRating - a.averageRating;
            });
        }

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            plumbers: plumbersWithRating,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
            },
        });
    } catch (error) {
        console.error('Error fetching plumbers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch plumbers' },
            { status: 500 }
        );
    }
}
