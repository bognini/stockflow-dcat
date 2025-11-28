import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import { Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Promotions - DCAT E-Market',
  description: 'Découvrez nos meilleures offres et promotions sur les équipements audiovisuels, informatiques et domotiques.',
};

async function getPromoProducts() {
  const now = new Date();
  return prisma.produit.findMany({
    where: {
      isPublished: true,
      quantite: { gt: 0 },
      promoPrice: { not: null },
      OR: [
        { promoStart: null, promoEnd: null },
        { promoStart: { lte: now }, promoEnd: { gte: now } },
      ],
    },
    include: {
      marque: true,
      modele: true,
      categorie: true,
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
    },
  });
}

export default async function PromotionsPage() {
  const products = await getPromoProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Tag className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions</h1>
          <p className="text-gray-600">Profitez de nos meilleures offres du moment</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucune promotion en cours</h2>
          <p className="text-gray-500">Revenez bientôt pour découvrir nos nouvelles offres !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
