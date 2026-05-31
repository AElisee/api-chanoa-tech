import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3201');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous (valable 1 heure) :</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      <p>L'équipe Chanoa Tech</p>
    `;

    await this.send(email, 'Réinitialisation de votre mot de passe', html);
  }

  async sendOrderConfirmation(
    email: string,
    orderId: string,
    items: { name: string; quantity: number; unitPrice: number }[],
    total: number,
    paymentMethod: string,
    frontendUrl?: string,
  ): Promise<void> {
    const url = frontendUrl ?? this.configService.get<string>('FRONTEND_URL', 'http://localhost:3201');
    const shortId = orderId.slice(0, 8).toUpperCase();
    const orderUrl = `${url}/commande/${orderId}`;

    const isCOD = paymentMethod === 'cash_on_delivery';
    const subject = isCOD
      ? `Commande #${shortId} reçue — confirmation sous 24h`
      : `Commande #${shortId} — en attente de paiement`;

    const itemsHtml = items
      .map(i => `<tr>
        <td style="padding:6px 0;border-bottom:1px solid #eee">${i.name}</td>
        <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
        <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${i.unitPrice.toLocaleString('fr-FR')} FCFA</td>
      </tr>`)
      .join('');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#1a3a6b;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Chanoa Tech</h1>
        </div>
        <div style="padding:32px 24px">
          <h2 style="color:#1a3a6b">Commande #${shortId} confirmée</h2>
          <p>${isCOD
            ? 'Nous avons bien reçu votre commande. Notre équipe vous contactera sous <strong>24h</strong> pour confirmer et organiser la livraison.'
            : 'Nous avons bien reçu votre commande. Complétez le paiement pour lancer la préparation.'
          }</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead>
              <tr style="background:#f5f5f5">
                <th style="padding:8px;text-align:left">Produit</th>
                <th style="padding:8px;text-align:center">Qté</th>
                <th style="padding:8px;text-align:right">Prix</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="text-align:right;font-weight:bold;font-size:16px">
            Total : ${total.toLocaleString('fr-FR')} FCFA
          </p>
          <div style="margin:24px 0;text-align:center">
            <a href="${orderUrl}" style="background:#1a3a6b;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
              Voir ma commande
            </a>
          </div>
          <p style="color:#666;font-size:13px">
            ${isCOD
              ? 'Vous règlerez en espèces lors de la livraison à votre adresse.'
              : 'Si vous avez des questions, contactez-nous à support@chanoa-tech.com'
            }
          </p>
        </div>
        <div style="background:#f5f5f5;padding:16px;text-align:center;color:#999;font-size:12px">
          Chanoa Tech — Votre partenaire IT en Afrique de l'Ouest
        </div>
      </div>
    `;

    await this.send(email, subject, html);
  }

  async sendOrderStatusUpdate(
    email: string,
    orderId: string,
    newStatus: string,
    trackingNumber?: string | null,
  ): Promise<void> {
    const url = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3201');
    const shortId = orderId.slice(0, 8).toUpperCase();
    const orderUrl = `${url}/commande/${orderId}`;

    const statusMessages: Record<string, { subject: string; body: string }> = {
      confirmed:  { subject: `Commande #${shortId} confirmée`, body: 'Votre commande est confirmée. Nous la préparons dès maintenant.' },
      processing: { subject: `Commande #${shortId} en préparation`, body: 'Votre commande est en cours de préparation.' },
      shipped:    { subject: `Commande #${shortId} expédiée`, body: `Votre commande est en route !${trackingNumber ? ` Numéro de suivi : <strong>${trackingNumber}</strong>` : ''}` },
      delivered:  { subject: `Commande #${shortId} livrée`, body: 'Votre commande a été livrée. Merci pour votre confiance !' },
      cancelled:  { subject: `Commande #${shortId} annulée`, body: 'Votre commande a été annulée. Contactez-nous si vous avez des questions.' },
    };

    const msg = statusMessages[newStatus];
    if (!msg) return; // Pas d'email pour les statuts non listés

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#1a3a6b;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Chanoa Tech</h1>
        </div>
        <div style="padding:32px 24px">
          <h2 style="color:#1a3a6b">${msg.subject}</h2>
          <p>${msg.body}</p>
          <div style="margin:24px 0;text-align:center">
            <a href="${orderUrl}" style="background:#1a3a6b;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
              Suivre ma commande
            </a>
          </div>
        </div>
        <div style="background:#f5f5f5;padding:16px;text-align:center;color:#999;font-size:12px">
          Chanoa Tech — Votre partenaire IT en Afrique de l'Ouest
        </div>
      </div>
    `;

    await this.send(email, msg.subject, html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT', 587);
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    if (!host || !user) {
      this.logger.warn(`[MailService] SMTP non configuré. Email non envoyé à ${to} — ${subject}`);
      return;
    }

    const transporter = nodemailer.createTransport({ host, port, auth: { user, pass } });
    await transporter.sendMail({ from: `"Chanoa Tech" <${user}>`, to, subject, html });
    this.logger.log(`Email envoyé à ${to} — ${subject}`);
  }
}
