import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type QuoteItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type QuoteRequest = {
  nom: string;
  email?: string;
  telephone: string;
  entreprise?: string;
  message?: string;
  items: QuoteItem[];
  subtotal: number;
};

export async function POST(request: Request) {
  try {
    const body: QuoteRequest = await request.json();

    // Validate required fields
    if (!body.nom?.trim() || !body.telephone?.trim()) {
      return NextResponse.json(
        { error: 'Nom et téléphone sont requis' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Le panier est vide' },
        { status: 400 }
      );
    }

    // Get mail config for notifications
    const mailConfig = await prisma.mailConfig.findFirst();

    // Format quote details for email/logging
    const itemsList = body.items
      .map((item) => `- ${item.name} × ${item.quantity} = ${item.price * item.quantity} FCFA`)
      .join('\n');

    const quoteDetails = `
NOUVELLE DEMANDE DE DEVIS - DCAT E-Market
==========================================

Client: ${body.nom}
Téléphone: ${body.telephone}
Email: ${body.email || 'Non renseigné'}
Entreprise: ${body.entreprise || 'Non renseignée'}

Message:
${body.message || 'Aucun message'}

PRODUITS DEMANDÉS:
${itemsList}

TOTAL: ${body.subtotal} FCFA (hors livraison)

==========================================
Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan' })}
    `.trim();

    // Log the quote request
    console.log('[QUOTE_REQUEST]', quoteDetails);

    // If mail is configured, send notification email
    if (mailConfig?.smtpHost && mailConfig?.smtpUser && mailConfig?.notificationEmails?.length) {
      try {
        // Dynamic import to avoid issues if nodemailer isn't available
        const nodemailer = await import('nodemailer');
        
        const transporter = nodemailer.default.createTransport({
          host: mailConfig.smtpHost,
          port: mailConfig.smtpPort ?? 587,
          secure: mailConfig.smtpPort === 465,
          auth: {
            user: mailConfig.smtpUser,
            pass: mailConfig.smtpPass ?? '',
          },
        });

        await transporter.sendMail({
          from: mailConfig.smtpUser,
          to: mailConfig.notificationEmails,
          subject: `[DCAT E-Market] Nouvelle demande de devis - ${body.nom}`,
          text: quoteDetails,
          html: `
            <h2>Nouvelle demande de devis - DCAT E-Market</h2>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Client:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.nom}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Téléphone:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.telephone}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.email || 'Non renseigné'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Entreprise:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${body.entreprise || 'Non renseignée'}</td></tr>
            </table>
            <h3 style="margin-top: 20px;">Produits demandés:</h3>
            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Produit</th>
                  <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Qté</th>
                  <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Prix</th>
                </tr>
              </thead>
              <tbody>
                ${body.items.map((item) => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
                    <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                    <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background: #f5f5f5; font-weight: bold;">
                  <td colspan="2" style="padding: 8px; border: 1px solid #ddd;">Total</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${body.subtotal.toLocaleString('fr-FR')} FCFA</td>
                </tr>
              </tfoot>
            </table>
            ${body.message ? `<h3 style="margin-top: 20px;">Message du client:</h3><p style="background: #f9f9f9; padding: 12px; border-radius: 4px;">${body.message}</p>` : ''}
          `,
        });

        console.log('[QUOTE_EMAIL_SENT] to', mailConfig.notificationEmails);
      } catch (emailError) {
        console.error('[QUOTE_EMAIL_ERROR]', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[QUOTE_API_ERROR]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
