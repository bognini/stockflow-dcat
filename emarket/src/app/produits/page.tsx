import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { ProductWithRelations, CategoryWithCount } from '@/lib/types';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

async function getProducts(categorieId?: string, marqueId?: string, search?: string) {
  const products = await prisma.produit.findMany({
    where: {
      isPublished: true,
      quantite: { gt: 0 },
      ...(categorieId && { categorieId }),
      ...(marqueId && { marqueId }),
      ...(search && {
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { marque: { nom: { contains: search, mode: 'insensitive' } } },
          { modele: { nom: { contains: search, mode: 'insensitive' } } },
        ],
      }),
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
    orderBy: { nom: 'asc' },
  });
  return products as ProductWithRelations[];
}

async function getFilters() {
  const [categories, marques] = await Promise.all([
    prisma.categorie.findMany({
      include: {
        _count: {
          select: { produits: { where: { isPublished: true, quantite: { gt: 0 } } } },
        },
      },
      orderBy: { nom: 'asc' },
    }),
    prisma.marque.findMany({
      include: {
        _count: {
          select: { produits: { where: { isPublished: true, quantite: { gt: 0 } } } },
        },
      },
      orderBy: { nom: 'asc' },
    }),
  ]);
  return { categories: categories as CategoryWithCount[], marques };
}

export default async function ProduitsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categorieId = typeof params.categorie === 'string' ? params.categorie : undefined;
  const marqueId = typeof params.marque === 'string' ? params.marque : undefined;
  const search = typeof params.q === 'string' ? params.q : undefined;

  const [products, filters] = await Promise.all([
    getProducts(categorieId, marqueId, search),
    getFilters(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {search ? `Résultats pour "${search}"` : 'Tous les produits'}
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar - collapsible on mobile */}
        <ProductFilters
          categories={filters.categories}
          marques={filters.marques}
          selectedCategorieId={categorieId}
          selectedMarqueId={marqueId}
        />

        {/* Products grid */}
        <div className="flex-1">
          {products.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucun produit trouvé</p>
              <a href="/produits" className="text-blue-600 hover:underline mt-2 inline-block">
                Voir tous les produits
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
