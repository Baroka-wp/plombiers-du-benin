"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sanitizeString, sanitizeText, sanitizeUrl, sanitizePhone } from "@/lib/sanitize";
import { logger } from "@/lib/logger";

// Validation téléphone béninois: 8 chiffres commençant par 90-99
const beninPhoneRegex = /^(9[0-9])\d{6}$/;

const RegisterSchema = z.object({
    nom: z.string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(100, "Le nom ne peut pas dépasser 100 caractères")
        .refine((val) => /^[a-zA-ZÀ-ÿ\s'-]+$/.test(val), "Le nom ne peut contenir que des lettres"),
    prenom: z.string()
        .min(2, "Le prénom doit contenir au moins 2 caractères")
        .max(100, "Le prénom ne peut pas dépasser 100 caractères")
        .refine((val) => /^[a-zA-ZÀ-ÿ\s'-]+$/.test(val), "Le prénom ne peut contenir que des lettres"),
    telephone: z.string()
        .regex(beninPhoneRegex, "Le numéro de téléphone doit être un numéro béninois valide (8 chiffres commençant par 90-99)")
        .refine((val) => {
            // Vérifier que c'est bien 8 chiffres
            const cleaned = val.replace(/\s+/g, '');
            return cleaned.length === 8 && beninPhoneRegex.test(cleaned);
        }, "Format invalide. Exemple: 97000000"),
    departement: z.string()
        .min(1, "Le département est requis")
        .max(100, "Le département ne peut pas dépasser 100 caractères"),
    ville: z.string()
        .min(1, "La ville est requise")
        .max(100, "La ville ne peut pas dépasser 100 caractères"),
    quartier: z.string()
        .min(1, "Le quartier est requis")
        .max(100, "Le quartier ne peut pas dépasser 100 caractères"),
    adresse: z.string()
        .max(200, "L'adresse ne peut pas dépasser 200 caractères")
        .optional(),
    diplomeAnnee: z.coerce.number().min(1950).max(new Date().getFullYear()),
    diplomeFileUrl: z.string().min(1, "Le fichier du diplôme est requis"),
});

import { PlumberFormData } from "@/types/plumber";

export type RegisterState = {
    errors?: {
        [key: string]: string[];
    };
    message?: string;
    success?: boolean;
    payload?: Partial<PlumberFormData>;
};

export async function registerPlumber(prevState: RegisterState, formData: FormData) {
    // Récupérer le fichier
    const diplomeFile = formData.get("diplomeFile") as File | null;

    // Sanitize all inputs before validation
    const rawData = {
        nom: sanitizeString(formData.get("nom") as string | null),
        prenom: sanitizeString(formData.get("prenom") as string | null),
        telephone: sanitizePhone(formData.get("telephone") as string | null),
        departement: sanitizeString(formData.get("departement") as string | null),
        ville: sanitizeString(formData.get("ville") as string | null),
        quartier: sanitizeString(formData.get("quartier") as string | null),
        adresse: sanitizeText((formData.get("adresse") as string | null) || undefined),
        diplomeAnnee: formData.get("diplomeAnnee") as string | null,
        diplomeFileUrl: diplomeFile ? "temp" : "", // Temporaire pour la validation
    };

    const validatedFields = RegisterSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Veuillez corriger les erreurs dans le formulaire.",
            success: false,
            payload: rawData,
        };
    }

    const {
        nom, prenom, telephone: rawTelephone, departement, ville, quartier, adresse,
        diplomeAnnee
    } = validatedFields.data;

    // Nettoyer le numéro de téléphone (enlever espaces, etc.)
    const telephone = rawTelephone.replace(/\s+/g, '');

    let plumberId: string | null = null;
    let diplomaUrl = "";

    try {
        // Upload du diplôme vers Cloudinary si un fichier est fourni
        if (diplomeFile) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", diplomeFile);

            const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/upload`, {
                method: "POST",
                body: uploadFormData,
            });

            if (!uploadResponse.ok) {
                throw new Error("Erreur lors de l'upload du diplôme");
            }

            const uploadData = await uploadResponse.json();
            diplomaUrl = uploadData.url;
        } else {
            return {
                message: "Veuillez sélectionner un fichier pour votre diplôme.",
                success: false,
                payload: rawData,
            };
        }
        // Check if phone already exists
        const existingPlumber = await prisma.plumber.findUnique({
            where: { telephone },
        });

        if (existingPlumber) {
            return {
                message: "Ce numéro de téléphone est déjà enregistré.",
                success: false,
                payload: rawData,
            };
        }

        const newPlumber = await prisma.plumber.create({
            data: {
                nom,
                prenom,
                telephone,
                departement,
                ville,
                quartier,
                adresse: adresse || null,
                diplomeAnnee,
                diplomeFileUrl: diplomaUrl,
            },
        });

        plumberId = newPlumber.id;
        revalidatePath("/annuaire");

    } catch (error) {
        logger.error("Registration error", error instanceof Error ? error : new Error(String(error)), {
            telephone: rawTelephone,
            departement,
            ville,
        });
        return {
            message: "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
            success: false,
            payload: rawData,
        };
    }

    if (plumberId) {
        redirect(`/badge/${plumberId}`);
    }

    return {
        message: "Une erreur inattendue est survenue.",
        success: false,
        payload: rawData,
    };
}
