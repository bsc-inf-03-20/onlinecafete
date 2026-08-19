import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from '../../common/dto/address.dto';

export class CreateCustomerProfileDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Customer full name.' })
  @IsString()
  @Length(1, 120)
  fullName: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Unique email address.' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+27123456789', description: 'Customer phone number.' })
  @IsOptional()
  @IsString()
  @Length(7, 20)
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile avatar image URL.',
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  avatarUrl?: string;

  @ApiPropertyOptional({
    example: ['vegetarian'],
    description: 'Dietary preferences and restrictions.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  dietaryPreferences?: string[];

  @ApiPropertyOptional({
    type: [AddressDto],
    description: 'Saved customer delivery addresses.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses?: AddressDto[];
}
