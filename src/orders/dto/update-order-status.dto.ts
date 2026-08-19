import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../../common/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.Preparing,
    description: 'New order processing status.',
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
