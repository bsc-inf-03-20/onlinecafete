import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './types/jwt-payload.type';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async signToken(payload: JwtPayload) {
    return this.jwtService.signAsync(payload);
  }

  private async createAuthResponse(user: { id?: string; _id?: string }) {
    const userId = String(user.id || user._id);
    const publicUser = await this.usersService.findById(userId);
    const payload: JwtPayload = {
      sub: userId,
      email: publicUser.email,
      role: publicUser.role,
    };

    const token = await this.signToken(payload);
    return {
      token,
      user: publicUser,
    };
  }

  async register(registerAuthDto: RegisterAuthDto) {
    const existingUser = await this.usersService.findByEmail(
      registerAuthDto.email,
      true,
    );

    if (existingUser) {
      throw new ConflictException('A profile with that email already exists');
    }

    const passwordHash = await bcrypt.hash(registerAuthDto.password, 12);
    const user = await this.usersService.createCustomerAccount(
      {
        fullName: registerAuthDto.fullName,
        email: registerAuthDto.email,
        phone: registerAuthDto.phone,
      },
      passwordHash,
    );

    return this.createAuthResponse(user);
  }

  async login(loginAuthDto: LoginAuthDto) {
    const userWithPassword = await this.usersService.findByEmail(
      loginAuthDto.email,
      true,
    );

    if (!userWithPassword?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      loginAuthDto.password,
      userWithPassword.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAuthResponse(
      await this.usersService.findById(String(userWithPassword._id)),
    );
  }

  async logout() {
    return {
      message: 'Logged out successfully',
    };
  }

  async me(user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }
}
