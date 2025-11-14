import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const testMailSchema = z.object({
  recipient: z.string().email('Adresse e-mail invalide'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipient } = testMailSchema.parse(body ?? {});

    const config = await prisma.mailConfig.findFirst();
    if (!config || !config.smtpHost || !config.smtpPort || !config.smtpUser) {
      return new NextResponse(
        JSON.stringify({ error: 'Configuration SMTP incomplète. Veuillez enregistrer le serveur avant de tester.' }),
        { status: 400 }
      );
    }

    const password = config.smtpPass ?? process.env.SMTP_PASS ?? process.env.MAIL_SERVER_PASSWORD;
    if (!password) {
      return new NextResponse(
        JSON.stringify({ error: 'Aucun mot de passe SMTP stocké. Rechargez la configuration avec un mot de passe.' }),
        { status: 400 }
      );
    }

    const port = config.smtpPort ?? Number(process.env.SMTP_PORT ?? 587);
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port,
      secure,
      auth: {
        user: config.smtpUser,
        pass: password,
      },
    });

    await transporter.sendMail({
      from: config.smtpUser,
      to: recipient,
      subject: 'Test de notification StockFlow DCAT',
      text: 'Ce message confirme la configuration SMTP de StockFlow DCAT.',
      html: '<p>Ce message confirme la configuration SMTP de <strong>StockFlow DCAT</strong>.</p>',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API_MAIL_TEST_ERROR]', error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.flatten() }), { status: 422 });
    }
    return new NextResponse(JSON.stringify({ error: "Impossible d'envoyer l'e-mail de test." }), { status: 500 });
  }
}
