import { Controller, Post, Body, Res, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() signInDto: Record<string, any>, @Res({ passthrough: true }) res: Response) {
    if (!signInDto.email || !signInDto.password) {
      throw new UnauthorizedException('Email and password required');
    }

    // 1. Validate credentials
    const user = await this.authService.validateAdmin(signInDto.email, signInDto.password);
    
    // 2. Generate secure JWT
    const { access_token, user: userData } = await this.authService.login(user);

    // 3. SECURE COOKIE SETTINGS
    res.cookie('access_token', access_token, {
      httpOnly: true,     // Cannot be accessed by client-side JS (XSS protection)
      secure: process.env.NODE_ENV === 'production', // Send over HTTPS only in production
      sameSite: 'lax',    // Mitigates CSRF attacks
      maxAge: 2 * 60 * 60 * 1000, // 2 hours expiry
    });

    return { message: 'Logged in successfully', user: userData };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // Overwrite the cookie to invalidate it instantly on the client side
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }
}
