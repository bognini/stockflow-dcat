import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import { Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Nouveautés - DCAT E-Market',
  description: 'Découvrez les derniers produits ajoutés à notre catalogue.',
};

async function getNewProducts() {
  // Get recently published products (limited to 24)
  return prisma.produit.findMany({
    where: {
      isPublished: true,
      quantite: { gt: 0 },
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
    take: 24,
  });
}

export default async function NouveautesPage() {
  const products = await getNewProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveautés</h1>
          <p className="text-gray-600">Les derniers produits ajoutés à notre catalogue</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucune nouveauté récente</h2>
          <p className="text-gray-500">Revenez bientôt pour découvrir nos nouveaux produits !</p>
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
