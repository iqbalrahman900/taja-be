// src/users/users.controller.ts (No activate/deactivate endpoints)
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const createdUser = await this.usersService.create(createUserDto, req.user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: createdUser,
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getStats() {
    const stats = await this.usersService.getUserStats();
    return {
      statusCode: HttpStatus.OK,
      message: 'User statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile retrieved successfully',
      data: user,
    };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.update(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
    };
  }
}