import { Plumber as PrismaPlumber } from "@prisma/client";

export interface Plumber extends PrismaPlumber {}

export interface PlumberWithRating extends Omit<Plumber, "createdAt" | "updatedAt"> {
  averageRating: number;
  reviewCount: number;
}

export interface PlumberFormData {
  nom: string;
  prenom: string;
  telephone: string;
  departement: string;
  ville: string;
  quartier: string;
  adresse?: string;
  diplomeAnnee: number;
  diplomeFileUrl: string;
}

export interface PlumberQRData {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  ville: string;
  quartier: string;
  departement: string;
  isVerified: boolean;
  hasPaid: boolean;
  membershipId: string | null;
  profileUrl: string;
}
