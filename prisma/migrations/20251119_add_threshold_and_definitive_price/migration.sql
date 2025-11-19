-- Add optional alert threshold to products
ALTER TABLE "Produit"
ADD COLUMN "seuilAlerte" INTEGER;

-- Store definitive sale price on stock movements
ALTER TABLE "MouvementStock"
ADD COLUMN "prixVenteDefinitif" DOUBLE PRECISION;
