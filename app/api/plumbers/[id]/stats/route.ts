import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Vérifier que le plombier existe
    const plumber = await prisma.plumber.findUnique({
      where: { id },
    });

    if (!plumber) {
      return NextResponse.json(
        { error: "Plombier non trouvé" },
        { status: 404 }
      );
    }

    // Compter les prises de contact
    let totalContactRequests = 0;
    let recentContactRequests: any[] = [];

    if (prisma.contactRequest) {
      totalContactRequests = await prisma.contactRequest.count({
        where: { plumberId: id },
      });

      // Récupérer les prises de contact récentes (10 dernières)
      recentContactRequests = await prisma.contactRequest.findMany({
        where: { plumberId: id },
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          clientName: true,
          clientPhone: true,
          message: true,
          createdAt: true,
        },
      });
    } else {
      logger.warn("ContactRequest model not available in Prisma client", undefined, { plumberId: id });
    }

    // Compter les avis
    const reviewCount = await prisma.review.count({
      where: { plumberId: id },
    });

    // Note moyenne
    const averageRating = await prisma.review.aggregate({
      where: { plumberId: id },
      _avg: { rating: true },
    });

    return NextResponse.json({
      totalContactRequests,
      recentContactRequests,
      reviewCount,
      averageRating: averageRating._avg.rating || 0,
    });
  } catch (error) {
    logger.error("Error fetching plumber stats", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}

