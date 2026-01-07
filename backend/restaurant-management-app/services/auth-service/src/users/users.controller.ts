import { Controller, Get, HttpCode, Req, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard, AuthRequest } from '../auth/guards/auth.guard';
import { AuthDto } from '@rm/common';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('current')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async currentUser(@Req() request: AuthRequest): Promise<AuthDto.UserDto> {
    return request.user as AuthDto.UserDto;
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile information' })
  @ApiResponse({ status: 200, description: 'Returns user profile information' })
  @HttpCode(200)
  async getUserProfile(@Req() request: AuthRequest): Promise<any> {
    return this.usersService.getUserProfile(request.user._id);
  }

  @Get('orders')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user orders with statistics' })
  @ApiResponse({ status: 200, description: 'Returns user orders and statistics' })
  @HttpCode(200)
  async getUserOrders(@Req() request: AuthRequest): Promise<any> {
    return this.usersService.getUserOrders(request.user._id);
  }

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getAllUsers(): Promise<any[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async getUserById(@Param('id') id: string): Promise<any> {
    return this.usersService.findById(id);
  }
}
