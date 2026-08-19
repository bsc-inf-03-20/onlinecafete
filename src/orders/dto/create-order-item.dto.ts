import { Type } from 'class-transformer';
import { IsInt, IsMongoId, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({
    example: '66c2f1e3f1f1f1f1f1f1f1b',
    description: 'Menu item ID from the catalog.',
  })
  @IsMongoId()
  menuItemId: string;

  @ApiProperty({ example: 2, description: 'Quantity to order.' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
