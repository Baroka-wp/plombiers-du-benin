import { NextRequest, NextResponse } from "next/server";
import { sendSMS, formatBeninPhoneNumber } from "@/lib/sms";
import { prisma } from "@/lib/prisma";
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

    // Get plumber details
    const plumber = await prisma.plumber.findUnique({
      where: { id: plumberId },
      select: {
        id: true,
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

    // Format phone numbers
    const plumberPhone = formatBeninPhoneNumber(plumber.telephone);
    const formattedClientPhone = formatBeninPhoneNumber(clientPhone);

    // Prepare message
    const smsMessage = message || 
      `Nouvelle demande de ${clientName} (${formattedClientPhone}). ` +
      `Client intéressé par vos services de plomberie. Répertoire National des Plombiers.`;

    // Send SMS via Africa's Talking
    const result = await sendSMS({
      to: plumberPhone,
      message: smsMessage,
    });

    if (!result.success) {
      logger.error("Failed to send SMS", new Error(result.error || "Unknown error"), {
        plumberId,
        clientPhone: formattedClientPhone,
      });
      
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du message" },
        { status: 500 }
      );
    }

    logger.info("SMS sent successfully", undefined, {
      plumberId,
      plumberPhone,
    });

    return NextResponse.json({
      success: true,
      message: "Message envoyé avec succès",
    });
  } catch (error) {
    logger.error("Contact plumber error", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}

