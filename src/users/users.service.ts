import { Injectable } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    throw new Error(
      `UsersService#create is not implemented yet: ${JSON.stringify(createUserDto)}`,
    );
  }

  async findAll() {
    throw new Error('UsersService#findAll is not implemented yet');
  }

  async findOne(id: string) {
    throw new Error(`UsersService#findOne is not implemented yet: ${id}`);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    throw new Error(
      `UsersService#update is not implemented yet: ${id} ${JSON.stringify(updateUserDto)}`,
    );
  }
}
