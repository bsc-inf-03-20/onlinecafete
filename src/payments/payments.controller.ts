import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentsService } from './payments.service';
import {
  SwaggerInitializePaymentResponseModel,
  SwaggerPaymentModel,
} from '../swagger/api-models';

@Controller('payments')
@ApiTags('Payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Initialize payment',
    description: 'Create a payment record for a specific order.',
  })
  @ApiCreatedResponse({
    description: 'Payment initialized.',
    type: SwaggerInitializePaymentResponseModel,
  })
  initialize(
    @CurrentUser() user: JwtPayload,
    @Body() initializePaymentDto: InitializePaymentDto,
  ) {
    return this.paymentsService.initialize(user, initializePaymentDto);
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Handle payment webhook',
    description: 'Update payment and order state after a provider callback.',
  })
  @ApiOkResponse({
    description: 'Payment record updated.',
    type: SwaggerPaymentModel,
  })
  webhook(@Body() paymentWebhookDto: PaymentWebhookDto) {
    return this.paymentsService.handleWebhook(paymentWebhookDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get payment',
    description: 'Fetch one payment record by id.',
  })
  @ApiOkResponse({
    description: 'Payment details.',
    type: SwaggerPaymentModel,
  })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.findOne(id, user);
  }
}
