-- CreateTable
CREATE TABLE "Categorie" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marque" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Marque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modele" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL,
    "marqueId" TEXT NOT NULL,

    CONSTRAINT "Modele_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "gtin" TEXT,
    "poids" DOUBLE PRECISION,
    "couleur" TEXT,
    "prixAchat" DOUBLE PRECISION,
    "coutLogistique" DOUBLE PRECISION,
    "prixVente" DOUBLE PRECISION,
    "quantite" INTEGER NOT NULL DEFAULT 0,
    "serialNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "marqueId" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL,
    "modeleId" TEXT NOT NULL,
    "emplacementId" TEXT,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProduitImage" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProduitImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emplacement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Emplacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fournisseur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Fournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MouvementStock" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "produitId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "demandeurId" TEXT,
    "fournisseurId" TEXT,
    "destination" TEXT,
    "projetId" TEXT,
    "serialNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "justificatifFilename" TEXT,
    "justificatifMime" TEXT,
    "justificatifData" BYTEA,

    CONSTRAINT "MouvementStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partenaire" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "contactNom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone1" TEXT NOT NULL,
    "telephone2" TEXT,

    CONSTRAINT "Partenaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projet" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "partenaireId" TEXT NOT NULL,

    CONSTRAINT "Projet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailConfig" (
    "id" TEXT NOT NULL,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "notificationEmails" TEXT[],

    CONSTRAINT "MailConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categorie_nom_key" ON "Categorie"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Marque_nom_key" ON "Marque"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Modele_nom_marqueId_key" ON "Modele"("nom", "marqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Produit_sku_key" ON "Produit"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Produit_gtin_key" ON "Produit"("gtin");

-- CreateIndex
CREATE INDEX "Produit_marqueId_idx" ON "Produit"("marqueId");

-- CreateIndex
CREATE INDEX "Produit_categorieId_idx" ON "Produit"("categorieId");

-- CreateIndex
CREATE INDEX "Produit_modeleId_idx" ON "Produit"("modeleId");

-- CreateIndex
CREATE INDEX "ProduitImage_produitId_idx" ON "ProduitImage"("produitId");

-- CreateIndex
CREATE UNIQUE INDEX "Emplacement_nom_key" ON "Emplacement"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Fournisseur_nom_key" ON "Fournisseur"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Partenaire_nom_key" ON "Partenaire"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_username_key" ON "Utilisateur"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- AddForeignKey
ALTER TABLE "Modele" ADD CONSTRAINT "Modele_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modele" ADD CONSTRAINT "Modele_marqueId_fkey" FOREIGN KEY ("marqueId") REFERENCES "Marque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produit" ADD CONSTRAINT "Produit_marqueId_fkey" FOREIGN KEY ("marqueId") REFERENCES "Marque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produit" ADD CONSTRAINT "Produit_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produit" ADD CONSTRAINT "Produit_modeleId_fkey" FOREIGN KEY ("modeleId") REFERENCES "Modele"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produit" ADD CONSTRAINT "Produit_emplacementId_fkey" FOREIGN KEY ("emplacementId") REFERENCES "Emplacement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduitImage" ADD CONSTRAINT "ProduitImage_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementStock" ADD CONSTRAINT "MouvementStock_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementStock" ADD CONSTRAINT "MouvementStock_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementStock" ADD CONSTRAINT "MouvementStock_demandeurId_fkey" FOREIGN KEY ("demandeurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementStock" ADD CONSTRAINT "MouvementStock_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MouvementStock" ADD CONSTRAINT "MouvementStock_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "Projet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projet" ADD CONSTRAINT "Projet_partenaireId_fkey" FOREIGN KEY ("partenaireId") REFERENCES "Partenaire"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

