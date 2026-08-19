import { IsMongoId, IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
  @IsMongoId()
  menuItemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
