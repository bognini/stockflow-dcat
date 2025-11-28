import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    const subjectLabels: Record<string, string> = {
      info: "Demande d'information",
      devis: 'Demande de devis',
      support: 'Support technique',
      partenariat: 'Partenariat',
      autre: 'Autre',
    };

    const emailSubject = `[E-Market] ${subjectLabels[subject] || subject} - ${name}`;
    const emailBody = `
Nouveau message depuis DCAT E-Market

Nom: ${name}
Email: ${email}
Téléphone: ${phone || 'Non renseigné'}
Sujet: ${subjectLabels[subject] || subject}

Message:
${message}

---
Ce message a été envoyé depuis le formulaire de contact de emarket.dcat.ci
    `.trim();

    const htmlBody = `
<h2>Nouveau message depuis DCAT E-Market</h2>
<table style="border-collapse: collapse; width: 100%; max-width: 600px;">
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Nom:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Téléphone:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #eee;">${phone || 'Non renseigné'}</td>
  </tr>
  <tr>
    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Sujet:</strong></td>
    <td style="padding: 8px; border-bottom: 1px solid #eee;">${subjectLabels[subject] || subject}</td>
  </tr>
</table>
<h3>Message:</h3>
<p style="background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${message}</p>
<hr>
<p style="color: #666; font-size: 12px;">Ce message a été envoyé depuis le formulaire de contact de emarket.dcat.ci</p>
    `.trim();

    // Send to both info@dcat.ci and sales@dcat.ci
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@dcat.ci',
      to: 'info@dcat.ci, sales@dcat.ci',
      replyTo: email,
      subject: emailSubject,
      text: emailBody,
      html: htmlBody,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CONTACT_ERROR]', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
