import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { PaymentService } from './payment.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  initiate(
    @Body() body: { orderId: string },
    @Request() req: ExpressRequest & { user: { id: string } },
  ) {
    return this.paymentService.initiatePayment(body.orderId, req.user.id);
  }

  // Webhook : sécurisé par signature HMAC uniquement — pas de JwtAuthGuard
  @Public()
  @Post('webhook')
  webhook(
    @Body() payload: Record<string, unknown>,
    @Headers('x-geniuspay-signature') sig: string,
  ) {
    return this.paymentService.handleWebhook(payload, sig);
  }

  @Get('status/:reference')
  status(@Param('reference') reference: string) {
    return this.paymentService.getPaymentStatus(reference);
  }
}
