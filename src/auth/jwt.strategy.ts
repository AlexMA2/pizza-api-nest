import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlacklistedToken } from './entities/blacklisted-token.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(BlacklistedToken)
    private blacklistRepository: Repository<BlacklistedToken>,
  ) {
    super({
      // Extract the jwt token from the Bearer <TOKEN>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Reject expired tokens
      ignoreExpiration: false,
      // It is used to decrypt the token
      secretOrKey: configService.get<string>('JWT_SECRET')!,
      passReqToCallback: true, // This allows us to access the raw request
    });
  }

  async validate(req: any, payload: any) {
    // 1. Get the raw token from the header
    const token = req.headers.authorization.split(' ')[1];

    // 2. Check if the token is in my database blacklist
    const isBlacklisted = await this.blacklistRepository.findOne({
      where: { token },
    });

    if (isBlacklisted) {
      // If it's blacklisted, we block the request even if the token is valid!
      throw new UnauthorizedException(
        'Token has been invalidated (logged out)',
      );
    }

    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
