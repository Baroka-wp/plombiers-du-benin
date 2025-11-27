"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPlumber(id: string) {
    try {
        const plumber = await prisma.plumber.findUnique({
            where: { id },
        });
        return plumber;
    } catch (error) {
        console.error("Error fetching plumber:", error);
        return null;
    }
}

export async function updatePlumberPhoto(id: string, photoUrl: string) {
    try {
        await prisma.plumber.update({
            where: { id },
            data: { photoUrl },
        });
        revalidatePath(`/badge/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating photo:", error);
        return { success: false, error: "Failed to update photo" };
    }
}
