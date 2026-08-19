import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  line1: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  line2?: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 80)
  city: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 80)
  province: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 12)
  postalCode: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  country?: string;
}
