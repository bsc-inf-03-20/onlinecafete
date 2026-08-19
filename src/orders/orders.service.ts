import { Injectable } from '@nestjs/common';

import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  async create(createOrderDto: CreateOrderDto) {
    throw new Error(
      `OrdersService#create is not implemented yet: ${JSON.stringify(createOrderDto)}`,
    );
  }

  async findAll() {
    throw new Error('OrdersService#findAll is not implemented yet');
  }

  async findOne(id: string) {
    throw new Error(`OrdersService#findOne is not implemented yet: ${id}`);
  }

  async cancel(id: string) {
    throw new Error(`OrdersService#cancel is not implemented yet: ${id}`);
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    throw new Error(
      `OrdersService#updateStatus is not implemented yet: ${id} ${JSON.stringify(updateOrderStatusDto)}`,
    );
  }
}
