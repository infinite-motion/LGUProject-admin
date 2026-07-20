import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() signInDto: Record<string, any>,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!signInDto.email || !signInDto.password) {
      throw new UnauthorizedException('Email and password required');
    }

    // validate user
    const user = await this.authService.validateAdmin(
      signInDto.email,
      signInDto.password,
    );

    // JWT generate and secure
    const { access_token, user: userData } = await this.authService.login(user);

    // cookiee
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
      path: '/',
    });

    return { message: 'Logged in successfully', user: userData, access_token };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Overwrite the cookie to invalidate it instantly on the client side
    res.clearCookie('access_token', { path: '/' });
    return { message: 'Logged out successfully' };
  }
}
