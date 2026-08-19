import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';
import { Address, AddressSchema } from '../../common/schemas/address.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ select: false })
  passwordHash?: string;

  @Prop({ trim: true, default: '' })
  phone?: string;

  @Prop({ trim: true, default: '' })
  avatarUrl?: string;

  @Prop({ type: [String], default: [] })
  dietaryPreferences: string[];

  @Prop({ enum: Object.values(UserRole), default: UserRole.Customer })
  role: UserRole;

  @Prop({ type: [AddressSchema], default: [] })
  addresses: Address[];

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
