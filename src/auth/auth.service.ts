/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(BlacklistedToken)
    private blacklistRepository: Repository<BlacklistedToken>,
  ) { }

  /**
   * REGISTRATION (Customer Only)
   */
  async register(email: string, pass: string): Promise<any> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
    });

    const { password, ...result } = user;
    return result;
  }

  /**
   * LOGIN (Both Roles)
   */
  async login(email: string, pass: string, response: Response) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * REAL LOGOUT
   * This method saves the token to a database blacklist to invalidate it server-side.
   */
  async logout(authHeader: string, response: Response): Promise<{ message: string }> {
    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    const blacklisted = this.blacklistRepository.create({ token });
    await this.blacklistRepository.save(blacklisted);

    response.clearCookie('refresh_token');

    return { message: 'Logged out successfully. Token is now invalidated.' };
  }

  /**
   * Refresh user token
   */
  async refreshToken(refreshToken: string, response: Response) {
    // Check that a refresh token was actually sent with the request.
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    try {
      // I use jwtService.verifyAsync to decode AND verify the token at the same time.
      // If the token is expired, tampered with, or signed with a different secret — this will throw.
      // I pass the secret manually here because I want to be explicit about which secret I'm using.
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // At this point, the refresh token is valid. 
      // Check the user is available
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        // The token was valid but the user no longer exists in the DB — reject it.
        throw new UnauthorizedException('User not found');
      }

      // Build a fresh payload with the latest user data.
      // Rebuild from DB in case the role changed.
      const newPayload = { sub: user.id, email: user.email, role: user.role };

      // Sign a brand new short-lived access token and return it.
      const newAccessToken = await this.jwtService.signAsync(newPayload);

      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '7d',
      });
      // Remove the old refresh token
      response.clearCookie('refresh_token');

      response.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { access_token: newAccessToken };
    } catch {
      // I catch it here and return a clean 401 instead of leaking error details.
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}

