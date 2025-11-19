import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  context: { params?: { id?: string } }
) {
  try {
    const mouvementId = context.params?.id;

    if (!mouvementId) {
      return NextResponse.json({ error: 'Identifiant de mouvement manquant.' }, { status: 400 });
    }

    const mouvement = await prisma.mouvementStock.findUnique({
      where: { id: mouvementId },
      select: {
        justificatifData: true,
        justificatifFilename: true,
        justificatifMime: true,
      },
    });

    if (!mouvement || !mouvement.justificatifData || !mouvement.justificatifFilename) {
      return NextResponse.json({ error: 'Aucun justificatif disponible pour ce mouvement.' }, { status: 404 });
    }

    const mime = mouvement.justificatifMime || 'application/octet-stream';

    return new NextResponse(mouvement.justificatifData, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(mouvement.justificatifFilename)}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[API_MOUVEMENTS_JUSTIFICATIF_ERROR]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
