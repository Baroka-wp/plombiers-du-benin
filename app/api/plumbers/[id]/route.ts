import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { diplomeFileUrl, photoUrl, nom, prenom, departement, ville, quartier } = body;

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

        // Build update object with only provided fields
        const updateData: any = {};
        if (diplomeFileUrl !== undefined) {
            updateData.diplomeFileUrl = diplomeFileUrl;
        }
        if (photoUrl !== undefined) {
            updateData.photoUrl = photoUrl;
        }
        if (nom !== undefined) {
            updateData.nom = nom;
        }
        if (prenom !== undefined) {
            updateData.prenom = prenom;
        }
        if (departement !== undefined) {
            updateData.departement = departement;
        }
        if (ville !== undefined) {
            updateData.ville = ville;
        }
        if (quartier !== undefined) {
            updateData.quartier = quartier;
            updateData.adresse = quartier; // Also update adresse field
        }

        // Update plumber record
        const updatedPlumber = await prisma.plumber.update({
            where: { id },
            data: updateData,
        });

        logger.info("Plumber record updated", undefined, { plumberId: id });

        return NextResponse.json({
            id: updatedPlumber.id,
            diplomeFileUrl: updatedPlumber.diplomeFileUrl,
            photoUrl: updatedPlumber.photoUrl,
        });
    } catch (error) {
        logger.error("Error updating plumber", error instanceof Error ? error : new Error(String(error)));
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour du dossier" },
            { status: 500 }
        );
    }
}
