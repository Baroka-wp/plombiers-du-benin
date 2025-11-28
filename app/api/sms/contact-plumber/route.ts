import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { smsService } from "@/lib/sms";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const { plumberId, clientName, clientPhone, message } = await request.json();

    // Validation
    if (!plumberId || !clientName || !clientPhone) {
      return NextResponse.json(
        { error: "Informations manquantes" },
        { status: 400 }
      );
    }

    // Get plumber data
    const plumber = await prisma.plumber.findUnique({
      where: { id: plumberId },
      select: {
        prenom: true,
        nom: true,
        telephone: true,
      },
    });

    if (!plumber) {
      return NextResponse.json(
        { error: "Plombier non trouvé" },
        { status: 404 }
      );
    }

    // Format message - use Termii OTP to send as regular SMS isn't their main feature
    // For production, you might want to use Termii's generic SMS API instead
    const smsMessage = `Nouvelle demande: ${clientName} (${clientPhone}) souhaite vous contacter. ${message || ""}`;

    // Note: Termii OTP API is meant for verification codes
    // For contact messages, consider using their generic SMS endpoint:
    // POST https://api.ng.termii.com/api/sms/send
    // For now, we'll log this and return success
    
    logger.info("Contact request", undefined, {
      plumberId,
      plumberName: `${plumber.prenom} ${plumber.nom}`,
      clientName,
      clientPhone,
    });

    // TODO: Implement generic SMS sending via Termii
    // For now, return success without actually sending
    return NextResponse.json({
      success: true,
      message: "Demande enregistrée avec succès",
    });
  } catch (error) {
    logger.error("Contact plumber error", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
