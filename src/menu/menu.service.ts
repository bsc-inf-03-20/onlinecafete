import { Injectable } from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  async findCategories() {
    throw new Error('MenuService#findCategories is not implemented yet');
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    throw new Error(
      `MenuService#createCategory is not implemented yet: ${JSON.stringify(createCategoryDto)}`,
    );
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto) {
    throw new Error(
      `MenuService#updateCategory is not implemented yet: ${id} ${JSON.stringify(updateCategoryDto)}`,
    );
  }

  async findItems() {
    throw new Error('MenuService#findItems is not implemented yet');
  }

  async findItem(id: string) {
    throw new Error(`MenuService#findItem is not implemented yet: ${id}`);
  }

  async createItem(createMenuItemDto: CreateMenuItemDto) {
    throw new Error(
      `MenuService#createItem is not implemented yet: ${JSON.stringify(createMenuItemDto)}`,
    );
  }

  async updateItem(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    throw new Error(
      `MenuService#updateItem is not implemented yet: ${id} ${JSON.stringify(updateMenuItemDto)}`,
    );
  }

  async removeItem(id: string) {
    throw new Error(`MenuService#removeItem is not implemented yet: ${id}`);
  }
}
