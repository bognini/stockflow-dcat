import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const bodySchema = z.object({
  confirmation: z.literal('DCAT'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    bodySchema.parse(body);

    await prisma.$transaction(async (tx) => {
      await tx.mouvementStock.deleteMany();
      await tx.produit.updateMany({
        data: {
          quantite: 0,
          serialNumbers: [],
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API_MOUVEMENTS_RESET_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Confirmation invalide', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
