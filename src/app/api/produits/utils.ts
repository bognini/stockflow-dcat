import { z } from 'zod';
import { Buffer } from 'buffer';

export const toOptionalNumber = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
};

export const toOptionalInteger = (value: unknown) => {
  const parsed = toOptionalNumber(value);
  if (parsed === undefined) {
    return undefined;
  }

  const intValue = Math.trunc(parsed);
  return Number.isNaN(intValue) ? undefined : intValue;
};

export const imageSchema = z.object({
  filename: z.string().min(1),
  mime: z.string().min(1),
  data: z.string().min(1),
});

export const productSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  modeleId: z.string().uuid(),
  marqueId: z.string().uuid(),
  categorieId: z.string().uuid(),
  description: z.string().optional(),
  sku: z.string().optional(),
  gtin: z.string().optional(),
  poids: z.preprocess(toOptionalNumber, z.number().optional()),
  couleur: z.string().optional(),
  emplacementId: z.string().uuid().optional(),
  prixAchat: z.preprocess(toOptionalNumber, z.number().optional()),
  coutLogistique: z.preprocess(toOptionalNumber, z.number().optional()),
  prixVente: z.preprocess(toOptionalNumber, z.number().optional()),
  quantite: z.preprocess(toOptionalInteger, z.number().int().optional()),
  serialNumbers: z.array(z.string()).optional(),
  images: z
    .array(imageSchema)
    .min(1, 'Au moins une image est requise')
    .max(6, 'Maximum 6 images autorisées'),
});

export type SerializedImage = {
  id: string;
  filename: string;
  mime: string;
  data: string | null;
  order: number;
  createdAt: string;
};

export const serializeImage = (image: {
  id: string;
  filename: string;
  mime: string;
  data: Buffer | null;
  sortOrder: number;
  createdAt: Date;
}): SerializedImage => ({
  id: image.id,
  filename: image.filename,
  mime: image.mime,
  data: image.data ? image.data.toString('base64') : null,
  order: image.sortOrder,
  createdAt: image.createdAt.toISOString(),
});
