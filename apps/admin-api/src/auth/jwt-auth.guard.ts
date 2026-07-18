import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);
    
    if (!token) {
      console.log("JwtAuthGuard: No token found in cookies. Cookies are:", request.cookies);
      throw new UnauthorizedException('No token found');
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token);
      
      const admin = await this.prisma.superAdmin.findUnique({
        where: { id: payload.sub }
      });

      if (!admin) {
        throw new UnauthorizedException('Account no longer exists');
      }

      if (admin.status !== 'ACTIVE' && admin.status !== 'PENDING_APPROVAL') {
        // We might allow PENDING_APPROVAL if they can log in but have restricted access, 
        // but typically deleted/rejected users shouldn't pass. Let's strictly only allow ACTIVE 
        // or just ensure they aren't REJECTED/SUSPENDED. I will require them to exist at least.
        // The prompt says "I deleted [the user]... can still access". So checking if !admin is the main fix.
        if (admin.status === 'REJECTED' || admin.status === 'SUSPENDED') {
            throw new UnauthorizedException('Account has been restricted');
        }
      }

      // We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch (e) {
      console.log("JwtAuthGuard: Token verification failed:", e);
      throw new UnauthorizedException(e instanceof UnauthorizedException ? e.message : 'Invalid or expired token');
    }
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    if (request.cookies?.access_token) {
      return request.cookies.access_token;
    }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
