// src/auth/auth.service.ts (Simplified - No isActive check)
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

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id.toString(),
      username: user.username,
      role: user.role,
      companyName: user.companyName,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        companyName: user.companyName,
        fullName: user.fullName,
        email: user.email,
      },
    };
  }
}