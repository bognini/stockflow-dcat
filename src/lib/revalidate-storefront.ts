/**
 * Trigger revalidation of the storefront (emarket) cache
 * Called when products are created, updated, or deleted in Stockflow
 */

const EMARKET_URL = process.env.EMARKET_URL || 'http://emarket:3001';
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || 'sync2store@APP';

type RevalidationType = 'product' | 'category' | 'all';

interface RevalidateOptions {
  type: RevalidationType;
  slug?: string | null;
  id?: string;
}

export async function revalidateStorefront(options: RevalidateOptions): Promise<boolean> {
  try {
    const response = await fetch(`${EMARKET_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: REVALIDATION_SECRET,
        type: options.type,
        slug: options.slug,
        id: options.id,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[REVALIDATE] Failed:', error);
      return false;
    }

    const result = await response.json();
    console.log('[REVALIDATE] Success:', result);
    return true;
  } catch (error) {
    console.error('[REVALIDATE] Error:', error);
    return false;
  }
}

/**
 * Convenience function to revalidate after product changes
 */
export async function revalidateProduct(productId: string, seoSlug?: string | null): Promise<boolean> {
  return revalidateStorefront({
    type: 'product',
    id: productId,
    slug: seoSlug,
  });
}

/**
 * Convenience function to revalidate all storefront pages
 */
export async function revalidateAll(): Promise<boolean> {
  return revalidateStorefront({ type: 'all' });
}
