import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { AddressDto } from '../../common/dto/address.dto';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  items: CreateOrderItemDto[];

  deliveryAddress: AddressDto;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}
