import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { z } from 'zod';
import { productSchema, serializeImage } from '../utils';

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const { id } = paramsSchema.parse(context.params);
    const produit = await prisma.produit.findUnique({
      where: { id },
      include: {
        marque: true,
        emplacement: true,
        modele: {
          include: {
            categorie: true,
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!produit) {
      return new NextResponse('Produit non trouvé', { status: 404 });
    }

    return NextResponse.json({
      ...produit,
      images: produit.images.map(serializeImage),
    });
  } catch (error) {
    console.error('[API_PRODUIT_DETAIL_GET_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid product id', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = paramsSchema.parse(context.params);
    const body = await req.json();
    const data = productSchema.parse(body);

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.produit.findUnique({ where: { id } });
      if (!existing) {
        throw new Error('Produit non trouvé');
      }

      const produit = await tx.produit.update({
        where: { id },
        data: {
          nom: data.nom,
          description: data.description,
          sku: data.sku,
          gtin: data.gtin,
          poids: data.poids,
          couleur: data.couleur,
          prixAchat: data.prixAchat,
          coutLogistique: data.coutLogistique,
          prixVente: data.prixVente,
          quantite: data.quantite ?? existing.quantite,
          marqueId: data.marqueId,
          modeleId: data.modeleId,
          categorieId: data.categorieId,
          serialNumbers: data.serialNumbers ?? existing.serialNumbers,
          emplacementId: data.emplacementId,
        },
      });

      await tx.produitImage.deleteMany({ where: { produitId: id } });
      await tx.produitImage.createMany({
        data: data.images.map((image, index) => ({
          produitId: id,
          filename: image.filename,
          mime: image.mime,
          data: Buffer.from(image.data, 'base64'),
          sortOrder: index,
        })),
      });

      const images = await tx.produitImage.findMany({
        where: { produitId: id },
        orderBy: { sortOrder: 'asc' },
      });

      return {
        ...produit,
        images: images.map(serializeImage),
      };
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API_PRODUIT_DETAIL_PATCH_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    return new NextResponse(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}
