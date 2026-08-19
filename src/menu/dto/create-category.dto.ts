import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Meals', description: 'Category display name.' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 80)
  name: string;
}
