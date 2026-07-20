import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminApiModule } from '../admin-api/admin-api.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '4h' },
      }),
    }),
    AdminApiModule,
  ],
  providers: [AuthResolver, AuthService, JwtStrategy, GqlAuthGuard, PrismaService],
  exports: [GqlAuthGuard],
})
export class AuthModule {}
