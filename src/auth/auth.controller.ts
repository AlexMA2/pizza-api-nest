import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * CUSTOMER REGISTER
   */
  @Post('register')
  async register(@Body() body: any): Promise<any> {
    return this.authService.register(body.email, body.password);
  }

  /**
   * LOGIN (Chef or Customer)
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string) {
    return this.authService.logout(authHeader);
  }
}
