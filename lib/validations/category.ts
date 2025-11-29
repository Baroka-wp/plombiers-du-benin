import { z } from 'zod';

// Schema pour créer/modifier une catégorie
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  slug: z.string().min(1, 'Le slug est requis').max(100).regex(/^[a-z0-9-]+$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'),
  description: z.string().max(1000).optional().nullable(),
  parentId: z.string().uuid('ID parent invalide').optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// Schema pour mettre à jour une catégorie
export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().uuid('ID invalide'),
});

