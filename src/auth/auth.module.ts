import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistedToken } from './entities/blacklisted-token.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([BlacklistedToken]),
    // Use to wait for ConfigModule to be loaded
    JwtModule.registerAsync({
      // Allow to use ConfigModule in the factory
      imports: [ConfigModule],
      // Returns the configuration. Async because it may need to call to other fetch database info to get the secrets
      useFactory: async (configService: ConfigService) => ({
        // Sign the tokens with JWT Secret
        secret: configService.get<string>('JWT_SECRET')!,
        // Set the expiration time for the tokens
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN')! as any,
        },
      }),
      // Pick the configService from ConfigModule
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  // Define the API endpoints
  controllers: [AuthController],
  //Make AuthService available everywhere
  exports: [AuthService],
})
export class AuthModule { }
