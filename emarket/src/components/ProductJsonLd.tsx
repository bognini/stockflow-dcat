type ProductJsonLdProps = {
  product: {
    name: string;
    description: string | null;
    price: number;
    promoPrice: number | null;
    currency: string;
    availability: 'InStock' | 'OutOfStock';
    imageUrl: string | null;
    url: string;
    brand: string;
    category: string;
    sku: string;
    promoEndDate?: string | null;
  };
};

// Calculate promo valid until date (30 days from now or promo end date)
function getPromoValidUntil(promoEndDate?: string | null): string {
  if (promoEndDate) {
    return new Date(promoEndDate).toISOString().split('T')[0];
  }
  // Default to 30 days from a fixed reference
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  return futureDate.toISOString().split('T')[0];
}

export default function ProductJsonLd({ product }: ProductJsonLdProps) {
  const hasPromo = product.promoPrice !== null && product.promoPrice < product.price;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - Disponible sur DCAT E-Market`,
    image: product.imageUrl,
    url: product.url,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.promoPrice ?? product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      seller: {
        '@type': 'Organization',
        name: 'DCAT E-Market',
      },
      ...(hasPromo && {
        priceValidUntil: getPromoValidUntil(product.promoEndDate),
      }),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
