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

    const { pinId, code } = await request.json();

    if (!pinId || !code) {
      return NextResponse.json(
        { error: "Pin ID et code requis" },
        { status: 400 }
      );
    }

    // Verify OTP via ClickSend
    const result = await smsService.verifyOTP(pinId, code);

    if (!result.success) {
      logger.warn("OTP verification failed", undefined, {
        userId: session.user.id,
        pinId,
      });

      return NextResponse.json(
        { error: result.error || "Code invalide" },
        { status: 400 }
      );
    }

    logger.info("OTP verified successfully", {
      userId: session.user.id,
      pinId,
    });

    return NextResponse.json({
      success: true,
      message: "Code vérifié avec succès",
    });
  } catch (error) {
    logger.error("Verify OTP error", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}
