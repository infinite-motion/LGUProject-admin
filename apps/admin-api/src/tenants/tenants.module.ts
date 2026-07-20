import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { InternalTenantsController } from './internal-tenants.controller';
import { TenantsService } from './tenants.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [TenantsController, InternalTenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
