import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const setupSchema = z.object({
  nom: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const adminCount = await prisma.utilisateur.count({
      where: { role: 'admin' },
    });

    if (adminCount > 0) {
      return new NextResponse(JSON.stringify({ error: 'Un compte administrateur existe déjà.' }), { status: 403 });
    }

    const body = await req.json();
    const data = setupSchema.parse(body);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.utilisateur.create({
      data: {
        nom: data.nom,
        username: data.username,
        email: data.email,
        password: hashedPassword,
        role: 'admin',
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('[API_SETUP_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), { status: 400 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
