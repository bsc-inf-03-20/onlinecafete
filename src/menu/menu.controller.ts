import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('categories')
  findCategories() {
    return this.menuService.findCategories();
  }

  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.menuService.createCategory(createCategoryDto);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.menuService.updateCategory(id, updateCategoryDto);
  }

  @Get('items')
  findItems() {
    return this.menuService.findItems();
  }

  @Get('items/:id')
  findItem(@Param('id') id: string) {
    return this.menuService.findItem(id);
  }

  @Post('items')
  createItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuService.createItem(createMenuItemDto);
  }

  @Patch('items/:id')
  updateItem(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuService.updateItem(id, updateMenuItemDto);
  }

  @Delete('items/:id')
  removeItem(@Param('id') id: string) {
    return this.menuService.removeItem(id);
  }
}
