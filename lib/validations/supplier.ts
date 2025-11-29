import { z } from 'zod';

// Schema pour créer/modifier un fournisseur
export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(200, 'Le nom est trop long'),
  type: z.enum(['magasin', 'fournisseur', 'détaillant'], {
    message: 'Le type doit être: magasin, fournisseur ou détaillant',
  }),
  phone: z.string().min(1, 'Le téléphone est requis').max(20),
  email: z.string().email('Email invalide').optional().nullable(),
  address: z.string().min(1, 'L\'adresse est requise').max(500),
  departement: z.string().min(1, 'Le département est requis').max(100),
  ville: z.string().min(1, 'La ville est requise').max(100),
  quartier: z.string().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  isActive: z.boolean().default(true),
});

// Schema pour mettre à jour un fournisseur
export const updateSupplierSchema = createSupplierSchema.partial().extend({
  id: z.string().uuid('ID invalide'),
});

// Schema pour les query params de recherche de fournisseurs
export const searchSuppliersQuerySchema = z.object({
  departement: z.string().max(100).optional(),
  ville: z.string().max(100).optional(),
  lat: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).pipe(z.number().min(-90).max(90)).optional(),
  lng: z.string().regex(/^-?\d+\.?\d*$/).transform(Number).pipe(z.number().min(-180).max(180)).optional(),
  radius: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(), // en km
});

