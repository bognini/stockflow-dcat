import type { Produit, Marque, Modele, Categorie, ProduitImage } from '@prisma/client';

export type ProductWithRelations = Produit & {
  marque: Marque;
  modele: Modele;
  categorie: Categorie;
  images: ProduitImage[];
};

export type CategoryWithCount = Categorie & {
  _count: {
    produits: number;
  };
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA';
}

export function calculateDiscount(originalPrice: number, promoPrice: number): number {
  return Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
}
