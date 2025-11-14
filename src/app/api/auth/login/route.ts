import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  usernameOrEmail: z.string(),
  password: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { usernameOrEmail, password } = loginSchema.parse(body);

    const user = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Identifiants invalides' }), { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new NextResponse(JSON.stringify({ error: 'Identifiants invalides' }), { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('[API_AUTH_LOGIN_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: 'Données invalides' }), { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
