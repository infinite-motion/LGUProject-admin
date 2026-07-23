import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, AuditTargetType } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async logAction(
    actorId: string, 
    action: AuditAction, 
    targetType?: AuditTargetType,
    targetId?: string,
    metadata?: any
  ) {
    return this.prisma.superAdminAuditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        metadata,
      },
    });
  }

  async findAll() {
    return this.prisma.superAdminAuditLog.findMany({
      include: {
        actor: { select: { fullName: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}

