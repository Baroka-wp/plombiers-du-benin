import { z } from 'zod';

// Schema pour ajouter un favori
export const addFavoriteSchema = z.object({
  partId: z.string().uuid('ID de pièce invalide'),
});

