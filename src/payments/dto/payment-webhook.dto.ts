import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

import { PaymentStatus } from '../../common/enums/payment-status.enum';

export class PaymentWebhookDto {
  @ApiProperty({
    example: '66c2f1e3f1f1f1f1f1f1f1c',
    description: 'Related order id.',
  })
  @IsMongoId()
  orderId: string;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.Paid,
    description: 'Payment outcome reported by the provider.',
  })
  @Type(() => String)
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiPropertyOptional({
    example: 'pay_123456',
    description: 'External payment provider reference.',
  })
  @IsOptional()
  @IsString()
  providerReference?: string;

  @ApiPropertyOptional({
    example: 'stripe',
    description: 'Payment provider name.',
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({
    example: 'webhook-signature-value',
    description: 'Webhook signature for verification.',
  })
  @IsOptional()
  @IsString()
  signature?: string;
}
