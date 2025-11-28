import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if plumber exists
        const existingPlumber = await prisma.plumber.findUnique({
            where: { id },
        });

        if (!existingPlumber) {
            return NextResponse.json(
                { error: "Dossier non trouvé" },
                { status: 404 }
            );
        }

        // Check if already paid
        if (existingPlumber.hasPaid) {
            return NextResponse.json(
                { error: "Ce dossier a déjà été payé" },
                { status: 400 }
            );
        }

        // Generate payment reference
        const paymentReference = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Generate membership ID (format: BEN-PLOMB-YYYY-XXXX)
        const year = new Date().getFullYear();
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const membershipId = `BEN-PLOMB-${year}-${randomId}`;

        // Create payment record (simulated successful payment)
        const payment = await prisma.payment.create({
            data: {
                amount: 5000, // 5000 FCFA (example amount)
                reference: paymentReference,
                status: "SUCCESS",
                plumberId: id,
            },
        });

        // Update plumber status and generate membership ID
        const updatedPlumber = await prisma.plumber.update({
            where: { id },
            data: {
                membershipId,
                hasPaid: true,
                isVerified: true, // Automatically verify after payment
            },
        });

        logger.info("Payment processed successfully", {
            plumberId: id,
            paymentId: payment.id,
            reference: paymentReference
        });

        return NextResponse.json({
            success: true,
            payment: {
                id: payment.id,
                reference: payment.reference,
                amount: payment.amount,
                status: payment.status,
            },
            plumber: {
                id: updatedPlumber.id,
                membershipId: updatedPlumber.membershipId,
                hasPaid: updatedPlumber.hasPaid,
                isVerified: updatedPlumber.isVerified,
            },
        });
    } catch (error) {
        logger.error("Error processing payment", error instanceof Error ? error : new Error(String(error)));
        return NextResponse.json(
            { error: "Erreur lors du traitement du paiement" },
            { status: 500 }
        );
    }
}
