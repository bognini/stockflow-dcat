import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/types';
import Link from 'next/link';
import { Eye, Star, Tag, Package, AlertTriangle } from 'lucide-react';
import PublishToggle from './PublishToggle';
import FeaturedToggle from './FeaturedToggle';

export const dynamic = 'force-dynamic';

async function getProductStats() {
  const [total, published, featured, withPromo, outOfStock] = await Promise.all([
    prisma.produit.count(),
    prisma.produit.count({ where: { isPublished: true } }),
    prisma.produit.count({ where: { isFeatured: true } }),
    prisma.produit.count({ where: { promoPrice: { not: null } } }),
    prisma.produit.count({ where: { quantite: { lte: 0 } } }),
  ]);

  return { total, published, featured, withPromo, outOfStock };
}

async function getProducts() {
  return prisma.produit.findMany({
    include: {
      marque: true,
      modele: true,
      categorie: true,
      images: { take: 1, orderBy: { sortOrder: 'asc' } },
    },
    take: 50,
  });
}

async function getActivePromos() {
  const now = new Date();
  return prisma.produit.findMany({
    where: {
      promoPrice: { not: null },
      OR: [
        { promoStart: null, promoEnd: null },
        { promoStart: { lte: now }, promoEnd: { gte: now } },
      ],
    },
    include: {
      marque: true,
      modele: true,
    },
    orderBy: { promoEnd: 'asc' },
    take: 10,
  });
}

export default async function AdminPage() {
  const [stats, products, activePromos] = await Promise.all([
    getProductStats(),
    getProducts(),
    getActivePromos(),
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin E-Market</h1>
              <p className="text-sm text-gray-500">Gestion rapide du catalogue</p>
            </div>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ← Retour à la boutique
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500">Total produits</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-xs text-gray-500">Publiés</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.featured}</p>
                <p className="text-xs text-gray-500">En vedette</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <Tag className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.withPromo}</p>
                <p className="text-xs text-gray-500">En promo</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
                <p className="text-xs text-gray-500">Rupture</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold">Produits récents</h2>
              </div>
              <div className="divide-y max-h-[600px] overflow-y-auto">
                {products.map((product) => {
                  const productName = `${product.marque.nom} ${product.modele.nom}`;
                  const hasPromo = product.promoPrice !== null;
                  
                  return (
                    <div key={product.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        {/* Image */}
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {product.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/images/${product.images[0].id}`}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{productName}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{product.categorie.nom}</span>
                            <span>•</span>
                            <span>Stock: {product.quantite}</span>
                            {hasPromo && (
                              <>
                                <span>•</span>
                                <span className="text-red-600 font-medium">
                                  Promo: {formatPrice(product.promoPrice!)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Toggles */}
                        <div className="flex items-center gap-3">
                          <PublishToggle
                            productId={product.id}
                            initialValue={product.isPublished}
                          />
                          <FeaturedToggle
                            productId={product.id}
                            initialValue={product.isFeatured}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Promos */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b">
                <h2 className="font-semibold">Promotions actives</h2>
              </div>
              <div className="divide-y">
                {activePromos.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Aucune promotion active
                  </div>
                ) : (
                  activePromos.map((product) => {
                    const productName = `${product.marque.nom} ${product.modele.nom}`;
                    const discount = product.prixVente 
                      ? Math.round(((product.prixVente - product.promoPrice!) / product.prixVente) * 100)
                      : 0;

                    return (
                      <div key={product.id} className="p-4">
                        <p className="font-medium text-gray-900 text-sm truncate">{productName}</p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-2">
                            <span className="text-red-600 font-bold">
                              {formatPrice(product.promoPrice!)}
                            </span>
                            {product.prixVente && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(product.prixVente)}
                              </span>
                            )}
                          </div>
                          <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
                            -{discount}%
                          </span>
                        </div>
                        {product.promoEnd && (
                          <p className="text-xs text-gray-500 mt-1">
                            Expire: {new Date(product.promoEnd).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
