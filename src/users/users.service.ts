// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    // Create default admin user if no admin exists
    const adminExists = await this.userModel.findOne({ role: UserRole.ADMIN }).exec();
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.userModel.create({
        username: 'admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
        companyName: 'Music Catalog Admin',
      });
      console.log('Default admin user created');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { username, password, role, companyName, fullName, email } = createUserDto;

    // Check if user already exists
    const userExists = await this.userModel.findOne({ username }).exec();
    if (userExists) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await this.userModel.create({
      username,
      password: hashedPassword,
      role,
      companyName,
      fullName,
      email,
    });

    return this.mapToDto(newUser);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return this.mapToDto(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userModel.find().exec();
    return users.map(user => this.mapToDto(user));
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return this.mapToDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  private mapToDto(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      companyName: user.companyName,
      fullName: user.fullName || undefined,
      email: user.email || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
