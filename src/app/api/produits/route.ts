import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Buffer } from 'buffer';
import { z } from 'zod';
import {
  productSchema,
  serializeImage,
} from './utils';

export async function GET() {
  try {
    // Don't load image data in list view for performance - only load metadata
    const produits = await prisma.produit.findMany({
      include: {
        marque: true,
        emplacement: true,
        modele: {
          include: {
            categorie: true,
          }
        },
        images: {
          select: {
            id: true,
            filename: true,
            mime: true,
            sortOrder: true,
            createdAt: true,
            // Explicitly exclude 'data' field for performance
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        nom: 'asc',
      }
    });
    // Map images without data field (data will be null)
    const serialized = produits.map((produit) => ({
      ...produit,
      images: produit.images.map((img) => ({
        id: img.id,
        filename: img.filename,
        mime: img.mime,
        data: null, // No image data in list view
        order: img.sortOrder,
        createdAt: img.createdAt.toISOString(),
      })),
    }));
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('[API_PRODUITS_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = productSchema.parse(body);

    const produit = await prisma.$transaction(async (tx) => {
      const created = await tx.produit.create({
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
          quantite: data.quantite ?? 0,
          marqueId: data.marqueId,
          modeleId: data.modeleId,
          categorieId: data.categorieId,
          serialNumbers: data.serialNumbers ?? [],
          emplacementId: data.emplacementId,
        },
      });

      await tx.produitImage.createMany({
        data: data.images.map((image, index) => ({
          produitId: created.id,
          filename: image.filename,
          mime: image.mime,
          data: Buffer.from(image.data, 'base64'),
          sortOrder: index,
        })),
      });

      const images = await tx.produitImage.findMany({
        where: { produitId: created.id },
        orderBy: { sortOrder: 'asc' },
      });

      return {
        ...created,
        images: images.map(serializeImage),
      };
    });

    return NextResponse.json(produit, { status: 201 });
  } catch (error) {
    console.error('[API_PRODUITS_POST_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
