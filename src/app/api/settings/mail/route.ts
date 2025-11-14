import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const toTrimmedStringOrNull = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

const toOptionalPort = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const mailConfigSchema = z.object({
  smtpHost: z.preprocess(toTrimmedStringOrNull, z.string().min(1).nullable()),
  smtpPort: z.preprocess(toOptionalPort, z.number().int().positive().nullable()),
  smtpUser: z.preprocess(toTrimmedStringOrNull, z.string().min(1).nullable()),
  smtpPass: z.preprocess(
    (value) => {
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.string().min(8).optional()
  ),
  notificationEmails: z
    .array(
      z
        .string()
        .email()
        .transform((email) => email.trim().toLowerCase())
    )
    .max(20)
    .default([]),
});

export async function GET() {
  try {
    const config = await prisma.mailConfig.findFirst();
    return NextResponse.json(config ?? null);
  } catch (error) {
    console.error('[API_MAIL_GET_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = mailConfigSchema.parse(body ?? {});

    const existing = await prisma.mailConfig.findFirst();

    const data: any = {
      smtpHost: parsed.smtpHost,
      smtpPort: parsed.smtpPort,
      smtpUser: parsed.smtpUser,
      notificationEmails: Array.from(new Set(parsed.notificationEmails)),
    };

    if (parsed.smtpPass) {
      data.smtpPass = parsed.smtpPass;
    }

    const saved = existing
      ? await prisma.mailConfig.update({ where: { id: existing.id }, data })
      : await prisma.mailConfig.create({ data });

    return NextResponse.json(saved);
  } catch (error) {
    console.error('[API_MAIL_POST_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.flatten() }), { status: 422 });
    }
    return new NextResponse(JSON.stringify({ error: "Impossible d'enregistrer la configuration" }), { status: 500 });
  }
}
