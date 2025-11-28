import Link from 'next/link';
import prisma from '@/lib/prisma';

import ProductCard from '@/components/ProductCard';

import { ArrowRight, Truck, Shield, Headphones } from 'lucide-react';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

async function getFeaturedProducts() {
  const products = await prisma.produit.findMany({
    where: {
      isPublished: true,
      isFeatured: true,
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
    take: 8,
  });
  return products;
}

async function getPromoProducts() {
  const now = new Date();
  const products = await prisma.produit.findMany({
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
    take: 4,
  });
  return products;
}

async function getCategories() {
  const categories = await prisma.categorie.findMany({
    include: {
      _count: {
        select: { produits: { where: { isPublished: true } } },
      },
    },
    take: 6,
  });
  return categories;
}

export default async function Home() {
  const [featuredProducts, promoProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getPromoProducts(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero Section - Image: 1200x800px recommended */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        {/* Optional hero background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-banner.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Bienvenue sur DCAT E-Market
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Découvrez notre sélection de produits de qualité aux meilleurs prix.
                Livraison rapide partout en Côte d&apos;Ivoire.
              </p>
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Voir les produits
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            {/* Optional hero side image - 1200x800px */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-image.png"
              alt="DCAT E-Market"
              className="hidden lg:block w-full max-w-lg mx-auto rounded-lg shadow-2xl"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4">
              <Truck className="h-10 w-10 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Livraison rapide</h3>
                <p className="text-sm text-gray-600">Partout en Côte d&apos;Ivoire</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <Shield className="h-10 w-10 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Paiement sécurisé</h3>
                <p className="text-sm text-gray-600">Transactions protégées</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <Headphones className="h-10 w-10 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Support client</h3>
                <p className="text-sm text-gray-600">À votre écoute 7j/7</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Nos catégories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/produits?categorie=${category.id}`}
                  className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900">{category.nom}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {category._count.produits} produit{category._count.produits > 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo Products */}
      {promoProducts.length > 0 && (
        <section className="py-12 bg-orange-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-orange-600">🔥 Promotions</h2>
              <Link
                href="/promotions"
                className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
              >
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {promoProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Produits en vedette</h2>
              <Link
                href="/produits"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state if no products */}
      {featuredProducts.length === 0 && promoProducts.length === 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Bientôt disponible</h2>
            <p className="text-gray-600 mb-8">
              Notre catalogue est en cours de préparation. Revenez bientôt pour découvrir nos produits !
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
