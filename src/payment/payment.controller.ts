import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { PaymentService } from './payment.service';
import { Public } from '../auth/decorators/public.decorator';
import { RequiredPermission } from '../auth/decorators/permissions.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @RequiredPermission('client', 'admin')
  initiate(
    @Body('orderId') orderId: string,
    @Request() req: ExpressRequest & { user: { id: string; name?: string; email?: string; phone?: string } },
  ) {
    return this.paymentService.initiatePayment(orderId, req.user);
  }

  // Webhook : sécurisé par signature HMAC uniquement — pas de JwtAuthGuard
  @Public()
  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Body() payload: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    await this.paymentService.handleWebhook(payload, headers);
    return { received: true };
  }

  @Public()
  @Get('status/:reference')
  getStatus(@Param('reference') reference: string) {
    return this.paymentService.getPaymentStatus(reference);
  }
}
