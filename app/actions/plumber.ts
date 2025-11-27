"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function getPlumber(id: string) {
    try {
        const plumber = await prisma.plumber.findUnique({
            where: { id },
        });
        return plumber;
    } catch (error) {
        logger.error("Error fetching plumber", error instanceof Error ? error : new Error(String(error)), { plumberId: id });
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
        logger.error("Error updating photo", error instanceof Error ? error : new Error(String(error)), { plumberId: id, photoUrl });
        return { success: false, error: "Failed to update photo" };
    }
}
