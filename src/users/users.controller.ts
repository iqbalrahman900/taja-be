// src/users/users.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { UserRole } from './schemas/user.schema';
  
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
      return this.usersService.create(createUserDto);
    }
  
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findAll(): Promise<UserResponseDto[]> {
      return this.usersService.findAll();
    }
  
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string): Promise<UserResponseDto> {
      return this.usersService.findById(id);
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    update(
      @Param('id') id: string,
      @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
      return this.usersService.update(id, updateUserDto);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string): Promise<void> {
      return this.usersService.remove(id);
    }
  }