-- Add missing serialNumbers array columns for Produit and MouvementStock
ALTER TABLE "Produit"
    ADD COLUMN "serialNumbers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "MouvementStock"
    ADD COLUMN "serialNumbers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
