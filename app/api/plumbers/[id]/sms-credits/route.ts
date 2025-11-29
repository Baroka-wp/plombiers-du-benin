import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET - Récupérer les crédits SMS d'un plombier
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Vérifier que l'utilisateur est authentifié et qu'il accède à ses propres données
    if (!session?.user?.id || session.user.id !== id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const plumber = await prisma.plumber.findUnique({
      where: { id },
      select: {
        smsCredits: true,
      },
    });

    if (!plumber) {
      return NextResponse.json(
        { error: "Plombier non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      smsCredits: plumber.smsCredits,
    });
  } catch (error) {
    logger.error("Error fetching SMS credits", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la récupération des crédits" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Recharger les crédits SMS (pour admin uniquement)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { credits } = body;

    // TODO: Vérifier que l'utilisateur est admin
    // Pour l'instant, on accepte la requête mais on devrait ajouter une vérification admin

    if (!credits || typeof credits !== 'number' || credits <= 0) {
      return NextResponse.json(
        { error: "Nombre de crédits invalide" },
        { status: 400 }
      );
    }

    const plumber = await prisma.plumber.findUnique({
      where: { id },
    });

    if (!plumber) {
      return NextResponse.json(
        { error: "Plombier non trouvé" },
        { status: 404 }
      );
    }

    // Ajouter les crédits
    const updatedPlumber = await prisma.plumber.update({
      where: { id },
      data: {
        smsCredits: {
          increment: credits,
        },
      },
      select: {
        smsCredits: true,
        prenom: true,
        nom: true,
        telephone: true,
      },
    });

    logger.info("SMS credits recharged", {
      plumberId: id,
      creditsAdded: credits,
      newTotal: updatedPlumber.smsCredits,
    });

    // Envoyer un SMS de confirmation au plombier
    const confirmationMessage = `✅ Vos crédits SMS ont été rechargés. Vous avez maintenant ${updatedPlumber.smsCredits} crédit${updatedPlumber.smsCredits > 1 ? 's' : ''}. Annuaire des Plombiers du Bénin.`;
    const { smsService } = await import("@/lib/sms");
    smsService.sendSMS(updatedPlumber.telephone, confirmationMessage).catch((err: any) => {
      logger.warn("Failed to send recharge confirmation SMS", err instanceof Error ? err : new Error(String(err)), {
        plumberId: id,
      });
    });

    return NextResponse.json({
      success: true,
      smsCredits: updatedPlumber.smsCredits,
      message: `Crédits rechargés avec succès. Total: ${updatedPlumber.smsCredits}`,
    });
  } catch (error) {
    logger.error("Error recharging SMS credits", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors du rechargement des crédits" },
      { status: 500 }
    );
  }
}

