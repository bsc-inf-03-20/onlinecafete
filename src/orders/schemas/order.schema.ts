import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Address, AddressSchema } from '../../common/schemas/address.schema';
import { DeliveryStatus } from '../../common/enums/delivery-status.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { MenuItem } from '../../menu/schemas/menu-item.schema';
import { User } from '../../users/schemas/user.schema';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: MenuItem.name, required: true })
  menuItemId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  nameSnapshot: string;

  @Prop({ required: true, min: 0.01 })
  unitPriceSnapshot: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  lineTotal: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  orderNumber: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ required: true, min: 0 })
  deliveryFee: number;

  @Prop({ required: true, min: 0 })
  tax: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({
    enum: Object.values(OrderStatus),
    default: OrderStatus.Pending,
  })
  status: OrderStatus;

  @Prop({
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.Unpaid,
  })
  paymentStatus: PaymentStatus;

  @Prop({
    enum: Object.values(DeliveryStatus),
    default: DeliveryStatus.NotAssigned,
  })
  deliveryStatus: DeliveryStatus;

  @Prop({ type: AddressSchema, required: true })
  deliveryAddress: Address;

  @Prop({ trim: true, default: '' })
  notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
