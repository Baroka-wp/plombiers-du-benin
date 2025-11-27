import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyOTP } from "@/lib/otp-store";
import { prisma } from "@/lib/prisma";
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

    const { telephone, code } = await request.json();

    if (!telephone || !code) {
      return NextResponse.json(
        { error: "Numéro et code requis" },
        { status: 400 }
      );
    }

    // Clean phone
    const cleanedPhone = telephone.replace(/\s/g, '');

    // Verify OTP
    const result = verifyOTP(cleanedPhone, code);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Update plumber phone and mark as verified
    await prisma.plumber.update({
      where: { id: session.user.id },
      data: {
        telephone: cleanedPhone,
        phoneVerified: true,
      },
    });

    logger.info("Phone verified successfully", undefined, {
      userId: session.user.id,
      phone: cleanedPhone,
    });

    return NextResponse.json({
      success: true,
      message: "Numéro vérifié avec succès",
    });
  } catch (error) {
    logger.error("Verify OTP error", error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}

