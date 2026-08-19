import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Chicken Wrap', description: 'Menu item name.' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name: string;

  @ApiPropertyOptional({
    example: 'Grilled chicken wrap',
    description: 'Short menu item description.',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({ example: 65, description: 'Selling price in ZAR.' })
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiPropertyOptional({
    example: '/images/chicken-wrap.jpg',
    description: 'Optional image URL for the item.',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  imageUrl?: string;

  @ApiProperty({
    example: '66c2f1e3f1f1f1f1f1f1f1a',
    description: 'Category the item belongs to.',
  })
  @IsMongoId()
  categoryId: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether customers can order this item.',
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    example: 15,
    description: 'Estimated preparation time in minutes.',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  prepTimeMinutes?: number;
}
