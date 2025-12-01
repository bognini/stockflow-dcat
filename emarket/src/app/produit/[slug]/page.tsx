import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { formatPrice, calculateDiscount } from '@/lib/types';
import ProductGallery from '@/components/ProductGallery';
import AddToCartButton from '@/components/AddToCartButton';
import PromoBadge, { getPromoVariant } from '@/components/PromoBadge';
import PromoCountdown from '@/components/PromoCountdown';
import ProductJsonLd from '@/components/ProductJsonLd';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://emarket.dcat.ci';

async function getProduct(slug: string) {
  // Try to find by seoSlug first, then by id
  const product = await prisma.produit.findFirst({
    where: {
      OR: [{ seoSlug: slug }, { id: slug }],
      isPublished: true,
    },
    include: {
      marque: true,
      modele: true,
      categorie: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return product;
}

async function getRelatedProducts(categorieId: string, excludeId: string) {
  const products = await prisma.produit.findMany({
    where: {
      isPublished: true,
      quantite: { gt: 0 },
      categorieId,
      id: { not: excludeId },
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

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Produit non trouvé - DCAT E-Market',
    };
  }

  const productName = `${product.marque.nom} ${product.modele.nom}`;
  const description = product.description 
    || `Achetez ${productName} au meilleur prix sur DCAT E-Market. ${product.categorie.nom}. Livraison en Côte d'Ivoire.`;
  const imageUrl = product.images[0] 
    ? `${SITE_URL}/api/images/${product.images[0].id}` 
    : `${SITE_URL}/og-default.png`;
  const productUrl = `${SITE_URL}/produit/${product.seoSlug || product.id}`;

  return {
    title: `${productName} - DCAT E-Market`,
    description,
    openGraph: {
      title: productName,
      description,
      url: productUrl,
      siteName: 'DCAT E-Market',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: productName,
        },
      ],
      locale: 'fr_CI',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: productName,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.categorieId, product.id);

  // Check if promo is currently active (respecting date range)
  const now = new Date();
  const promoStartValid = !product.promoStart || new Date(product.promoStart) <= now;
  const promoEndValid = !product.promoEnd || new Date(product.promoEnd) >= now;
  const hasPromo = product.promoPrice !== null && 
                   product.promoPrice < (product.prixVente ?? 0) &&
                   promoStartValid && promoEndValid;
  
  const displayPrice = hasPromo ? product.promoPrice! : product.prixVente;
  const originalPrice = product.prixVente;
  const discount = hasPromo && originalPrice ? calculateDiscount(originalPrice, product.promoPrice!) : 0;
  const promoVariant = getPromoVariant(discount);
  const productName = `${product.marque.nom} ${product.modele.nom}`;
  
  // Check if promo has end date for countdown
  const hasPromoEnd = hasPromo && product.promoEnd;

  // Image URL for JSON-LD
  const imageUrl = product.images[0] 
    ? `${SITE_URL}/api/images/${product.images[0].id}` 
    : null;

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <ProductJsonLd
        product={{
          name: productName,
          description: product.description,
          price: originalPrice ?? 0,
          promoPrice: hasPromo ? product.promoPrice : null,
          currency: 'XOF',
          availability: product.quantite > 0 ? 'InStock' : 'OutOfStock',
          imageUrl,
          url: `${SITE_URL}/produit/${product.seoSlug || product.id}`,
          brand: product.marque.nom,
          category: product.categorie.nom,
          sku: product.id,
          promoEndDate: product.promoEnd?.toISOString() ?? null,
        }}
      />

      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-gray-700">Accueil</Link>
        <ChevronRight className="h-3 w-3 flex-shrink-0" />
        <Link href="/produits" className="hover:text-gray-700">Produits</Link>
        <ChevronRight className="h-3 w-3 flex-shrink-0" />
        <Link href={`/produits?categorie=${product.categorieId}`} className="hover:text-gray-700">
          {product.categorie.nom}
        </Link>
        <ChevronRight className="h-3 w-3 flex-shrink-0" />
        <span className="text-gray-900 truncate max-w-[150px]">{productName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Gallery */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <ProductGallery images={product.images} productName={productName} />
        </div>

        {/* Product info */}
        <div>
          <p className="text-xs text-gray-500 mb-1">{product.categorie.nom}</p>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{productName}</h1>

          {/* Price */}
          <div className="mb-4">
            {hasPromo ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-red-600">
                    {formatPrice(displayPrice!)}
                  </span>
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(originalPrice!)}
                  </span>
                  <PromoBadge discount={discount} variant={promoVariant} size="sm" />
                </div>
                <p className="text-xs text-green-600 font-medium">
                  Économie: {formatPrice(originalPrice! - displayPrice!)}
                </p>
                {hasPromoEnd && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-xs text-red-700 font-medium mb-1">⏰ Offre limitée</p>
                    <PromoCountdown endDate={new Date(product.promoEnd!)} />
                  </div>
                )}
              </div>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {displayPrice ? formatPrice(displayPrice) : 'Prix sur demande'}
              </span>
            )}
          </div>

          {/* Stock status */}
          <div className="mb-4">
            {product.quantite > 0 ? (
              <span className="inline-flex items-center gap-2 text-green-600">
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                En stock ({product.quantite} disponible{product.quantite > 1 ? 's' : ''})
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-red-600">
                <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                Rupture de stock
              </span>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <AddToCartButton
              product={{
                id: product.id,
                name: productName,
                price: originalPrice ?? 0,
                promoPrice: hasPromo ? product.promoPrice : null,
                imageUrl: product.images[0] ? `/api/images/${product.images[0].id}` : null,
                maxQuantity: product.quantite,
              }}
              disabled={product.quantite <= 0}
              className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            />
            <a
              href={`https://wa.me/2250709029625?text=Bonjour, je suis intéressé par ${encodeURIComponent(productName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 border-2 border-green-500 text-green-600 py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors text-center"
            >
              WhatsApp
            </a>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-4">
              <h2 className="text-sm font-semibold mb-2">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Specs */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">Caractéristiques</h2>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-gray-500">Marque</dt>
                <dd className="font-medium">{product.marque.nom}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Modèle</dt>
                <dd className="font-medium">{product.modele.nom}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Catégorie</dt>
                <dd className="font-medium">{product.categorie.nom}</dd>
              </div>
              {product.couleur && (
                <div>
                  <dt className="text-gray-500">Couleur</dt>
                  <dd className="font-medium">{product.couleur}</dd>
                </div>
              )}
              {product.poids && (
                <div>
                  <dt className="text-gray-500">Poids</dt>
                  <dd className="font-medium">{product.poids} kg</dd>
                </div>
              )}
              {product.sku && (
                <div>
                  <dt className="text-gray-500">SKU</dt>
                  <dd className="font-medium">{product.sku}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/produit/${p.seoSlug || p.id}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="aspect-square bg-gray-100">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/images/${p.images[0].id}`}
                      alt={`${p.marque.nom} ${p.modele.nom}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">
                    {p.marque.nom} {p.modele.nom}
                  </h3>
                  <p className="text-lg font-bold mt-2">
                    {p.prixVente ? formatPrice(p.prixVente) : 'Prix sur demande'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>
    </>
  );
}
