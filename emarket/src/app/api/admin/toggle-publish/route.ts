import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { productId, isPublished } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await prisma.produit.update({
      where: { id: productId },
      data: { isPublished },
    });

    return NextResponse.json({ success: true, isPublished });
  } catch (error) {
    console.error('[TOGGLE_PUBLISH_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
