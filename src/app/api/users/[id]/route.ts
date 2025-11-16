import { NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

const updateUserSchema = z
  .object({
    name: z.string().min(1, 'Le nom complet est requis').max(255).optional(),
    email: z.string().email('Adresse e-mail invalide').optional(),
    avatarUrl: z.string().url('URL invalide').optional().or(z.literal('')).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Aucune donnée fournie pour la mise à jour',
  });

export async function PATCH(
  req: Request,
  context: { params?: { id?: string } }
) {
  try {
    const userId = context.params?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Identifiant utilisateur manquant' }, { status: 400 });
    }

    const body = await req.json();
    const payload = updateUserSchema.parse(body);

    const data: Record<string, string | null> = {};

    if (payload.name !== undefined) {
      data.nom = payload.name.trim();
    }

    if (payload.email !== undefined) {
      data.email = payload.email.trim();
    }

    if (payload.avatarUrl !== undefined) {
      data.avatarUrl = payload.avatarUrl ? payload.avatarUrl.trim() : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucune donnée valide à mettre à jour' }, { status: 400 });
    }

    const updatedUser = await prisma.utilisateur.update({
      where: { id: userId },
      data,
    });

    const { password: _password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('[API_USER_PATCH_ERROR]', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 422 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
