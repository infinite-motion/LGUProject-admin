import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StaffResolver } from './staff.resolver';
import { StaffService } from './staff.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [AuthModule],
  providers: [StaffResolver, StaffService, PrismaService],
})
export class StaffModule {}
