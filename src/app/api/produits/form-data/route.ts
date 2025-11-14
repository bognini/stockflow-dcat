import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [marques, categories, modeles, emplacements] = await Promise.all([
      prisma.marque.findMany({ orderBy: { nom: 'asc' } }),
      prisma.categorie.findMany({ orderBy: { nom: 'asc' } }),
      prisma.modele.findMany({ orderBy: { nom: 'asc' }, include: { marque: true, categorie: true } }),
      prisma.emplacement.findMany({ orderBy: { nom: 'asc' } }),
    ]);

    return NextResponse.json({ marques, categories, modeles, emplacements });
  } catch (error) {
    console.error('[API_PRODUIT_FORMDATA_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
