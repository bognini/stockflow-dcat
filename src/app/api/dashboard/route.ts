import prisma from '@/lib/prisma';
import { subDays, startOfMonth } from 'date-fns';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Valeur totale du stock
    const produits = await prisma.produit.findMany();
    const valeurStock = produits.reduce((sum, p) => sum + (p.prixVente || 0) * p.quantite, 0);
    const totalArticles = produits.reduce((sum, p) => sum + p.quantite, 0);

    // Mouvements sur 30 jours
    const thirtyDaysAgo = subDays(new Date(), 30);
    const entrees30j = await prisma.mouvementStock.aggregate({
      where: {
        type: 'ENTREE',
        date: { gte: thirtyDaysAgo },
      },
      _sum: { quantite: true },
    });
    const sorties30j = await prisma.mouvementStock.aggregate({
      where: {
        type: 'SORTIE',
        date: { gte: thirtyDaysAgo },
      },
      _sum: { quantite: true },
    });

    // Activité récente
    const mouvementsRecents = await prisma.mouvementStock.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        produit: {
          include: {
            modele: true,
          }
        },
      },
    });

    // Mouvements par mois (6 derniers mois)
    const mouvementsParMois = [];
    for (let i = 5; i >= 0; i--) {
      const date = subDays(new Date(), i * 30);
      const start = startOfMonth(date);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

      const entrees = await prisma.mouvementStock.aggregate({
        _sum: { quantite: true },
        where: { type: 'ENTREE', date: { gte: start, lte: end } },
      });
      const sorties = await prisma.mouvementStock.aggregate({
        _sum: { quantite: true },
        where: { type: 'SORTIE', date: { gte: start, lte: end } },
      });
      
      mouvementsParMois.push({
        month: start.toLocaleString('fr-FR', { month: 'short' }),
        entrees: entrees._sum.quantite || 0,
        sorties: sorties._sum.quantite || 0,
      });
    }

    const stats = {
      valeurStock,
      totalArticles,
      entrees30j: entrees30j._sum.quantite || 0,
      sorties30j: sorties30j._sum.quantite || 0,
      mouvementsRecents,
      mouvementsParMois,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API_DASHBOARD_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
