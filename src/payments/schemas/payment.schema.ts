import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Order } from '../../orders/schemas/order.schema';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { User } from '../../users/schemas/user.schema';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: Order.name, required: true, unique: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, trim: true, default: 'ZAR' })
  currency: string;

  @Prop({
    enum: Object.values(PaymentMethod),
    required: true,
  })
  method: PaymentMethod;

  @Prop({
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.Pending,
  })
  status: PaymentStatus;

  @Prop({ trim: true, default: '' })
  provider?: string;

  @Prop({ trim: true, default: '' })
  providerReference?: string;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, unknown>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
