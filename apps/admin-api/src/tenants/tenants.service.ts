import { Injectable, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { LguLevel, TenantStatus, AuditAction, AuditTargetType } from '@prisma/client';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  async findAll() {
    const tenants = await this.prisma.lguTenant.findMany({
      where: { status: { not: 'deleted' } },
      orderBy: { createdAt: 'desc' },
      include: { licenses: true }
    });
    
    return tenants.map(t => ({
      ...t,
      registrationKey: t.licenses?.[0]?.registrationKey,
    }));
  }

  async createTenant(
    data: { psgcCode: string; name: string; level: LguLevel; sysadminEmail: string },
    creator: any,
  ) {
    // Check if code exists and is not deleted
    const existing = await this.prisma.lguTenant.findFirst({
      where: { psgcCode: data.psgcCode, status: { not: 'deleted' } },
    });

    if (existing) {
      throw new ConflictException(
        `Tenant organization with PSGC code '${data.psgcCode}' already exists.`
      );
    }

    // Check if sysadmin email is already used by another tenant
    const existingSysadmin = await this.prisma.lguTenant.findFirst({
      where: { sysadminEmail: data.sysadminEmail, status: { not: 'deleted' } },
    });

    if (existingSysadmin) {
      throw new ConflictException(
        `The email '${data.sysadminEmail}' is already registered as a SysAdmin for another organization.`
      );
    }

    const crypto = require('crypto');
    const registrationKey = crypto.randomUUID();

    const tenant = await this.prisma.lguTenant.create({
      data: {
        psgcCode: data.psgcCode,
        name: data.name,
        level: data.level,
        status: 'pending_setup',
        sysadminEmail: data.sysadminEmail,
        licenses: {
          create: {
            registrationKey,
            issuedAt: new Date(),
            status: 'active'
          }
        }
      },
    });

    if (creator && creator.sub) {
      await this.auditLogsService.logAction(
        creator.sub,
        AuditAction.register_tenant,
        AuditTargetType.tenant,
        tenant.id,
        { tenant_name: data.name, psgc_code: data.psgcCode, sysadmin_email: data.sysadminEmail }
      );
    }

    const setupLink = `${process.env.TENANT_DASHBOARD_URL || 'http://localhost:3001'}/setup?key=${registrationKey}`;
    this.logger.log(
      `[No Email Service yet, manually copy and paste setup link for sysadmin (${data.sysadminEmail})]: ${setupLink}`,
    );

    return {
      ...tenant,
      registrationKey,
    };
  }

  async suspendTenant(id: string, actor: any) {
    const tenant = await this.prisma.lguTenant.findUnique({ where: { id } });
    if (!tenant || tenant.status === 'deleted') throw new NotFoundException('Tenant not found');

    const result = await this.prisma.lguTenant.update({
      where: { id },
      data: { status: 'suspended' },
    });

    if (actor && actor.sub) {
      await this.auditLogsService.logAction(
        actor.sub,
        AuditAction.suspend_tenant,
        AuditTargetType.tenant,
        tenant.id,
        { tenant_name: tenant.name, psgc_code: tenant.psgcCode }
      );
    }

    return result;
  }

  async activateTenant(id: string, actor: any) {
    const tenant = await this.prisma.lguTenant.findUnique({ where: { id } });
    if (!tenant || tenant.status === 'deleted') throw new NotFoundException('Tenant not found');

    const result = await this.prisma.lguTenant.update({
      where: { id },
      data: { status: 'active' },
    });

    if (actor && actor.sub) {
      await this.auditLogsService.logAction(
        actor.sub,
        AuditAction.activate_tenant,
        AuditTargetType.tenant,
        tenant.id,
        { tenant_name: tenant.name, psgc_code: tenant.psgcCode }
      );
    }

    return result;
  }

  async deleteTenant(id: string, actor: any) {
    const tenant = await this.prisma.lguTenant.findUnique({ where: { id } });
    if (!tenant || tenant.status === 'deleted') throw new NotFoundException('Tenant not found');

    const result = await this.prisma.lguTenant.update({
      where: { id },
      data: { status: 'deleted', deletedAt: new Date() },
    });

    if (actor && actor.sub) {
      await this.auditLogsService.logAction(
        actor.sub,
        AuditAction.delete_tenant,
        AuditTargetType.tenant,
        tenant.id,
        { tenant_name: tenant.name, psgc_code: tenant.psgcCode }
      );
    }

    return result;
  }

  async verifyRegistrationKey(registrationKey: string) {
    const license = await this.prisma.license.findUnique({
      where: { registrationKey },
      include: {
        tenant: {
          select: {
            id: true,
            psgcCode: true,
            name: true,
            level: true,
            status: true,
            sysadminEmail: true,
          }
        }
      },
    });

    if (!license || license.status !== 'active') {
      return { valid: false, reason: 'NOT_FOUND_OR_REVOKED' };
    }

    const tenant = license.tenant;

    if (tenant.status !== 'active' && tenant.status !== 'pending_setup') {
      return { valid: false, reason: 'SUSPENDED', tenant };
    }

    return {
      valid: true,
      tenant,
      expectedEmail: tenant.sysadminEmail,
    };
  }

  async completeSetup(registrationKey: string) {
    const license = await this.prisma.license.findUnique({
      where: { registrationKey },
    });

    if (!license) throw new NotFoundException('License not found');

    const result = await this.prisma.lguTenant.update({
      where: { id: license.tenantId },
      data: { status: 'active', sysadminVerifiedAt: new Date() },
    });

    return result;
  }
}

