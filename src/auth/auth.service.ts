// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, TokenResponseDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      // Use a type assertion to access document methods
      const userObject = (user as any).toObject ? (user as any).toObject() : { ...user };
      const { password: _, ...result } = userObject;
      return result;
    }
    
    return null;
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const { username, password } = loginDto;
    const user = await this.validateUser(username, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = {
      username: user.username,
      sub: user._id,
      role: user.role,
      companyName: user.companyName,
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        companyName: user.companyName,
      },
    };
  }
}
