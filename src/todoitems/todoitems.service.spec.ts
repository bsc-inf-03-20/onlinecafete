import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TodoitemsService } from './todoitems.service';
import { TodoItem } from './schemas/todoitems.schema';

describe('TodoitemsService', () => {
  let service: TodoitemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoitemsService,
        {
          provide: getModelToken(TodoItem.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TodoitemsService>(TodoitemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
