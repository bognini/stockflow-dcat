import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const adminCount = await prisma.utilisateur.count({
      where: { role: 'admin' },
    });

    return NextResponse.json({ adminExists: adminCount > 0 });
  } catch (error) {
    console.error('[API_CHECK_ADMIN_ERROR]', error);
    // If the database is not ready (e.g., table doesn't exist), assume no admin exists.
    // This allows the setup flow to proceed.
    if ((error as any).code === 'P2021') {
        return NextResponse.json({ adminExists: false });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
