import { z } from 'zod';

// Schema pour créer/modifier un prix
export const createPriceSchema = z.object({
  partId: z.string().uuid('ID de pièce invalide'),
  supplierId: z.string().uuid('ID de fournisseur invalide'),
  price: z.number().positive('Le prix doit être positif').max(100000000, 'Prix trop élevé'),
  notes: z.string().max(1000).optional().nullable(),
});

// Schema pour mettre à jour un prix
export const updatePriceSchema = createPriceSchema.partial().extend({
  id: z.string().uuid('ID invalide'),
});

// Schema pour les query params de recherche de prix
export const searchPricesQuerySchema = z.object({
  lat: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).pipe(z.number().min(-90).max(90)).optional(),
  lng: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).pipe(z.number().min(-180).max(180)).optional(),
  radius: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(), // en km
});

// Schema pour l'import en masse
export const bulkPriceSchema = z.object({
  prices: z.array(createPriceSchema).min(1).max(1000, 'Maximum 1000 prix par import'),
});

