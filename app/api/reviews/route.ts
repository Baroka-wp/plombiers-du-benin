import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plumberId, rating, comment, clientPhone } = body;

    // Validation
    if (!plumberId || !rating) {
      return NextResponse.json(
        { error: "Plombier et note requis" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La note doit être entre 1 et 5" },
        { status: 400 }
      );
    }

    // Vérifier que le plombier existe
    const plumber = await prisma.plumber.findUnique({
      where: { id: plumberId },
    });

    if (!plumber) {
      return NextResponse.json(
        { error: "Plombier non trouvé" },
        { status: 404 }
      );
    }

    // Créer la review
    const review = await prisma.review.create({
      data: {
        plumberId,
        rating: parseInt(rating),
        comment: comment || null,
        clientPhone: clientPhone || null,
      },
    });

    logger.info("Review created", {
      reviewId: review.id,
      plumberId,
      rating,
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      },
    });
  } catch (error) {
    logger.error("Error creating review", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la création de l'avis" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plumberId = searchParams.get("plumberId");

    if (!plumberId) {
      return NextResponse.json(
        { error: "ID plombier requis" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { plumberId },
      orderBy: { createdAt: "desc" },
      take: 50, // Limiter à 50 avis récents
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    logger.error("Error fetching reviews", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la récupération des avis" },
      { status: 500 }
    );
  }
}

