import * as crypto from 'crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commande, OrderStatus } from '../commande/entities/commande.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Commande)
    private readonly commandeRepo: Repository<Commande>,
  ) {}

  private get apiHeaders(): Record<string, string> {
    return {
      'X-API-Key': this.configService.getOrThrow<string>('GENIUSPAY_API_KEY'),
      'X-API-Secret': this.configService.getOrThrow<string>('GENIUSPAY_API_SECRET'),
      'Content-Type': 'application/json',
    };
  }

  async initiatePayment(
    orderId: string,
    user: { id: string; name?: string; email?: string; phone?: string },
  ): Promise<{ paymentUrl: string; reference: string }> {
    // 1. Récupérer la commande
    const commande = await this.commandeRepo.findOne({ where: { id: orderId } });
    if (!commande) {
      throw new NotFoundException(`Commande #${orderId} introuvable`);
    }

    if (commande.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Impossible d'initier le paiement : statut actuel "${commande.status}"`,
      );
    }

    if (commande.total === null || commande.total === undefined) {
      throw new BadRequestException('Le montant de la commande est invalide');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3201');
    const apiUrl = this.configService.getOrThrow<string>('GENIUSPAY_API_URL');

    // 2. Appel GeniusPay POST /payments
    const response = await this.httpService.axiosRef.post(
      `${apiUrl}/payments`,
      {
        amount: Number(commande.total),
        currency: 'XOF',
        description: `Commande #${orderId}`,
        customer: {
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          phone: user.phone ?? undefined,
        },
        success_url: `${frontendUrl}/commande/${orderId}/succes`,
        error_url: `${frontendUrl}/commande/${orderId}/echec`,
        metadata: {
          order_id: orderId,
          user_id: user.id,
        },
      },
      { headers: this.apiHeaders },
    );

    const { reference, checkout_url, payment_url } = response.data.data as {
      reference: string;
      checkout_url?: string;
      payment_url?: string;
    };
    const paymentUrl = checkout_url ?? payment_url ?? '';

    // 3. Sauvegarder la référence dans la commande
    await this.commandeRepo.update(orderId, {
      paymentReference: reference,
      paymentMethod: 'geniuspay',
    });

    return { paymentUrl, reference };
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    headers: Record<string, string>,
  ): Promise<void> {
    // 1. Extraire les headers de sécurité
    const signature = headers['x-webhook-signature'];
    const timestamp = headers['x-webhook-timestamp'];
    const event = headers['x-webhook-event'];

    if (!signature || !timestamp) {
      throw new UnauthorizedException('Headers webhook manquants');
    }

    // 2. Vérifier la signature HMAC-SHA256
    const secret = this.configService.getOrThrow<string>('GENIUSPAY_WEBHOOK_SECRET');
    const dataToSign = `${timestamp}.${JSON.stringify(payload)}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(dataToSign).digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Signature webhook invalide');
    }

    // 3. Protection replay attack (fenêtre 5 minutes)
    const age = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
    if (age > 300) {
      throw new BadRequestException('Webhook expiré (timestamp trop ancien)');
    }

    // 4. Récupérer l'order_id depuis les metadata
    const data = payload.data as Record<string, unknown> | undefined;
    const metadata = data?.metadata as Record<string, unknown> | undefined;
    const orderId = metadata?.order_id as string | undefined;

    if (!orderId) {
      this.logger.warn(`Webhook ${event} reçu sans order_id dans metadata`);
      return;
    }

    // 5. Traiter selon l'événement
    switch (event) {
      case 'payment.success':
        await this.commandeRepo.update(orderId, { status: OrderStatus.CONFIRMED });
        break;
      case 'payment.failed':
      case 'payment.cancelled':
        await this.commandeRepo.update(orderId, { status: OrderStatus.CANCELLED });
        break;
      case 'payment.refunded':
        await this.commandeRepo.update(orderId, { status: OrderStatus.REFUNDED });
        break;
      case 'payment.expired':
        await this.commandeRepo.update(orderId, {
          status: OrderStatus.PENDING,
          paymentReference: null as unknown as string,
        });
        break;
      case 'payment.initiated':
      case 'webhook.test':
        this.logger.log(`Webhook ${event} reçu pour commande ${orderId}`);
        break;
      default:
        this.logger.log(`Webhook ${event} ignoré (cashout ou inconnu)`);
    }
  }

  async getPaymentStatus(reference: string): Promise<object> {
    const apiUrl = this.configService.getOrThrow<string>('GENIUSPAY_API_URL');
    try {
      const response = await this.httpService.axiosRef.get(
        `${apiUrl}/payments/${reference}`,
        { headers: this.apiHeaders },
      );
      const tx = response.data.data as {
        reference: string;
        status: string;
        amount: number;
        currency: string;
        fees: number;
        net_amount: number;
        payment_method?: string;
        completed_at?: string;
      };
      return {
        reference: tx.reference,
        status: tx.status,
        amount: tx.amount,
        currency: tx.currency,
        fees: tx.fees,
        net_amount: tx.net_amount,
        payment_method: tx.payment_method ?? null,
        completed_at: tx.completed_at ?? null,
      };
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new NotFoundException('Transaction introuvable');
      }
      throw new BadRequestException('Impossible de récupérer le statut du paiement');
    }
  }
}
