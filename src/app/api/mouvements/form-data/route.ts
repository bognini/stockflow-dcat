import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [produits, utilisateurs, partenaires, fournisseurs] = await Promise.all([
      prisma.produit.findMany({
        include: { marque: true, modele: true },
        orderBy: { nom: 'asc' },
      }),
      prisma.utilisateur.findMany(),
      prisma.partenaire.findMany(),
      prisma.fournisseur.findMany(),
    ]);

    return NextResponse.json({ produits, utilisateurs, partenaires, fournisseurs });
  } catch (error) {
    console.error('[API_MOUVEMENT_FORMDATA_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
