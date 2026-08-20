import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({
    example: '12 Main Road',
    description: 'Street address line 1.',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  line1: string;

  @ApiPropertyOptional({ example: 'Unit 4', description: 'Optional line 2.' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  line2?: string;

  @ApiProperty({ example: 'Johannesburg', description: 'City or town name.' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 80)
  city: string;

  @ApiProperty({ example: 'Gauteng', description: 'Province or state.' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 80)
  province: string;

  @ApiProperty({ example: '2000', description: 'Postal or ZIP code.' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 12)
  postalCode: string;

  @ApiPropertyOptional({
    example: 'South Africa',
    description: 'Country name.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  country?: string;

  @ApiPropertyOptional({
    example: 'Home',
    description: 'Label for the address.',
  })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  label?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Marks the default address used for delivery.',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
