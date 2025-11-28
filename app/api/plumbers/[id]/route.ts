import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Récupérer le plombier avec ses statistiques
        const plumber = await prisma.plumber.findUnique({
            where: { id },
            include: {
                reviews: {
                    select: {
                        rating: true,
                    },
                },
            },
        });

        if (!plumber) {
            return NextResponse.json(
                { error: "Plombier non trouvé" },
                { status: 404 }
            );
        }

        // Calculer la note moyenne
        const averageRating =
            plumber.reviews.length > 0
                ? plumber.reviews.reduce((sum, review) => sum + review.rating, 0) /
                  plumber.reviews.length
                : 0;

        // Retourner les données sans le mot de passe
        const { password, ...plumberData } = plumber;

        return NextResponse.json({
            ...plumberData,
            averageRating: Number(averageRating.toFixed(1)),
            reviewCount: plumber.reviews.length,
            reviews: undefined, // Ne pas inclure les reviews dans la réponse
        });
    } catch (error) {
        logger.error("Error fetching plumber", error instanceof Error ? error : new Error(String(error)));
        return NextResponse.json(
            { error: "Erreur lors de la récupération du plombier" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { diplomeFileUrl, photoUrl, nom, prenom, telephone, departement, ville, quartier } = body;

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
        if (telephone !== undefined) {
            // Validate phone format (8 or 10 digits)
            const cleanedPhone = telephone.replace(/\s/g, ''); // Remove spaces
            if (!/^[0-9]{8}$/.test(cleanedPhone) && !/^[0-9]{10}$/.test(cleanedPhone)) {
                return NextResponse.json(
                    { error: "Le numéro de téléphone doit contenir 8 ou 10 chiffres" },
                    { status: 400 }
                );
            }
            updateData.telephone = cleanedPhone;
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

        logger.info("Plumber record updated", { plumberId: id });

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
