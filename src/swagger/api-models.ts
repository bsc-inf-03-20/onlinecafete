import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryStatus } from '../common/enums/delivery-status.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

export class SwaggerAddressModel {
  @ApiProperty({ example: '12 Main Road' })
  line1: string;

  @ApiPropertyOptional({ example: 'Unit 4' })
  line2?: string;

  @ApiProperty({ example: 'Johannesburg' })
  city: string;

  @ApiProperty({ example: 'Gauteng' })
  province: string;

  @ApiProperty({ example: '2000' })
  postalCode: string;

  @ApiPropertyOptional({ example: 'South Africa' })
  country?: string;

  @ApiPropertyOptional({ example: 'Home' })
  label?: string;

  @ApiPropertyOptional({ example: true })
  isDefault?: boolean;
}

export class SwaggerUserModel {
  @ApiProperty({ example: '66c2f1e3f1f1f1f1f1f1f1f1' })
  id: string;

  @ApiProperty({ example: 'Jane Doe' })
  fullName: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+27123456789' })
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string;

  @ApiProperty({ example: ['vegetarian'], type: [String] })
  dietaryPreferences: string[];

  @ApiProperty({ enum: UserRole, example: UserRole.Customer })
  role: UserRole;

  @ApiProperty({ type: [SwaggerAddressModel] })
  addresses: SwaggerAddressModel[];

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: '2026-08-19T12:00:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ example: '2026-08-19T12:30:00.000Z' })
  updatedAt?: Date;
}

export class SwaggerAuthSessionModel {
  @ApiProperty({ example: 'jwt-token-here' })
  token: string;

  @ApiProperty({ type: SwaggerUserModel })
  user: SwaggerUserModel;
}

export class SwaggerCategoryModel {
  @ApiProperty({ example: '66c2f1e3f1f1f1f1f1f1f1a' })
  id: string;

  @ApiProperty({ example: 'Meals' })
  name: string;

  @ApiProperty({ example: 'meals' })
  slug: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiPropertyOptional({ example: '2026-08-19T12:00:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ example: '2026-08-19T12:30:00.000Z' })
  updatedAt?: Date;
}

export class SwaggerMenuItemModel {
  @ApiProperty({ example: '66c2f1e3f1f1f1f1f1f1f1b' })
  id: string;

  @ApiProperty({ example: 'Chicken Wrap' })
  name: string;

  @ApiPropertyOptional({ example: 'Grilled chicken wrap' })
  description?: string;

  @ApiProperty({ example: 65 })
  price: number;

  @ApiPropertyOptional({ example: '/images/chicken-wrap.jpg' })
  imageUrl?: string;

  @ApiProperty({ example: '66c2f1e3f1f1f1f1f1f1f1a' })
  categoryId: string;

  @ApiProperty({ example: true })
  isAvailable: boolean;

  @ApiPropertyOptional({ example: 15 })
  prepTimeMinutes?: number;

  @ApiPropertyOptional({ example: '2026-08-19T12:00:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ example: '2026-08-19T12:30:00.000Z' })
  updatedAt?: Date;
}

export class SwaggerOrderItemModel {
  @ApiProperty({ example: '66c2f1e3f1f1f1f1f1f1f1b' })
  menuItemId: string;

  @ApiProperty({ example: 'Chicken Wrap' })
  nameSnapshot: string;

  @ApiProperty({ example: 65 })
  unitPriceSnapshot: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 130 })
  lineTotal: number;
}

export class SwaggerOrderModel {
  @ApiProperty({ example: '66c2f1e3f1f1f1f1f1f1f1c' })
  id: string;

  @ApiProperty({ example: '66c2f1e3f1f1f1f1f1f1f1f1' })
  userId: string;

  @ApiProperty({ example: 'ORD-20260819-0001' })
  orderNumber: string;

  @ApiProperty({ type: [SwaggerOrderItemModel] })
  items: SwaggerOrderItemModel[];

  @ApiProperty({ example: 130 })
  subtotal: number;

  @ApiProperty({ example: 20 })
  deliveryFee: number;

  @ApiProperty({ example: 0 })
  tax: number;

  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.Pending })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.Unpaid })
  paymentStatus: PaymentStatus;

  @ApiProperty({ enum: DeliveryStatus, example: DeliveryStatus.NotAssigned })
  deliveryStatus: DeliveryStatus;

  @ApiProperty({ type: SwaggerAddressModel })
  deliveryAddress: SwaggerAddressModel;

  @ApiPropertyOptional({ example: 'No onions' })
  notes?: string;

  @ApiPropertyOptional({ example: '2026-08-19T12:00:00.000Z' })
  createdAt?: Date;

  @ApiPropertyOptional({ example: '2026-08-19T12:30:00.000Z' })
  updatedAt?: Date;
}
