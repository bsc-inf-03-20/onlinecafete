import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateTodoitemDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @IsOptional()
  @IsBoolean()
  done?: boolean;
}
