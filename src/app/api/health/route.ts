import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[HEALTH_CHECK_ERROR]', error);
    return new NextResponse('Unhealthy', { status: 503 });
  }
}
