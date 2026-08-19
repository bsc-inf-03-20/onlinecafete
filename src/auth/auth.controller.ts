import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from './types/jwt-payload.type';
import {
  SwaggerAuthSessionModel,
  SwaggerUserModel,
} from '../swagger/api-models';

@Controller('auth')
@ApiTags('Auth')
// Nest uses this controller through module metadata, so the class looks unused to ESLint.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Create customer account',
    description: 'Register a new customer profile and return a JWT session.',
  })
  @ApiCreatedResponse({
    description: 'Customer account created successfully.',
    type: SwaggerAuthSessionModel,
  })
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Sign in',
    description: 'Validate credentials and return a fresh JWT session.',
  })
  @ApiOkResponse({
    description: 'Authentication succeeded.',
    type: SwaggerAuthSessionModel,
  })
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Sign out',
    description: 'Client-side logout endpoint for JWT-based sessions.',
  })
  @ApiOkResponse({
    description: 'Logout confirmation.',
  })
  logout() {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current account',
    description: 'Return the authenticated user profile from the JWT token.',
  })
  @ApiOkResponse({
    description: 'Current authenticated user profile.',
    type: SwaggerUserModel,
  })
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.me(user);
  }
}
