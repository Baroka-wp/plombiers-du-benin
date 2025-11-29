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

    // Format message selon le plan
    const smsMessage = `Bonjour, je recherche un plombier. Veuillez me recontacter au ${clientPhone}. ${clientName}.${message ? ` ${message}` : ""}`;

    // Envoyer le SMS au plombier via ClickSend
    const smsResult = await smsService.sendSMS(plumber.telephone, smsMessage);

    // Vérifier que le modèle ContactRequest est disponible
    if (!prisma.contactRequest) {
      logger.error("Prisma ContactRequest model not available", new Error("Model not found"), {
        plumberId,
        clientName,
        clientPhone,
      });
      // On retourne quand même un succès car le SMS a été envoyé
      return NextResponse.json({
        success: true,
        message: "SMS envoyé avec succès. La prise de contact n'a pas pu être enregistrée.",
        smsSent: smsResult.success,
      });
    }

    // Sauvegarder la prise de contact dans la base de données
    const contactRequest = await prisma.contactRequest.create({
      data: {
        plumberId,
        clientName,
        clientPhone,
        message: message || null,
      },
    });

    if (!smsResult.success) {
      logger.warn("Failed to send SMS to plumber", undefined, {
        plumberId,
        plumberName: `${plumber.prenom} ${plumber.nom}`,
        clientName,
        clientPhone,
        error: smsResult.error,
        contactRequestId: contactRequest.id,
      });
      
      // On continue même si l'SMS échoue, on enregistre quand même la demande
    }
    
    logger.info("Contact request", {
      plumberId,
      plumberName: `${plumber.prenom} ${plumber.nom}`,
      clientName,
      clientPhone,
      smsSent: smsResult.success,
      contactRequestId: contactRequest.id,
    });

    return NextResponse.json({
      success: true,
      message: "Demande enregistrée avec succès",
      smsSent: smsResult.success,
      contactRequestId: contactRequest.id,
    });
  } catch (error) {
    logger.error("Contact plumber error", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
