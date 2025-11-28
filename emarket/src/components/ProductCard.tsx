import Link from 'next/link';
import { ProductWithRelations, formatPrice, calculateDiscount } from '@/lib/types';

type ProductCardProps = {
  product: ProductWithRelations;
};

export default function ProductCard({ product }: ProductCardProps) {
  const hasPromo = product.promoPrice !== null && product.promoPrice < (product.prixVente ?? 0);
  const displayPrice = hasPromo ? product.promoPrice! : product.prixVente;
  const originalPrice = product.prixVente;
  const discount = hasPromo && originalPrice ? calculateDiscount(originalPrice, product.promoPrice!) : 0;

  // Get first image or placeholder
  const imageUrl = product.images[0]
    ? `/api/images/${product.images[0].id}`
    : '/placeholder-product.png';

  const productName = `${product.marque.nom} ${product.modele.nom}`;
  const slug = product.seoSlug || product.id;

  return (
    <Link
      href={`/produit/${slug}`}
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Image container */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Promo badge */}
        {hasPromo && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}

        {/* Out of stock overlay */}
        {product.quantite <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-500 mb-1">{product.categorie.nom}</p>

        {/* Product name */}
        <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
          {productName}
        </h3>

        {/* Price */}
        <div className="mt-2">
          {hasPromo ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-red-600">
                {formatPrice(displayPrice!)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(originalPrice!)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {displayPrice ? formatPrice(displayPrice) : 'Prix sur demande'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
