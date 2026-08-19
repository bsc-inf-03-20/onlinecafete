import { Injectable } from '@nestjs/common';

import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';

@Injectable()
export class AuthService {
  async register(registerAuthDto: RegisterAuthDto) {
    throw new Error(
      `AuthService#register is not implemented yet: ${JSON.stringify(
        registerAuthDto,
      )}`,
    );
  }

  async login(loginAuthDto: LoginAuthDto) {
    throw new Error(
      `AuthService#login is not implemented yet: ${JSON.stringify(
        loginAuthDto,
      )}`,
    );
  }

  async logout() {
    throw new Error('AuthService#logout is not implemented yet');
  }

  async me() {
    throw new Error('AuthService#me is not implemented yet');
  }
}
