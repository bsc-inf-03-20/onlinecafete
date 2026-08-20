import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';
import { SwaggerOrderModel } from '../swagger/api-models';
import { PaymentsService } from '../payments/payments.service';
import { SwaggerPaymentModel } from '../swagger/api-models';

@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiTags('Orders')
@ApiBearerAuth()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create order',
    description: 'Create a real order from menu item ids and server-calculated totals.',
  })
  @ApiCreatedResponse({
    description: 'Order created successfully.',
    type: SwaggerOrderModel,
  })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(user, createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List orders',
    description: 'Return the signed-in customer orders or all orders for admin users.',
  })
  @ApiOkResponse({
    description: 'Orders list.',
    type: SwaggerOrderModel,
    isArray: true,
  })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.ordersService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order',
    description: 'Fetch one order by id, respecting owner and admin access.',
  })
  @ApiOkResponse({
    description: 'Order details.',
    type: SwaggerOrderModel,
  })
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.ordersService.findOne(id, user);
  }

  @Get(':id/payment')
  @ApiOperation({
    summary: 'Get order payment',
    description: 'Return the payment record attached to an order.',
  })
  @ApiOkResponse({
    description: 'Payment record for the order.',
    type: SwaggerPaymentModel,
  })
  findPayment(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.findByOrderId(id, user);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancel order',
    description: 'Cancel an order while it is still in a cancellable state.',
  })
  @ApiOkResponse({
    description: 'Cancelled order.',
    type: SwaggerOrderModel,
  })
  cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.ordersService.cancel(id, user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({
    summary: 'Update order status',
    description: 'Advance the order through the kitchen and delivery workflow.',
  })
  @ApiOkResponse({
    description: 'Updated order.',
    type: SwaggerOrderModel,
  })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, user, updateOrderStatusDto);
  }
}
