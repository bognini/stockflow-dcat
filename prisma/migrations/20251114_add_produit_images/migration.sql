CREATE TABLE "ProduitImage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "produitId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT "ProduitImage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ProduitImage_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ProduitImage_produitId_idx" ON "ProduitImage"("produitId");
