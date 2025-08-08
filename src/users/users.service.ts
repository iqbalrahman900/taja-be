// src/users/users.service.ts (Simplified - No isActive logic)
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto, createdById?: string): Promise<UserResponseDto> {
    // Check if username already exists
    const existingUser = await this.userModel.findOne({ username: createUserDto.username });
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Check if email already exists (if provided)
    if (createUserDto.email) {
      const existingEmail = await this.userModel.findOne({ email: createUserDto.email });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userData: any = {
      ...createUserDto,
      password: hashedPassword,
    };

    // Add createdBy if provided (when admin creates user)
    if (createdById) {
      userData.createdBy = new Types.ObjectId(createdById);
    }

    const user = new this.userModel(userData);
    const savedUser = await user.save();
    
    return this.toResponseDto(await this.findById(savedUser._id.toString()));
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userModel
      .find({})
      .populate('createdBy', 'username fullName')
      .select('-password')
      .sort({ createdAt: -1 });
    
    return users.map(user => this.toResponseDto(user));
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(id)
      .populate('createdBy', 'username fullName');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.findById(id);
    return this.toResponseDto(user);
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check for username conflicts if updating username
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUser = await this.userModel.findOne({ 
        username: updateUserDto.username,
        _id: { $ne: id }
      });
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
    }

    // Check for email conflicts if updating email
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.userModel.findOne({ 
        email: updateUserDto.email,
        _id: { $ne: id }
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password if updating
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .populate('createdBy', 'username fullName');

    return this.toResponseDto(updatedUser);
  }

  async delete(id: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      // Check if this is the last admin
      const adminCount = await this.userModel.countDocuments({ 
        role: UserRole.ADMIN
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last admin user');
      }
    }

    await this.userModel.findByIdAndDelete(id);
  }

  async getUserStats() {
    const totalUsers = await this.userModel.countDocuments();
    const adminUsers = await this.userModel.countDocuments({ role: UserRole.ADMIN });
    const regularUsers = await this.userModel.countDocuments({ role: UserRole.USER });

    return {
      totalUsers,
      adminUsers,
      regularUsers,
    };
  }

  private toResponseDto(user: any): UserResponseDto {
    const dto: UserResponseDto = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      companyName: user.companyName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (user.fullName) dto.fullName = user.fullName;
    if (user.email) dto.email = user.email;

    if (user.createdBy) {
      dto.createdBy = {
        id: user.createdBy._id.toString(),
        username: user.createdBy.username,
        fullName: user.createdBy.fullName,
      };
    }

    return dto;
  }
}