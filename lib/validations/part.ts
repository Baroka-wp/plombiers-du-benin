import { z } from 'zod';

// Schema pour créer une pièce
export const createPartSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(200, 'Le nom est trop long'),
  slug: z.string().min(1, 'Le slug est requis').max(200).regex(/^[a-z0-9-]+$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'),
  description: z.string().max(5000).optional().nullable(),
  reference: z.string().max(100).optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  categoryId: z.string().uuid('ID de catégorie invalide'),
  imageUrl: z.string().url('URL invalide').optional().nullable(),
  unit: z.string().max(20).default('pièce'),
  isActive: z.boolean().default(true),
});

// Schema pour mettre à jour une pièce
export const updatePartSchema = createPartSchema.partial().extend({
  id: z.string().uuid('ID invalide'),
});

// Schema pour les query params de recherche
export const searchPartsQuerySchema = z.object({
  category: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).default(20),
  sort: z.enum(['name', 'createdAt', 'price']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schema pour les query params de recherche full-text
export const fullTextSearchQuerySchema = z.object({
  q: z.string().min(1, 'Le terme de recherche est requis').max(200),
  category: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1)).default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).default(20),
});

