import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async logAction(actorId: string, action: string, details?: string) {
    return this.prisma.superAdminAuditLog.create({
      data: {
        actorId,
        action,
        details,
      }
    });
  }

  async findAll() {
    return this.prisma.superAdminAuditLog.findMany({
      include: {
        actor: { select: { fullName: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
