import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterAuthDto {
  @ApiProperty({ example: 'Jane Doe', description: 'Customer full name.' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  fullName: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Unique email address.' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Password used to create the account.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    example: '+27123456789',
    description: 'Optional customer phone number.',
  })
  @IsOptional()
  @IsString()
  @Length(7, 20)
  phone?: string;
}
