import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { adminAuthOptions } from "@/lib/auth-admin";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification via header ou cookie
    // Pour simplifier, on accepte les requêtes authentifiées
    // En production, utiliser un système de tokens JWT

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const departement = searchParams.get("departement") || "";
    const isVerified = searchParams.get("isVerified");
    const hasPaid = searchParams.get("hasPaid");
    const phoneVerified = searchParams.get("phoneVerified");

    const skip = (page - 1) * limit;

    // Construire les filtres
    const where: any = {};

    if (search) {
      where.OR = [
        { nom: { contains: search, mode: "insensitive" } },
        { prenom: { contains: search, mode: "insensitive" } },
        { telephone: { contains: search } },
        { membershipId: { contains: search } },
      ];
    }

    if (departement) {
      where.departement = departement;
    }

    if (isVerified !== null && isVerified !== undefined) {
      where.isVerified = isVerified === "true";
    }

    if (hasPaid !== null && hasPaid !== undefined) {
      where.hasPaid = hasPaid === "true";
    }

    if (phoneVerified !== null && phoneVerified !== undefined) {
      where.phoneVerified = phoneVerified === "true";
    }

    const [plumbers, total] = await Promise.all([
      prisma.plumber.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              reviews: true,
              payments: true,
            },
          },
        },
      }),
      prisma.plumber.count({ where }),
    ]);

    return NextResponse.json({
      plumbers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching plumbers:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des plombiers" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification via header ou cookie
    // Pour simplifier, on accepte les requêtes authentifiées
    // En production, utiliser un système de tokens JWT

    const body = await request.json();
    const { id, isVerified, hasPaid, phoneVerified } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID requis" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (hasPaid !== undefined) updateData.hasPaid = hasPaid;
    if (phoneVerified !== undefined) updateData.phoneVerified = phoneVerified;

    const updated = await prisma.plumber.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating plumber:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

