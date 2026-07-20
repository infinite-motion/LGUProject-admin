import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateAdmin(email: string, pass: string): Promise<any> {
    const admin = await this.prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException("Account doesn't exist");
    }

    if (!admin.passwordHash) {
      throw new UnauthorizedException('Account not fully set up');
    }

    const isMatch = await bcrypt.compare(pass, admin.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect password');
    }
    const { passwordHash, ...result } = admin;
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user,
    };
  }
}
