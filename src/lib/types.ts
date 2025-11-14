import type { Buffer } from 'buffer';
import type { Produit as ProduitDB, Categorie as CategorieDB, Marque as MarqueDB, Modele as ModeleDB, Fournisseur as FournisseurDB, Emplacement as EmplacementDB, Partenaire as PartenaireDB, Projet as ProjetDB, Utilisateur as UtilisateurDB, MouvementStock as MouvementStockDB, MailConfig as MailConfigDB } from '@prisma/client';

export type ProduitImage = {
  id: string;
  filename: string;
  mime: string;
  data: string | null;
  order: number;
  createdAt: string;
};

export type Produit = ProduitDB & {
  marque: MarqueDB;
  modele: ModeleDB & { categorie: CategorieDB };
  emplacement: EmplacementDB | null;
  serialNumbers: string[];
  images: ProduitImage[];
};

export type MouvementStock = MouvementStockDB & {
  produit: Produit,
  utilisateur: UtilisateurDB,
  demandeur: UtilisateurDB | null,
  fournisseur: FournisseurDB | null,
  projet: ProjetDB | null,
  serialNumbers: string[],
  justificatifFilename: string | null,
  justificatifMime: string | null,
  justificatifData: Buffer | null,
};

export type Categorie = CategorieDB;
export type Marque = MarqueDB;
export type Modele = ModeleDB & { marque: MarqueDB, categorie: CategorieDB };
export type Fournisseur = FournisseurDB;
export type Emplacement = EmplacementDB;
export type Utilisateur = UtilisateurDB;
export type Partenaire = PartenaireDB;
export type Projet = ProjetDB & { partenaire: PartenaireDB };
export type MailConfig = MailConfigDB;

export type DashboardStats = {
  valeurStock: number;
  totalArticles: number;
  entrees30j: number;
  sorties30j: number;
  mouvementsRecents: MouvementStock[];
  mouvementsParMois: { month: string; entrees: number; sorties: number }[];
};
