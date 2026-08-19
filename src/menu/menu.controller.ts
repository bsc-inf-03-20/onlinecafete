import {
  Body,
  Controller,
  Delete,
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

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuService } from './menu.service';
import {
  SwaggerCategoryModel,
  SwaggerMenuItemModel,
} from '../swagger/api-models';

@Controller('menu')
@ApiTags('Menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('categories')
  @ApiOperation({
    summary: 'List categories',
    description: 'Return all active menu categories customers can browse.',
  })
  @ApiOkResponse({
    description: 'Active categories.',
    type: SwaggerCategoryModel,
    isArray: true,
  })
  findCategories() {
    return this.menuService.findCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create category',
    description: 'Create a new menu category for the cafeteria catalog.',
  })
  @ApiCreatedResponse({
    description: 'Category created.',
    type: SwaggerCategoryModel,
  })
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.menuService.createCategory(createCategoryDto);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update category',
    description: 'Rename or disable a menu category.',
  })
  @ApiOkResponse({
    description: 'Updated category.',
    type: SwaggerCategoryModel,
  })
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.menuService.updateCategory(id, updateCategoryDto);
  }

  @Get('items')
  @ApiOperation({
    summary: 'List menu items',
    description: 'Return available menu items customers can order.',
  })
  @ApiOkResponse({
    description: 'Available menu items.',
    type: SwaggerMenuItemModel,
    isArray: true,
  })
  findItems() {
    return this.menuService.findItems();
  }

  @Get('items/:id')
  @ApiOperation({
    summary: 'Get menu item',
    description: 'Fetch one menu item by its object id.',
  })
  @ApiOkResponse({
    description: 'Menu item details.',
    type: SwaggerMenuItemModel,
  })
  findItem(@Param('id') id: string) {
    return this.menuService.findItem(id);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create menu item',
    description: 'Add a new dish or drink to the cafeteria catalog.',
  })
  @ApiCreatedResponse({
    description: 'Menu item created.',
    type: SwaggerMenuItemModel,
  })
  createItem(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuService.createItem(createMenuItemDto);
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update menu item',
    description: 'Edit pricing, availability, or item details.',
  })
  @ApiOkResponse({
    description: 'Updated menu item.',
    type: SwaggerMenuItemModel,
  })
  updateItem(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuService.updateItem(id, updateMenuItemDto);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Disable menu item',
    description: 'Soft-disable a menu item so customers can no longer order it.',
  })
  @ApiOkResponse({
    description: 'Disabled menu item.',
    type: SwaggerMenuItemModel,
  })
  removeItem(@Param('id') id: string) {
    return this.menuService.removeItem(id);
  }
}
