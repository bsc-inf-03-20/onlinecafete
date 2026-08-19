import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateCustomerProfileDto } from './dto/create-customer-profile.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { User, UserDocument } from './schemas/user.schema';
import { UserRole } from '../common/enums/user-role.enum';
import { AddressDto } from '../common/dto/address.dto';
import { Address } from '../common/schemas/address.schema';

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  dietaryPreferences: string[];
  role: UserRole;
  addresses: Address[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  private ensureValidId(id: string) {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }
  }

  private resolveId(id: string, currentUserId?: string) {
    this.ensureValidId(id);
    return id;
  }

  private normalizeAddress(address: AddressDto) {
    return {
      label: address.label || '',
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country || 'South Africa',
      isDefault: address.isDefault || false,
    };
  }

  private toPublicUser(user: UserDocument | (User & { _id?: string })): PublicUser {
    const plain = 'toObject' in user ? user.toObject() : { ...user };
    const { _id, passwordHash, __v, ...safeUser } = plain as {
      _id?: string;
      passwordHash?: string;
      __v?: number;
      [key: string]: unknown;
    };
    return {
      id: String(_id),
      ...(safeUser as Omit<PublicUser, 'id'>),
    } as PublicUser;
  }

  async createCustomerAccount(
    createCustomerProfileDto: Pick<
      CreateCustomerProfileDto,
      'fullName' | 'email' | 'phone'
    > & { avatarUrl?: string; dietaryPreferences?: string[]; addresses?: AddressDto[] },
    passwordHash: string,
  ): Promise<PublicUser> {
    try {
      const createdUser = await this.userModel.create({
        ...createCustomerProfileDto,
        passwordHash,
        role: UserRole.Customer,
        isActive: true,
        addresses: createCustomerProfileDto.addresses?.map((address) =>
          this.normalizeAddress(address),
        ),
      });

      return this.toPublicUser(createdUser);
    } catch (err) {
      if (err?.code === 11000) {
        throw new ConflictException('A profile with that email already exists');
      }

      throw err;
    }
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .select('-passwordHash')
      .exec();

    return users.map((user) => this.toPublicUser(user));
  }

  async findByEmail(email: string, includePassword = false) {
    const query = this.userModel.findOne({
      email: email.toLowerCase(),
    });

    if (includePassword) {
      query.select('+passwordHash');
    } else {
      query.select('-passwordHash');
    }

    return query.exec();
  }

  async findById(id: string): Promise<PublicUser> {
    const resolvedId = this.resolveId(id);
    const user = await this.userModel.findById(resolvedId).select('-passwordHash').exec();

    if (!user) {
      throw new NotFoundException(`User with id "${resolvedId}" not found`);
    }

    return this.toPublicUser(user);
  }

  async updateById(
    id: string,
    updateCustomerProfileDto: UpdateCustomerProfileDto,
  ): Promise<PublicUser> {
    const resolvedId = this.resolveId(id);
    const updatePayload = {
      ...updateCustomerProfileDto,
      ...(updateCustomerProfileDto.addresses
        ? {
            addresses: updateCustomerProfileDto.addresses.map((address) =>
              this.normalizeAddress(address),
            ),
          }
        : {}),
    };

    const updatedUser = await this.userModel
      .findByIdAndUpdate(resolvedId, updatePayload, {
        new: true,
        runValidators: true,
      })
      .select('-passwordHash')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with id "${resolvedId}" not found`);
    }

    return this.toPublicUser(updatedUser);
  }
}
