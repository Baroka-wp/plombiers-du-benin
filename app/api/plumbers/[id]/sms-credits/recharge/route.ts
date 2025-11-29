import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { smsService } from "@/lib/sms";

/**
 * POST - Recharger les crédits SMS avec paiement simulé
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { credits } = body;

    const session = await getServerSession(authOptions);

    // Vérifier que l'utilisateur est authentifié et qu'il accède à ses propres données
    if (!session?.user?.id || session.user.id !== id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    if (!credits || typeof credits !== 'number' || credits <= 0) {
      return NextResponse.json(
        { error: "Nombre de crédits invalide" },
        { status: 400 }
      );
    }

    // Packages de crédits disponibles
    const packages = [
      { credits: 10, price: 1000 },
      { credits: 25, price: 2000 },
      { credits: 50, price: 3500 },
      { credits: 100, price: 6000 },
    ];

    const selectedPackage = packages.find(pkg => pkg.credits === credits);
    if (!selectedPackage) {
      return NextResponse.json(
        { error: "Package de crédits invalide" },
        { status: 400 }
      );
    }

    const plumber = await prisma.plumber.findUnique({
      where: { id },
      select: {
        prenom: true,
        nom: true,
        telephone: true,
        smsCredits: true,
      },
    });

    if (!plumber) {
      return NextResponse.json(
        { error: "Plombier non trouvé" },
        { status: 404 }
      );
    }

    // Générer une référence de paiement
    const paymentReference = `SMS-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Simuler le paiement (créer un enregistrement de paiement)
    const payment = await prisma.payment.create({
      data: {
        amount: selectedPackage.price,
        reference: paymentReference,
        status: "SUCCESS",
        plumberId: id,
      },
    });

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
      amount: selectedPackage.price,
      paymentId: payment.id,
      reference: paymentReference,
      newTotal: updatedPlumber.smsCredits,
    });

    // Envoyer un SMS de confirmation au plombier
    const confirmationMessage = `✅ Vos crédits SMS ont été rechargés. Vous avez maintenant ${updatedPlumber.smsCredits} crédit${updatedPlumber.smsCredits > 1 ? 's' : ''}. Annuaire des Plombiers du Bénin.`;
    smsService.sendSMS(updatedPlumber.telephone, confirmationMessage).catch((err: any) => {
      logger.warn("Failed to send recharge confirmation SMS", err instanceof Error ? err : new Error(String(err)), {
        plumberId: id,
      });
    });

    return NextResponse.json({
      success: true,
      smsCredits: updatedPlumber.smsCredits,
      creditsAdded: credits,
      amount: selectedPackage.price,
      paymentReference: paymentReference,
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

