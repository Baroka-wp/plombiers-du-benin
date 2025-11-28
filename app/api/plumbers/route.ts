import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';

// Cache configuration: revalidate every 60 seconds
export const revalidate = 60;

export async function GET(request: NextRequest) {
    // Rate limiting: 20 requests per minute
    const rateLimitResult = checkRateLimit(request, {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 20,
    });

    if (!rateLimitResult.allowed) {
        logger.warn('Rate limit exceeded', undefined, {
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
                    'X-RateLimit-Limit': '20',
                    'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                    'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                    'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                },
            }
        );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search') || '';
    const departement = searchParams.get('departement') || '';
    
    try {
        const skip = (page - 1) * limit;

        // Build where clause for search filtering
        // Note: PostgreSQL supports case-insensitive search with mode: 'insensitive'
        const whereConditions: any = {};
        
        // Search filter (nom, prenom, ville, quartier)
        if (search) {
            whereConditions.OR = [
                { nom: { contains: search, mode: 'insensitive' as const } },
                { prenom: { contains: search, mode: 'insensitive' as const } },
                { ville: { contains: search, mode: 'insensitive' as const } },
                { quartier: { contains: search, mode: 'insensitive' as const } },
            ];
        }
        
        // Department filter
        if (departement) {
            whereConditions.departement = { equals: departement };
        }
        
        const whereClause = Object.keys(whereConditions).length > 0 ? whereConditions : {};

        // Build orderBy object based on sortBy parameter
        let orderBy: Record<string, "asc" | "desc"> = {};

        if (sortBy === 'name') {
            orderBy = { nom: sortOrder as 'asc' | 'desc' };
        } else if (sortBy === 'rating') {
            // For rating, we'll sort after fetching since it's calculated
            orderBy = { createdAt: 'desc' };
        } else {
            orderBy = { [sortBy]: sortOrder as 'asc' | 'desc' };
        }

        // Fetch plumbers with their reviews for rating calculation
        const [plumbers, totalCount] = await Promise.all([
            prisma.plumber.findMany({
                where: whereClause,
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
            prisma.plumber.count({ where: whereClause }),
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
        logger.error('Error fetching plumbers', error instanceof Error ? error : new Error(String(error)), {
            page,
            limit,
            sortBy,
            sortOrder,
            search,
        });
        return NextResponse.json(
            { error: 'Failed to fetch plumbers' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nom, prenom, telephone, departement, ville, quartier } = body;

        // Validation
        if (!nom || !prenom || !telephone || !departement || !ville) {
            return NextResponse.json(
                { error: "Tous les champs obligatoires doivent être remplis" },
                { status: 400 }
            );
        }

        // Check if phone already exists
        const existingPlumber = await prisma.plumber.findUnique({
            where: { telephone },
        });

        if (existingPlumber) {
            return NextResponse.json(
                { error: "Ce numéro de téléphone est déjà enregistré" },
                { status: 409 }
            );
        }

        // Create plumber record (membershipId will be generated after payment)
        const year = new Date().getFullYear();
        const plumber = await prisma.plumber.create({
            data: {
                nom,
                prenom,
                telephone,
                departement,
                ville,
                quartier: quartier || "",
                adresse: quartier || "",
                diplomeFileUrl: "", // Will be updated in Step 2
                diplomeAnnee: year, // Set to current year by default
                photoUrl: null,
                membershipId: null, // Will be generated after payment
                isVerified: false,
                hasPaid: false,
            },
        });

        logger.info("Plumber record created", { plumberId: plumber.id });

        return NextResponse.json({
            id: plumber.id,
        });
    } catch (error) {
        logger.error("Error creating plumber", error instanceof Error ? error : new Error(String(error)));
        return NextResponse.json(
            { error: "Erreur lors de la création du dossier" },
            { status: 500 }
        );
    }
}
