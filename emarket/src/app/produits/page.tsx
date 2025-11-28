import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import { ProductWithRelations, CategoryWithCount } from '@/lib/types';

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
        {/* Filters sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
            <h2 className="font-semibold mb-4">Filtres</h2>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Catégories</h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="/produits"
                    className={`block py-1 text-sm ${!categorieId ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    Toutes les catégories
                  </a>
                </li>
                {filters.categories.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href={`/produits?categorie=${cat.id}`}
                      className={`block py-1 text-sm ${categorieId === cat.id ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      {cat.nom} ({cat._count.produits})
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Marques */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Marques</h3>
              <ul className="space-y-1">
                {filters.marques.map((marque) => (
                  <li key={marque.id}>
                    <a
                      href={`/produits?marque=${marque.id}${categorieId ? `&categorie=${categorieId}` : ''}`}
                      className={`block py-1 text-sm ${marqueId === marque.id ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      {marque.nom} ({marque._count.produits})
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

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
