import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UsersService } from './users.service';
import { SwaggerUserModel } from '../swagger/api-models';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'List users',
    description: 'Return customer profiles that can be used by the cafeteria app.',
  })
  @ApiOkResponse({
    description: 'List of user profiles.',
    type: SwaggerUserModel,
    isArray: true,
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current profile',
    description: 'Return the authenticated customer profile.',
  })
  @ApiOkResponse({
    description: 'Authenticated user profile.',
    type: SwaggerUserModel,
  })
  me(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current profile',
    description: 'Edit the signed-in customer profile and saved addresses.',
  })
  @ApiOkResponse({
    description: 'Updated user profile.',
    type: SwaggerUserModel,
  })
  updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() updateCustomerProfileDto: UpdateCustomerProfileDto,
  ) {
    return this.usersService.updateById(user.sub, updateCustomerProfileDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id',
    description: 'Fetch a profile using its MongoDB object id.',
  })
  @ApiOkResponse({
    description: 'User profile.',
    type: SwaggerUserModel,
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user by id',
    description: 'Admin or authenticated caller can update the profile record.',
  })
  @ApiOkResponse({
    description: 'Updated user profile.',
    type: SwaggerUserModel,
  })
  update(
    @Param('id') id: string,
    @Body() updateCustomerProfileDto: UpdateCustomerProfileDto,
  ) {
    return this.usersService.updateById(id, updateCustomerProfileDto);
  }
}
