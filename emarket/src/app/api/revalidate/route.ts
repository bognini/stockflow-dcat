import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// Secret token for authentication (should match REVALIDATION_SECRET in Stockflow)
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || 'sync2store@APP';

type RevalidateRequest = {
  secret: string;
  type: 'product' | 'category' | 'all';
  slug?: string;
  id?: string;
};

export async function POST(request: Request) {
  try {
    const body: RevalidateRequest = await request.json();

    // Verify secret token
    if (!REVALIDATION_SECRET || body.secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret token' },
        { status: 401 }
      );
    }

    const revalidated: string[] = [];

    switch (body.type) {
      case 'product':
        // Revalidate specific product page
        if (body.slug) {
          revalidatePath(`/produit/${body.slug}`);
          revalidated.push(`/produit/${body.slug}`);
        }
        if (body.id) {
          revalidatePath(`/produit/${body.id}`);
          revalidated.push(`/produit/${body.id}`);
        }
        // Also revalidate catalog pages
        revalidatePath('/produits');
        revalidatePath('/');
        revalidated.push('/produits', '/');
        break;

      case 'category':
        // Revalidate catalog and home
        revalidatePath('/produits');
        revalidatePath('/');
        revalidated.push('/produits', '/');
        break;

      case 'all':
        // Revalidate everything
        revalidatePath('/', 'layout');
        revalidated.push('/ (layout)');
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid revalidation type' },
          { status: 400 }
        );
    }

    console.log('[REVALIDATE]', body.type, revalidated);

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[REVALIDATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
