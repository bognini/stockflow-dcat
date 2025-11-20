import nodemailer from 'nodemailer';

import prisma from '@/lib/prisma';

interface MailPayload {
  subject: string;
  text: string;
  html?: string;
}

export async function sendNotificationEmail(payload: MailPayload, recipients?: string[]) {
  const config = await prisma.mailConfig.findFirst();

  if (!config || !config.smtpHost || !config.smtpPort || !config.smtpUser) {
    console.warn('[MAIL_NOT_CONFIGURED] SMTP host/port/user missing.');
    return;
  }

  const password = config.smtpPass ?? process.env.SMTP_PASS ?? process.env.MAIL_SERVER_PASSWORD;
  if (!password) {
    console.warn('[MAIL_MISSING_PASSWORD] Unable to send notification without SMTP password.');
    return;
  }

  const destination = recipients?.length ? recipients : config.notificationEmails;
  if (!destination || destination.length === 0) {
    console.warn('[MAIL_NO_RECIPIENTS] No notification recipients configured.');
    return;
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

  const automaticNotice = '« Ceci est une notification automatique, merci de ne pas y répondre - StockFlow DCAT. »';
  const htmlBody = payload.html ?? `<p>${payload.text}</p>`;
  const htmlWithNotice = `${htmlBody}<p><em>${automaticNotice}</em></p>`;
  const textWithNotice = `${payload.text.trimEnd()}\n\n${automaticNotice}`;

  await transporter.sendMail({
    from: config.smtpUser,
    to: destination.join(','),
    subject: payload.subject,
    text: textWithNotice,
    html: htmlWithNotice,
  });
}
