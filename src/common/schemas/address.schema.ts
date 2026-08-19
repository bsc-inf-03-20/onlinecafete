import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Address {
  @Prop({ required: true, trim: true })
  line1: string;

  @Prop({ trim: true, default: '' })
  line2?: string;

  @Prop({ required: true, trim: true })
  city: string;

  @Prop({ required: true, trim: true })
  province: string;

  @Prop({ required: true, trim: true })
  postalCode: string;

  @Prop({ trim: true, default: 'South Africa' })
  country?: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
