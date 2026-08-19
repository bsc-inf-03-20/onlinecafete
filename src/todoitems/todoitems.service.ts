import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateTodoitemDto } from './dto/create-todoitem.dto';
import { UpdateTodoitemDto } from './dto/update-todoitem.dto';
import { TodoItem, TodoItemDocument } from './schemas/todoitems.schema';

@Injectable()
export class TodoitemsService {
  constructor(
    @InjectModel(TodoItem.name)
    private readonly todoItemModel: Model<TodoItemDocument>,
  ) {}

  private ensureValidId(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid todo id');
    }
  }

  async create(createTodoitemDto: CreateTodoitemDto): Promise<TodoItem> {
    return this.todoItemModel.create(createTodoitemDto);
  }

  async findAll(): Promise<TodoItem[]> {
    return this.todoItemModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<TodoItem> {
    this.ensureValidId(id);

    const todoItem = await this.todoItemModel.findById(id).exec();
    if (!todoItem) {
      throw new NotFoundException(`Todo item with id "${id}" not found`);
    }

    return todoItem;
  }

  async update(
    id: string,
    updateTodoitemDto: UpdateTodoitemDto,
  ): Promise<TodoItem> {
    this.ensureValidId(id);

    const todoItem = await this.todoItemModel
      .findByIdAndUpdate(id, updateTodoitemDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!todoItem) {
      throw new NotFoundException(`Todo item with id "${id}" not found`);
    }

    return todoItem;
  }

  async remove(id: string): Promise<TodoItem> {
    this.ensureValidId(id);

    const todoItem = await this.todoItemModel.findByIdAndDelete(id).exec();
    if (!todoItem) {
      throw new NotFoundException(`Todo item with id "${id}" not found`);
    }

    return todoItem;
  }
}
