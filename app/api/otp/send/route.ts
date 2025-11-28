import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { smsService } from "@/lib/sms";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { telephone } = await request.json();

    if (!telephone) {
      return NextResponse.json(
        { error: "Numéro de téléphone requis" },
        { status: 400 }
      );
    }

    // Validate phone format (8 or 10 digits)
    const cleanedPhone = telephone.replace(/\s/g, '');
    if (!/^[0-9]{8}$/.test(cleanedPhone) && !/^[0-9]{10}$/.test(cleanedPhone)) {
      return NextResponse.json(
        { error: "Le numéro doit contenir 8 ou 10 chiffres" },
        { status: 400 }
      );
    }

    // Send OTP via Termii
    const result = await smsService.sendOTP(cleanedPhone);

    if (!result.success) {
      logger.error("Failed to send OTP SMS", new Error(result.error || "Unknown error"), {
        userId: session.user.id,
        phone: cleanedPhone,
      });

      return NextResponse.json(
        { error: result.error || "Erreur lors de l'envoi du code" },
        { status: 500 }
      );
    }

    logger.info("OTP sent successfully", {
      userId: session.user.id,
      phone: cleanedPhone,
      pinId: result.pinId,
    });

    return NextResponse.json({
      success: true,
      message: "Code envoyé par SMS",
      pinId: result.pinId, // Nécessaire pour vérifier ensuite
    });
  } catch (error) {
    logger.error("Send OTP error", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du code" },
      { status: 500 }
    );
  }
}
