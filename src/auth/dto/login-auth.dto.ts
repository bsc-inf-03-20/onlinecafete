import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @ApiProperty({ example: 'jane@example.com', description: 'Account email.' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassword123!', description: 'Account password.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
