import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { productId, isFeatured } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await prisma.produit.update({
      where: { id: productId },
      data: { isFeatured },
    });

    return NextResponse.json({ success: true, isFeatured });
  } catch (error) {
    console.error('[TOGGLE_FEATURED_ERROR]', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
