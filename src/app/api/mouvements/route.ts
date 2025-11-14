import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { z } from 'zod';

const mouvementSchema = z.object({
  produitId: z.string().uuid(),
  quantite: z.number().int().min(1),
  type: z.enum(['ENTREE', 'SORTIE']),
  utilisateurId: z.string().uuid(),
  fournisseurId: z.string().uuid().optional(),
  demandeurId: z.string().uuid().optional(),
  destination: z.string().optional(),
  projetId: z.string().uuid().optional(),
  serialNumbers: z.array(z.string()).optional(),
  justificatif: z
    .object({
      filename: z.string(),
      mime: z.string(),
      data: z.string(),
    })
    .optional(),
});

export async function GET() {
  try {
    const mouvements = await prisma.mouvementStock.findMany({
      orderBy: { date: 'desc' },
      include: {
        produit: { include: { modele: true, marque: true } },
        utilisateur: true,
        demandeur: true,
        fournisseur: true,
        projet: true,
      },
    });
    return NextResponse.json(mouvements);
  } catch (error) {
    console.error('[API_MOUVEMENTS_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = mouvementSchema.parse(body);

    const result = await prisma.$transaction(async (tx) => {
      const produit = await tx.produit.findUnique({
        where: { id: data.produitId },
      });

      if (!produit) {
        throw new Error('Produit non trouvé');
      }

      let newQuantite: number;
      let updatedSerialNumbers = produit.serialNumbers ?? [];
      const serialNumbersInput = data.serialNumbers ?? [];

      if (data.type === 'ENTREE') {
        newQuantite = produit.quantite + data.quantite;
        if (serialNumbersInput.length > 0) {
          const existingSet = new Set(updatedSerialNumbers);
          serialNumbersInput.forEach((sn) => {
            if (!existingSet.has(sn)) {
              updatedSerialNumbers.push(sn);
              existingSet.add(sn);
            }
          });
        }
      } else { // SORTIE
        if (produit.quantite < data.quantite) {
          throw new Error('Stock insuffisant');
        }
        if (serialNumbersInput.length > 0) {
          const missingSerials = serialNumbersInput.filter((sn) => !updatedSerialNumbers.includes(sn));
          if (missingSerials.length > 0) {
            throw new Error(`Numéros de série introuvables: ${missingSerials.join(', ')}`);
          }
          if (serialNumbersInput.length > data.quantite) {
            throw new Error('Trop de numéros de série sélectionnés pour la quantité demandée');
          }
          updatedSerialNumbers = updatedSerialNumbers.filter((sn) => !serialNumbersInput.includes(sn));
        }
        newQuantite = produit.quantite - data.quantite;
      }

      await tx.produit.update({
        where: { id: data.produitId },
        data: {
          quantite: newQuantite,
          serialNumbers: updatedSerialNumbers,
        },
      });

      const newMouvement = await tx.mouvementStock.create({
        data: {
          produitId: data.produitId,
          quantite: data.quantite,
          type: data.type,
          utilisateurId: data.utilisateurId,
          fournisseurId: data.fournisseurId,
          demandeurId: data.demandeurId,
          destination: data.destination,
          projetId: data.projetId,
          serialNumbers: serialNumbersInput,
          justificatifFilename: data.justificatif?.filename,
          justificatifMime: data.justificatif?.mime,
          justificatifData: data.justificatif ? Buffer.from(data.justificatif.data, 'base64') : undefined,
        },
        include: {
          produit: { include: { modele: true, marque: true } },
          utilisateur: true,
          demandeur: true,
          fournisseur: true,
          projet: true,
        },
      });

      return newMouvement;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('[API_MOUVEMENTS_POST_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    return new NextResponse(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}
