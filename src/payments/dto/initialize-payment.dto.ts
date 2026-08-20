import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsMongoId } from 'class-validator';

import { PaymentMethod } from '../../common/enums/payment-method.enum';

export class InitializePaymentDto {
  @ApiProperty({
    example: '66c2f1e3f1f1f1f1f1f1f1c',
    description: 'Order id to pay for.',
  })
  @IsMongoId()
  orderId: string;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.Card,
    description: 'Payment method to initialize with.',
  })
  @Type(() => String)
  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
