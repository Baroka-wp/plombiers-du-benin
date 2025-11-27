import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { telephone, password } = await request.json();

    // Validation
    if (!telephone || !password) {
      return NextResponse.json(
        { error: "Téléphone et mot de passe requis" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Vérifier que le plombier existe
    const plumber = await prisma.plumber.findUnique({
      where: { telephone },
    });

    if (!plumber) {
      return NextResponse.json(
        { error: "Aucun compte trouvé avec ce numéro de téléphone" },
        { status: 404 }
      );
    }

    // Vérifier si un mot de passe existe déjà
    if (plumber.password) {
      return NextResponse.json(
        { error: "Un mot de passe existe déjà pour ce compte. Utilisez la page de connexion." },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le plombier avec le mot de passe
    await prisma.plumber.update({
      where: { id: plumber.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Mot de passe créé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Setup password error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du mot de passe" },
      { status: 500 }
    );
  }
}

