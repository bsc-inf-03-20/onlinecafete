import { Test, TestingModule } from '@nestjs/testing';
import { TodoitemsController } from './todoitems.controller';
import { TodoitemsService } from './todoitems.service';

describe('TodoitemsController', () => {
  let controller: TodoitemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoitemsController],
      providers: [
        {
          provide: TodoitemsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TodoitemsController>(TodoitemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
