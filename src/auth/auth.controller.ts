import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Headers,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

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
  async login(@Body() body: any, @Res({ passthrough: true }) response: express.Response) {
    return this.authService.login(body.email, body.password, response);
  }

  @Post('logout')
  async logout(@Headers('authorization') authHeader: string, @Res({passthrough: true}) response: express.Response) {
    return this.authService.logout(authHeader, response);
  }

  /**
   * REFRESH TOKEN
   * This endpoint is hit when my access token expires and I need a new one.
   * I don't send any body — the browser automatically attaches the httpOnly cookie
   * that was set during login. I just read it from the request here.
   */
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Req() request: express.Request, @Res({ passthrough: true }) response: express.Response) {
    // I grab the refresh token from the cookie I stored during login.
    // It's httpOnly so JavaScript on the frontend can't access it — only the browser sends it here.
    const refreshToken = request.cookies?.['refresh_token'];

    // Hand it off to the service which does all the heavy lifting (verify + sign a new one).
    return this.authService.refreshToken(refreshToken, response);
  }
}
