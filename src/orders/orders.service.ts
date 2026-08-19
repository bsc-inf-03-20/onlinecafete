import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { JwtPayload } from '../auth/types/jwt-payload.type';
import { DeliveryStatus } from '../common/enums/delivery-status.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { MenuItem, MenuItemDocument } from '../menu/schemas/menu-item.schema';
import { Order, OrderDocument } from './schemas/order.schema';

type PublicOrderItem = {
  menuItemId: string;
  nameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
};

type PublicOrder = {
  id: string;
  userId: string;
  orderNumber: string;
  items: PublicOrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  deliveryAddress: Record<string, unknown>;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const DELIVERY_FEE = 20;
const TAX_RATE = 0;

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
  ) {}

  private ensureValidId(id: string, label: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${label}`);
    }
  }

  private normalizeAddress(address: CreateOrderDto['deliveryAddress']) {
    return {
      label: address.label || '',
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country || 'South Africa',
      isDefault: address.isDefault || false,
    };
  }

  private toPublicOrder(order: any): PublicOrder {
    const plain = 'toObject' in order ? order.toObject() : { ...order };
    const { _id, ...safeOrder } = plain as {
      _id?: string;
      __v?: number;
      [key: string]: unknown;
    };

    const items = Array.isArray((safeOrder as { items?: unknown }).items)
      ? ((safeOrder as { items?: PublicOrderItem[] }).items || []).map((item) => ({
          menuItemId: String(item.menuItemId),
          nameSnapshot: item.nameSnapshot,
          unitPriceSnapshot: item.unitPriceSnapshot,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        }))
      : [];

    return {
      id: String(_id),
      userId: String((safeOrder as { userId?: unknown }).userId),
      orderNumber: String((safeOrder as { orderNumber?: unknown }).orderNumber),
      items,
      subtotal: Number((safeOrder as { subtotal?: unknown }).subtotal || 0),
      deliveryFee: Number((safeOrder as { deliveryFee?: unknown }).deliveryFee || 0),
      tax: Number((safeOrder as { tax?: unknown }).tax || 0),
      total: Number((safeOrder as { total?: unknown }).total || 0),
      status: (safeOrder as { status: OrderStatus }).status,
      paymentStatus: (safeOrder as { paymentStatus: PaymentStatus }).paymentStatus,
      deliveryStatus: (safeOrder as { deliveryStatus: DeliveryStatus }).deliveryStatus,
      deliveryAddress: (safeOrder as { deliveryAddress?: Record<string, unknown> })
        .deliveryAddress || {},
      notes: (safeOrder as { notes?: string }).notes,
      createdAt: (safeOrder as { createdAt?: Date }).createdAt,
      updatedAt: (safeOrder as { updatedAt?: Date }).updatedAt,
    } as PublicOrder;
  }

  private isOrderOwner(order: any, userId: string) {
    return String(order.userId) === String(userId);
  }

  private ensureCanViewOrder(order: any, currentUser: JwtPayload) {
    if (
      currentUser.role !== UserRole.Admin &&
      !this.isOrderOwner(order, currentUser.sub)
    ) {
      throw new ForbiddenException('You can only view your own orders');
    }
  }

  private ensureCanManageOrder(order: any, currentUser: JwtPayload) {
    if (
      currentUser.role !== UserRole.Admin &&
      !this.isOrderOwner(order, currentUser.sub)
    ) {
      throw new ForbiddenException('You can only manage your own orders');
    }
  }

  private canCancel(status: OrderStatus) {
    return [OrderStatus.Pending, OrderStatus.Confirmed].includes(status);
  }

  private canTransition(from: OrderStatus, to: OrderStatus) {
    const allowed: Partial<Record<OrderStatus, OrderStatus[]>> = {
      [OrderStatus.Draft]: [OrderStatus.Pending, OrderStatus.Cancelled],
      [OrderStatus.Pending]: [OrderStatus.Confirmed, OrderStatus.Cancelled],
      [OrderStatus.Confirmed]: [OrderStatus.Preparing, OrderStatus.Cancelled],
      [OrderStatus.Preparing]: [OrderStatus.ReadyForDelivery],
      [OrderStatus.ReadyForDelivery]: [OrderStatus.OutForDelivery],
      [OrderStatus.OutForDelivery]: [OrderStatus.Delivered],
      [OrderStatus.Delivered]: [],
      [OrderStatus.Cancelled]: [],
    };

    return allowed[from]?.includes(to) || false;
  }

  private async resolveMenuItems(items: CreateOrderDto['items']) {
    const menuItemIds = items.map((item) => item.menuItemId);
    const menuItems = await this.menuItemModel
      .find({
        _id: { $in: menuItemIds },
        isAvailable: true,
      })
      .exec();

    const menuItemMap = new Map<string, any>();
    for (const menuItem of menuItems as any[]) {
      menuItemMap.set(String(menuItem._id), menuItem);
    }

    for (const item of items) {
      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) {
        throw new NotFoundException(
          `Menu item with id "${item.menuItemId}" not found or unavailable`,
        );
      }
    }

    return items.map((item) => {
      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) {
        throw new NotFoundException(
          `Menu item with id "${item.menuItemId}" not found or unavailable`,
        );
      }

      const quantity = Number(item.quantity);
      const lineTotal = Number((menuItem.price * quantity).toFixed(2));

      return {
        menuItemId: new Types.ObjectId(menuItem._id),
        nameSnapshot: menuItem.name,
        unitPriceSnapshot: menuItem.price,
        quantity,
        lineTotal,
      };
    });
  }

  private async generateOrderNumber() {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `ORD-${datePart}-`;
    const count = await this.orderModel.countDocuments({
      orderNumber: new RegExp(`^${prefix}`),
    });
    const sequence = String(count + 1).padStart(4, '0');
    return `${prefix}${sequence}`;
  }

  async create(currentUser: JwtPayload, createOrderDto: CreateOrderDto) {
    if (currentUser.role === UserRole.Delivery) {
      throw new ForbiddenException('Delivery accounts cannot place orders');
    }

    const orderItems = await this.resolveMenuItems(createOrderDto.items);
    const subtotal = Number(
      orderItems
        .reduce((total, item) => total + item.lineTotal, 0)
        .toFixed(2),
    );
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const deliveryFee = DELIVERY_FEE;
    const total = Number((subtotal + tax + deliveryFee).toFixed(2));

    const orderNumber = await this.generateOrderNumber();
    const createdOrder = await this.orderModel.create({
      userId: new Types.ObjectId(currentUser.sub),
      orderNumber,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      total,
      status: OrderStatus.Pending,
      paymentStatus: PaymentStatus.Unpaid,
      deliveryStatus: DeliveryStatus.NotAssigned,
      deliveryAddress: this.normalizeAddress(createOrderDto.deliveryAddress),
      notes: createOrderDto.notes || '',
    });

    return this.toPublicOrder(createdOrder);
  }

  async findAll(currentUser: JwtPayload) {
    const filter =
      currentUser.role === UserRole.Admin ? {} : { userId: currentUser.sub };

    const orders = await this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();

    return orders.map((order: any) => this.toPublicOrder(order));
  }

  async findOne(id: string, currentUser: JwtPayload) {
    this.ensureValidId(id, 'order id');

    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    this.ensureCanViewOrder(order, currentUser);
    return this.toPublicOrder(order);
  }

  async cancel(id: string, currentUser: JwtPayload) {
    this.ensureValidId(id, 'order id');

    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    this.ensureCanManageOrder(order, currentUser);

    if (!this.canCancel(order.status)) {
      throw new BadRequestException(
        `Order "${order.orderNumber}" can no longer be cancelled`,
      );
    }

    order.status = OrderStatus.Cancelled;
    if (order.paymentStatus === PaymentStatus.Paid) {
      order.paymentStatus = PaymentStatus.Refunded;
    }
    await order.save();

    return this.toPublicOrder(order);
  }

  async updateStatus(
    id: string,
    currentUser: JwtPayload,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    this.ensureValidId(id, 'order id');

    const order = await this.orderModel.findById(id).exec();
    if (!order) {
      throw new NotFoundException(`Order with id "${id}" not found`);
    }

    if (currentUser.role !== UserRole.Admin) {
      throw new ForbiddenException('Only admins can update order status');
    }

    if (!this.canTransition(order.status, updateOrderStatusDto.status)) {
      throw new BadRequestException(
        `Cannot change order status from "${order.status}" to "${updateOrderStatusDto.status}"`,
      );
    }

    order.status = updateOrderStatusDto.status;
    await order.save();

    return this.toPublicOrder(order);
  }
}
