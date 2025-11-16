import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { z } from 'zod';
import { updateProductSchema, serializeImage } from '../utils';

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = paramsSchema.parse(params);
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
      images: produit.images.map((image) =>
        serializeImage(image, { includeData: false, productId: produit.id })
      ),
    });
  } catch (error) {
    console.error('[API_PRODUIT_DETAIL_GET_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid product id', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = paramsSchema.parse(params);

    await prisma.$transaction(async (tx) => {
      await tx.mouvementStock.deleteMany({ where: { produitId: id } });
      await tx.produitImage.deleteMany({ where: { produitId: id } });
      await tx.produit.delete({ where: { id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[API_PRODUIT_DETAIL_DELETE_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid product id', { status: 400 });
    }
    return new NextResponse(JSON.stringify({ error: (error as Error).message }), { status: 400 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const { id } = paramsSchema.parse(params);
    const body = await req.json();
    const data = updateProductSchema.parse(body);

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.produit.findUnique({
        where: { id },
        include: { images: true },
      });
      if (!existing) {
        throw new Error('Produit non trouvé');
      }

      await tx.produit.update({
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

      const existingImagesMap = new Map(existing.images.map((image) => [image.id, image]));

      const payloadImages = data.images.map((image, index) => ({
        ...image,
        order: image.order ?? index,
      }));

      const payloadIds = new Set(payloadImages.map((image) => image.id).filter(Boolean) as string[]);
      const idsToDelete = existing.images
        .filter((image) => !payloadIds.has(image.id))
        .map((image) => image.id);

      if (idsToDelete.length > 0) {
        await tx.produitImage.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      for (const [index, image] of payloadImages.entries()) {
        const sortOrder = image.order ?? index;
        if (image.id) {
          if (!existingImagesMap.has(image.id)) {
            throw new Error('Image introuvable pour ce produit');
          }
          const updateData: Record<string, unknown> = {
            filename: image.filename,
            mime: image.mime,
            sortOrder,
          };
          if (image.data) {
            updateData.data = Buffer.from(image.data, 'base64');
          }
          await tx.produitImage.update({
            where: { id: image.id },
            data: updateData,
          });
        } else {
          await tx.produitImage.create({
            data: {
              produitId: id,
              filename: image.filename,
              mime: image.mime,
              data: Buffer.from(image.data!, 'base64'),
              sortOrder,
            },
          });
        }
      }

      const produit = await tx.produit.findUnique({
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
        throw new Error('Produit non trouvé après mise à jour');
      }

      return {
        ...produit,
        images: produit.images.map((image) =>
          serializeImage(image, { includeData: false, productId: produit.id })
        ),
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
