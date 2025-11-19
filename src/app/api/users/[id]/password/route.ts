import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

import prisma from '@/lib/prisma';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Le mot de passe actuel est requis.' }),
    newPassword: z
      .string()
      .min(8, { message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' })
      .refine((value) => /[a-z]/.test(value), {
        message: 'Le mot de passe doit contenir au moins une lettre minuscule.',
      })
      .refine((value) => /[A-Z]/.test(value), {
        message: 'Le mot de passe doit contenir au moins une lettre majuscule.',
      })
      .refine((value) => /\d/.test(value), {
        message: 'Le mot de passe doit contenir au moins un chiffre.',
      })
      .refine((value) => /[^A-Za-z0-9]/.test(value), {
        message: 'Le mot de passe doit contenir au moins un caractère spécial.',
      }),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Le nouveau mot de passe doit être différent de l\'ancien.',
    path: ['newPassword'],
  });

export async function PATCH(
  req: Request,
  context: { params?: { id?: string } }
) {
  try {
    const userId = context.params?.id;
    if (!userId) {
      return NextResponse.json({ error: "Identifiant utilisateur manquant." }, { status: 400 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = passwordSchema.parse(body);

    const user = await prisma.utilisateur.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Le mot de passe actuel est incorrect.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.utilisateur.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (error) {
    console.error('[API_USER_PASSWORD_PATCH_ERROR]', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 422 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
