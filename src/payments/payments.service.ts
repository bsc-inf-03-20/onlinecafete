import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { JwtPayload } from '../auth/types/jwt-payload.type';
import { OrderStatus } from '../common/enums/order-status.enum';
import { PaymentMethod } from '../common/enums/payment-method.enum';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { Payment, PaymentDocument } from './schemas/payment.schema';

type PublicPayment = {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider?: string;
  providerReference?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  private ensureValidId(id: string, label: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${label}`);
    }
  }

  private toPublicPayment(payment: any): PublicPayment {
    const plain = 'toObject' in payment ? payment.toObject() : { ...payment };
    const { _id, ...safePayment } = plain as {
      _id?: string;
      __v?: number;
      [key: string]: unknown;
    };

    return {
      id: String(_id),
      orderId: String((safePayment as { orderId?: unknown }).orderId),
      userId: String((safePayment as { userId?: unknown }).userId),
      amount: Number((safePayment as { amount?: unknown }).amount || 0),
      currency: String(
        (safePayment as { currency?: unknown }).currency || 'ZAR',
      ),
      method: (safePayment as { method: PaymentMethod }).method,
      status: (safePayment as { status: PaymentStatus }).status,
      provider: (safePayment as { provider?: string }).provider,
      providerReference: (safePayment as { providerReference?: string })
        .providerReference,
      createdAt: (safePayment as { createdAt?: Date }).createdAt,
      updatedAt: (safePayment as { updatedAt?: Date }).updatedAt,
    };
  }

  private ensureOrderOwner(order: any, currentUser: JwtPayload) {
    if (
      currentUser.role !== UserRole.Admin &&
      String(order.userId) !== String(currentUser.sub)
    ) {
      throw new ForbiddenException('You can only pay for your own orders');
    }
  }

  private verifyWebhookSignature(signature?: string) {
    const expected = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!expected) {
      return true;
    }

    if (!signature || signature !== expected) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }

  async initialize(
    currentUser: JwtPayload,
    initializePaymentDto: InitializePaymentDto,
  ) {
    this.ensureValidId(initializePaymentDto.orderId, 'order id');

    const order = await this.orderModel
      .findById(initializePaymentDto.orderId)
      .exec();
    if (!order) {
      throw new NotFoundException(
        `Order with id "${initializePaymentDto.orderId}" not found`,
      );
    }

    this.ensureOrderOwner(order, currentUser);

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestException('Cancelled orders cannot be paid');
    }

    const existingPayment = await this.paymentModel
      .findOne({ orderId: order._id })
      .exec();
    if (existingPayment) {
      const publicPayment = this.toPublicPayment(existingPayment);
      return {
        paymentId: publicPayment.id,
        orderId: publicPayment.orderId,
        status: publicPayment.status,
        amount: publicPayment.amount,
        currency: publicPayment.currency,
        method: publicPayment.method,
      };
    }

    const payment = await this.paymentModel.create({
      orderId: order._id,
      userId: order.userId,
      amount: order.total,
      currency: 'ZAR',
      method: initializePaymentDto.method,
      status: PaymentStatus.Pending,
      provider: '',
      providerReference: '',
      metadata: {},
    });

    order.paymentStatus = PaymentStatus.Pending;
    await order.save();

    const publicPayment = this.toPublicPayment(payment);
    return {
      paymentId: publicPayment.id,
      orderId: publicPayment.orderId,
      status: publicPayment.status,
      amount: publicPayment.amount,
      currency: publicPayment.currency,
      method: publicPayment.method,
    };
  }

  async handleWebhook(paymentWebhookDto: PaymentWebhookDto) {
    this.verifyWebhookSignature(paymentWebhookDto.signature);
    this.ensureValidId(paymentWebhookDto.orderId, 'order id');

    const order = await this.orderModel
      .findById(paymentWebhookDto.orderId)
      .exec();
    if (!order) {
      throw new NotFoundException(
        `Order with id "${paymentWebhookDto.orderId}" not found`,
      );
    }

    const payment = await this.paymentModel
      .findOne({
        orderId: order._id,
      })
      .exec();

    if (!payment) {
      throw new NotFoundException(
        `Payment for order "${paymentWebhookDto.orderId}" not found`,
      );
    }

    payment.status = paymentWebhookDto.status;
    payment.provider = paymentWebhookDto.provider || payment.provider || '';
    payment.providerReference =
      paymentWebhookDto.providerReference || payment.providerReference || '';
    payment.metadata = {
      ...(payment.metadata || {}),
      receivedAt: new Date().toISOString(),
    };
    await payment.save();

    if (paymentWebhookDto.status === PaymentStatus.Paid) {
      order.paymentStatus = PaymentStatus.Paid;
      if (order.status === OrderStatus.Pending) {
        order.status = OrderStatus.Confirmed;
      }
    } else if (paymentWebhookDto.status === PaymentStatus.Failed) {
      order.paymentStatus = PaymentStatus.Failed;
    } else if (paymentWebhookDto.status === PaymentStatus.Refunded) {
      order.paymentStatus = PaymentStatus.Refunded;
    } else {
      order.paymentStatus = PaymentStatus.Pending;
    }

    await order.save();
    return this.toPublicPayment(payment);
  }

  async findOne(id: string, currentUser: JwtPayload) {
    this.ensureValidId(id, 'payment id');

    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with id "${id}" not found`);
    }

    if (
      currentUser.role !== UserRole.Admin &&
      String(payment.userId) !== String(currentUser.sub)
    ) {
      throw new ForbiddenException(
        'You can only view your own payment records',
      );
    }

    return this.toPublicPayment(payment);
  }

  async findByOrderId(orderId: string, currentUser: JwtPayload) {
    this.ensureValidId(orderId, 'order id');

    const payment = await this.paymentModel
      .findOne({ orderId: new Types.ObjectId(orderId) })
      .exec();
    if (!payment) {
      throw new NotFoundException(`Payment for order "${orderId}" not found`);
    }

    if (
      currentUser.role !== UserRole.Admin &&
      String(payment.userId) !== String(currentUser.sub)
    ) {
      throw new ForbiddenException(
        'You can only view your own payment records',
      );
    }

    return this.toPublicPayment(payment);
  }
}
