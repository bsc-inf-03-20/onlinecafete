import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { Category, CategoryDocument } from './schemas/category.schema';
import { MenuItem, MenuItemDocument } from './schemas/menu-item.schema';

type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type PublicMenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  isAvailable: boolean;
  prepTimeMinutes?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(MenuItem.name)
    private readonly menuItemModel: Model<MenuItemDocument>,
  ) {}

  private ensureValidId(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid menu id');
    }
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private toPublicCategory(category: any): PublicCategory {
    const plain = 'toObject' in category ? category.toObject() : { ...category };
    const { _id, ...safeCategory } = plain as {
      _id?: string;
      __v?: number;
      [key: string]: unknown;
    };

    return {
      id: String(_id),
      ...(safeCategory as Omit<PublicCategory, 'id'>),
    } as PublicCategory;
  }

  private toPublicMenuItem(menuItem: any): PublicMenuItem {
    const plain = 'toObject' in menuItem ? menuItem.toObject() : { ...menuItem };
    const { _id, ...safeMenuItem } = plain as {
      _id?: string;
      __v?: number;
      [key: string]: unknown;
    };
    const categoryId = String(
      (safeMenuItem as { categoryId?: unknown }).categoryId,
    );

    return {
      id: String(_id),
      categoryId,
      ...(safeMenuItem as Omit<PublicMenuItem, 'id' | 'categoryId'>),
    } as PublicMenuItem;
  }

  private async ensureCategoryExists(categoryId: string) {
    this.ensureValidId(categoryId);

    const category = await this.categoryModel.findById(categoryId).exec();
    if (!category) {
      throw new NotFoundException(`Category with id "${categoryId}" not found`);
    }

    return category;
  }

  async findCategories(): Promise<PublicCategory[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .exec();

    return categories.map((category: any) => this.toPublicCategory(category));
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
  ): Promise<PublicCategory> {
    const slug = this.slugify(createCategoryDto.name);

    try {
      const category = await this.categoryModel.create({
        name: createCategoryDto.name,
        slug,
        isActive: true,
      });

      return this.toPublicCategory(category);
    } catch (err) {
      if (err?.code === 11000) {
        throw new ConflictException('A category with that name already exists');
      }

      throw err;
    }
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<PublicCategory> {
    this.ensureValidId(id);

    const updatePayload = {
      ...updateCategoryDto,
      ...(updateCategoryDto.name
        ? { slug: this.slugify(updateCategoryDto.name) }
        : {}),
    };

    const category = await this.categoryModel
      .findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return this.toPublicCategory(category);
  }

  async findItems(): Promise<PublicMenuItem[]> {
    const menuItems = await this.menuItemModel
      .find({ isAvailable: true })
      .sort({ createdAt: -1 })
      .exec();

    return menuItems.map((menuItem: any) => this.toPublicMenuItem(menuItem));
  }

  async findItem(id: string): Promise<PublicMenuItem> {
    this.ensureValidId(id);

    const menuItem = await this.menuItemModel.findById(id).exec();
    if (!menuItem) {
      throw new NotFoundException(`Menu item with id "${id}" not found`);
    }

    return this.toPublicMenuItem(menuItem);
  }

  async createItem(
    createMenuItemDto: CreateMenuItemDto,
  ): Promise<PublicMenuItem> {
    await this.ensureCategoryExists(createMenuItemDto.categoryId);

    const menuItem = await this.menuItemModel.create({
      ...createMenuItemDto,
      isAvailable: createMenuItemDto.isAvailable ?? true,
    });

    return this.toPublicMenuItem(menuItem);
  }

  async updateItem(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
  ): Promise<PublicMenuItem> {
    this.ensureValidId(id);

    if (updateMenuItemDto.categoryId) {
      await this.ensureCategoryExists(updateMenuItemDto.categoryId);
    }

    const menuItem = await this.menuItemModel
      .findByIdAndUpdate(id, updateMenuItemDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!menuItem) {
      throw new NotFoundException(`Menu item with id "${id}" not found`);
    }

    return this.toPublicMenuItem(menuItem);
  }

  async removeItem(id: string): Promise<PublicMenuItem> {
    this.ensureValidId(id);

    const menuItem = await this.menuItemModel
      .findByIdAndUpdate(
        id,
        {
          isAvailable: false,
        },
        { new: true },
      )
      .exec();

    if (!menuItem) {
      throw new NotFoundException(`Menu item with id "${id}" not found`);
    }

    return this.toPublicMenuItem(menuItem);
  }
}
