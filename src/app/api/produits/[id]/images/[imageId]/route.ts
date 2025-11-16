import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().uuid(),
  imageId: z.string().uuid(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const params = await context.params;
    const { id, imageId } = paramsSchema.parse(params);

    const image = await prisma.produitImage.findFirst({
      where: {
        id: imageId,
        produitId: id,
      },
    });

    if (!image || !image.data) {
      return new NextResponse('Image non trouvée', { status: 404 });
    }

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(image.data);
        controller.close();
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': image.mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('[API_PRODUIT_IMAGE_GET_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid parameters', { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
