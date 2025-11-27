"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Validation téléphone béninois: 8 chiffres commençant par 90-99
const beninPhoneRegex = /^(9[0-9])\d{6}$/;

const RegisterSchema = z.object({
    nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    telephone: z.string()
        .regex(beninPhoneRegex, "Le numéro de téléphone doit être un numéro béninois valide (8 chiffres commençant par 90-99)")
        .refine((val) => {
            // Vérifier que c'est bien 8 chiffres
            const cleaned = val.replace(/\s+/g, '');
            return cleaned.length === 8 && beninPhoneRegex.test(cleaned);
        }, "Format invalide. Exemple: 97000000"),
    departement: z.string().min(1, "Le département est requis"),
    ville: z.string().min(1, "La ville est requise"),
    quartier: z.string().min(1, "Le quartier est requis"),
    adresse: z.string().optional(),
    diplomeAnnee: z.coerce.number().min(1950).max(new Date().getFullYear()),
    diplomeFileUrl: z.string().url("L'URL du diplôme est invalide"),
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
    const rawData = {
        nom: formData.get("nom"),
        prenom: formData.get("prenom"),
        telephone: formData.get("telephone"),
        departement: formData.get("departement"),
        ville: formData.get("ville"),
        quartier: formData.get("quartier"),
        adresse: formData.get("adresse"),
        diplomeAnnee: formData.get("diplomeAnnee"),
        diplomeFileUrl: formData.get("diplomeFileUrl"),
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
        diplomeAnnee, diplomeFileUrl
    } = validatedFields.data;

    // Nettoyer le numéro de téléphone (enlever espaces, etc.)
    const telephone = rawTelephone.replace(/\s+/g, '');

    let plumberId: string | null = null;

    try {
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
                diplomeFileUrl,
            },
        });

        plumberId = newPlumber.id;
        revalidatePath("/annuaire");

    } catch (error) {
        console.error("Registration error:", error);
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
