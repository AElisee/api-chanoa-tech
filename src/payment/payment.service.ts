import * as crypto from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Commande, OrderStatus } from '../commande/entities/commande.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Commande)
    private readonly commandeRepo: Repository<Commande>,
    private readonly httpService: HttpService,
  ) {}

  async initiatePayment(
    orderId: string,
    userId: string,
  ): Promise<{ orderId: string; paymentUrl: string; reference: string }> {
    const commande = await this.commandeRepo.findOne({
      where: { id: orderId },
      relations: { items: { product: true } },
    });

    if (!commande) {
      throw new NotFoundException(`Commande #${orderId} introuvable`);
    }

    if (commande.userId !== userId) {
      throw new BadRequestException('Cette commande ne vous appartient pas');
    }

    if (commande.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Impossible d'initier le paiement : statut actuel "${commande.status}"`,
      );
    }

    const ref = 'CHT-' + Date.now();
    commande.paymentReference = ref;
    await this.commandeRepo.save(commande);

    // TODO: Remplacer par le vrai appel GeniusPay lorsque la documentation sera disponible
    const apiUrl = process.env.GENIUSPAY_API_URL;
    const merchantId = process.env.GENIUSPAY_MERCHANT_ID;
    const frontendUrl = process.env.FRONTEND_URL;

    if (apiUrl && merchantId && apiUrl !== 'https://api.geniuspay.com') {
      // Appel réel à l'API GeniusPay
      // TODO: adapter les champs selon la doc GeniusPay officielle
      const payload = {
        merchant_id: merchantId,
        reference: ref,
        amount: commande.total,
        currency: 'XOF',
        return_url: `${frontendUrl}/commande/${orderId}?status=success`,
        cancel_url: `${frontendUrl}/commande/${orderId}?status=cancelled`,
        customer_email: commande.guestEmail ?? null,
        // TODO: ajouter customer_email depuis l'entité User si relation chargée
      };

      const response = await firstValueFrom(
        this.httpService.post(`${apiUrl}/payments`, payload, {
          headers: {
            Authorization: `Bearer ${process.env.GENIUSPAY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return {
        orderId,
        paymentUrl: response.data.payment_url as string,
        reference: ref,
      };
    }

    // Mode développement : réponse mockée
    return {
      orderId,
      paymentUrl: `${frontendUrl}/checkout/simulate?ref=${ref}`,
      reference: ref,
    };
  }

  async handleWebhook(
    payload: Record<string, unknown>,
    signature: string,
  ): Promise<{ received: boolean }> {
    const secret = process.env.GENIUSPAY_WEBHOOK_SECRET ?? '';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (expected !== signature) {
      throw new UnauthorizedException('Invalid signature');
    }

    const reference = payload.reference as string | undefined;
    if (!reference) {
      throw new BadRequestException('Référence de paiement manquante dans le payload');
    }

    const commande = await this.commandeRepo.findOne({
      where: { paymentReference: reference },
    });

    if (!commande) {
      throw new NotFoundException(`Aucune commande trouvée pour la référence "${reference}"`);
    }

    const status = payload.status as string | undefined;

    if (status === 'success') {
      commande.status = OrderStatus.CONFIRMED;
      commande.paymentMethod =
        typeof payload.method === 'string' ? payload.method : 'geniuspay';
    } else if (status === 'failed') {
      commande.status = OrderStatus.CANCELLED;
    }
    // TODO: gérer d'autres statuts selon la doc GeniusPay (ex: 'pending', 'refunded')

    await this.commandeRepo.save(commande);
    return { received: true };
  }

  async getPaymentStatus(
    reference: string,
  ): Promise<{ reference: string; status: OrderStatus; orderId: string }> {
    const commande = await this.commandeRepo.findOne({
      where: { paymentReference: reference },
    });

    if (!commande) {
      throw new NotFoundException(`Aucune commande trouvée pour la référence "${reference}"`);
    }

    return {
      reference,
      status: commande.status,
      orderId: commande.id,
    };
  }
}
