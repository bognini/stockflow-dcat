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

const baseImageSchema = z.object({
  filename: z.string().min(1),
  mime: z.string().min(1),
  order: z.number().int().nonnegative().optional(),
});

const createImageSchema = baseImageSchema.extend({
  data: z.string().min(1),
});

const updateImageSchema = baseImageSchema.extend({
  id: z.string().uuid().optional(),
  data: z.string().optional(),
});

export const createProductSchema = z.object({
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
  seuilAlerte: z.preprocess(toOptionalInteger, z.number().int().positive().optional()),
  quantite: z.preprocess(toOptionalInteger, z.number().int().optional()),
  serialNumbers: z.array(z.string()).optional(),
  images: z
    .array(createImageSchema)
    .min(1, 'Au moins une image est requise')
    .max(6, 'Maximum 6 images autorisées'),
  // Storefront fields
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  seoSlug: z.string().optional(),
  promoPrice: z.preprocess(toOptionalNumber, z.number().positive().optional()),
  promoStart: z.string().datetime().optional().nullable(),
  promoEnd: z.string().datetime().optional().nullable(),
});

export const updateProductSchema = z
  .object({
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
    seuilAlerte: z.preprocess(toOptionalInteger, z.number().int().positive().optional()),
    quantite: z.preprocess(toOptionalInteger, z.number().int().optional()),
    serialNumbers: z.array(z.string()).optional(),
    images: z
      .array(updateImageSchema)
      .min(1, 'Au moins une image est requise')
      .max(6, 'Maximum 6 images autorisées'),
    // Storefront fields
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    seoSlug: z.string().optional(),
    promoPrice: z.preprocess(toOptionalNumber, z.number().positive().optional().nullable()),
    promoStart: z.string().datetime().optional().nullable(),
    promoEnd: z.string().datetime().optional().nullable(),
  })
  .superRefine((value, ctx) => {
    value.images.forEach((image, index) => {
      const isExisting = Boolean(image.id);
      const hasData = Boolean(image.data && image.data.length);
      if (!isExisting && !hasData) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['images', index, 'data'],
          message: 'Les nouvelles images doivent inclure des données encodées en base64.',
        });
      }
    });
  });

export type SerializedImage = {
  id: string;
  filename: string;
  mime: string;
  data: string | null;
  order: number;
  createdAt: string;
  url: string | null;
};

type PrismaImage = {
  id: string;
  produitId?: string;
  filename: string;
  mime: string;
  data?: Buffer | Uint8Array | null;
  sortOrder: number;
  createdAt: Date;
};

type SerializeImageOptions = {
  includeData?: boolean;
  productId?: string;
};

export const serializeImage = (
  image: PrismaImage,
  options: SerializeImageOptions = {}
): SerializedImage => {
  const { includeData = false, productId } = options;
  const resolvedProductId = productId ?? (image as PrismaImage & { produitId?: string }).produitId;
  const normalizedData = image.data
    ? image.data instanceof Buffer
      ? image.data
      : Buffer.from(image.data)
    : null;

  return {
    id: image.id,
    filename: image.filename,
    mime: image.mime,
    data: includeData && normalizedData ? normalizedData.toString('base64') : null,
    order: image.sortOrder,
    createdAt: image.createdAt.toISOString(),
    url: resolvedProductId ? `/api/produits/${resolvedProductId}/images/${image.id}` : null,
  };
};
