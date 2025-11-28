import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const image = await prisma.produitImage.findUnique({
      where: { id },
    });

    if (!image) {
      return new NextResponse('Image not found', { status: 404 });
    }

    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[IMAGE_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
