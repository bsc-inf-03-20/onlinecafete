import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from './category.schema';

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description?: string;

  @Prop({ required: true, min: 0.01 })
  price: number;

  @Prop({ trim: true, default: '' })
  imageUrl?: string;

  @Prop({
    type: Types.ObjectId,
    ref: Category.name,
    required: true,
    index: true,
  })
  categoryId: Types.ObjectId;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: 0 })
  prepTimeMinutes?: number;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
