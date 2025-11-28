-- AlterTable: Add storefront fields to Produit
ALTER TABLE "Produit" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Produit" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Produit" ADD COLUMN "seoSlug" TEXT;
ALTER TABLE "Produit" ADD COLUMN "promoPrice" DOUBLE PRECISION;
ALTER TABLE "Produit" ADD COLUMN "promoStart" TIMESTAMP(3);
ALTER TABLE "Produit" ADD COLUMN "promoEnd" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Produit_seoSlug_key" ON "Produit"("seoSlug");

-- CreateIndex
CREATE INDEX "Produit_isPublished_idx" ON "Produit"("isPublished");
