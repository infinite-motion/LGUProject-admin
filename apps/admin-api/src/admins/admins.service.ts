import { Injectable, BadRequestException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AdminStatus, AuditAction, AuditTargetType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class AdminsService {
  private inviteCooldowns = new Map<string, number>();

  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  async findAll() {
    const admins = await this.prisma.superAdmin.findMany({
      where: { status: { not: 'revoked' } },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        appointedById: true,
        createdAt: true,
        appointedBy: {
          select: {
            fullName: true,
          },
        },
        inviteTokenHash: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return admins.map((admin) => ({
      ...admin,
      appointedByName: admin.appointedBy?.fullName || null,
      inviteToken: admin.inviteTokenHash || null,
    }));
  }

  async inviteAdmin(data: { email: string; fullName: string; role?: 'ADMIN' | 'ROOT_SUPERADMIN' }, inviter: any) {
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenHash = inviteToken; // Storing unhashed temporarily so UI can display it


    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

    const status = AdminStatus.invited;
    const placeholderHash = await require('bcryptjs').hash(crypto.randomBytes(32).toString('hex'), 10);

    const existing = await this.prisma.superAdmin.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      if (existing.status === 'revoked') {
        // Retroactively tombstone the old revoked account's email so we can create a fresh one
        await this.prisma.superAdmin.update({
          where: { id: existing.id },
          data: { email: `deleted_${Date.now()}_${existing.email}` },
        });
      } else {
        throw new ConflictException('An administrator with this email already exists.');
      }
    }

    const newAdmin = await this.prisma.superAdmin.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        role: data.role || 'ADMIN',
        status,
        passwordHash: placeholderHash,
        inviteTokenHash,
        inviteExpiresAt,
        appointedById: inviter?.sub,
      },
      include: {
        appointedBy: { select: { fullName: true } },
      },
    });

    if (inviter && inviter.sub) {
      await this.auditLogsService.logAction(
        inviter.sub,
        AuditAction.invite_admin,
        AuditTargetType.superadmin,
        newAdmin.id,
        { email: data.email, full_name: data.fullName, role: data.role || 'ADMIN' }
      );
    }

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite?token=${inviteToken}`;
    console.log(
      `[No Email Service yet, manually copy and paste invite token for now]: ${inviteLink}`,
    );

    return {
      ...newAdmin,
      appointedByName: newAdmin.appointedBy?.fullName || null,
      inviteToken,
    };
  }

  async acceptInvite(data: { token: string; password: string }) {
    console.log('[DEBUG acceptInvite] Received token:', data.token);
    const inviteTokenHash = data.token.trim(); // No hashing
    console.log('[DEBUG acceptInvite] Searching for token:', inviteTokenHash);
    
    const admin = await this.prisma.superAdmin.findFirst({
      where: { inviteTokenHash },
    });
    
    console.log('[DEBUG acceptInvite] Found admin:', admin ? admin.id : 'null');

    if (!admin) {
      throw new BadRequestException('Invalid or expired invite token');
    }

    if (admin.inviteExpiresAt && admin.inviteExpiresAt < new Date()) {
      throw new BadRequestException('Invite token has expired');
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await this.prisma.superAdmin.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        status: AdminStatus.active,
        inviteTokenHash: null,
        inviteExpiresAt: null,
      },
    });

    await this.auditLogsService.logAction(
      admin.id,
      AuditAction.accept_invite,
      AuditTargetType.superadmin,
      admin.id
    );

    return result;
  }

  async rejectInvite(data: { token: string }) {
    const inviteTokenHash = data.token.trim(); // No hashing
    
    const admin = await this.prisma.superAdmin.findFirst({
      where: { inviteTokenHash },
    });

    if (!admin) {
      throw new BadRequestException('Invalid or expired invite token');
    }

    const result = await this.prisma.superAdmin.update({
      where: { id: admin.id },
      data: {
        status: AdminStatus.revoked,
        revokedAt: new Date(),
        inviteTokenHash: null,
        inviteExpiresAt: null,
      },
    });

    // Logging action could be useful, but since admin rejected, we just record under them
    await this.auditLogsService.logAction(
      admin.id,
      AuditAction.revoke_admin, // Closest matching action
      AuditTargetType.superadmin,
      admin.id,
      { note: 'Admin rejected invitation' }
    );

    return result;
  }

  // The approveAdmin and rejectPendingAdmin flow from previous schema is obsolete 
  // since new schema only has invited/active/revoked. We'll leave them here but throw Error
  async approveAdmin(id: string, approver: any) {
    throw new BadRequestException('Deprecated workflow. Admins are directly invited.');
  }
  async rejectPendingAdmin(id: string, approver: any) {
    throw new BadRequestException('Deprecated workflow. Admins are directly invited.');
  }

  async deleteAdmin(id: string, user: any) {
    const admin = await this.prisma.superAdmin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Administrator not found');

    if (admin.role === 'ROOT_SUPERADMIN') {
      throw new BadRequestException('Cannot delete the root superadmin');
    }

    // Soft delete with tombstone email to free it up for fresh profiles
    const result = await this.prisma.superAdmin.update({
      where: { id },
      data: {
        email: `deleted_${Date.now()}_${admin.email}`,
        status: AdminStatus.revoked,
        revokedAt: new Date(),
        revokedById: user?.sub,
      },
    });

    if (user && user.sub) {
      await this.auditLogsService.logAction(
        user.sub,
        AuditAction.delete_admin,
        AuditTargetType.superadmin,
        admin.id,
        { email: admin.email, full_name: admin.fullName }
      );
    }

    return result;
  }

  async updateAdmin(
    id: string,
    data: { fullName?: string; password?: string },
    user: any,
  ) {
    if (user.sub !== id && user.role !== 'ROOT_SUPERADMIN') {
      throw new ForbiddenException('You do not have permission to edit this profile');
    }

    const admin = await this.prisma.superAdmin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Administrator not found');

    const updateData: any = {};
    if (data.fullName) updateData.fullName = data.fullName;

    if (data.password) {
      const bcrypt = require('bcryptjs');
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const result = await this.prisma.superAdmin.update({
      where: { id },
      data: updateData,
    });

    return {
      id: result.id,
      fullName: result.fullName,
      email: result.email,
    };
  }

  async resendInvite(id: string, user: any) {
    const admin = await this.prisma.superAdmin.findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Administrator not found');

    if (admin.status !== AdminStatus.invited) {
      throw new BadRequestException(
        'Can only resend invitations to administrators with invited status',
      );
    }

    const now = Date.now();
    const lastSent = this.inviteCooldowns.get(id);
    if (lastSent && now - lastSent < 60000) {
      const remainingSeconds = Math.ceil((60000 - (now - lastSent)) / 1000);
      throw new BadRequestException(
        `Please wait ${remainingSeconds} seconds before resending.`,
      );
    }
    this.inviteCooldowns.set(id, now);

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenHash = inviteToken; // Storing unhashed

    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

    await this.prisma.superAdmin.update({
      where: { id },
      data: { inviteTokenHash, inviteExpiresAt },
    });

    if (user && user.sub) {
      await this.auditLogsService.logAction(
        user.sub,
        AuditAction.invite_admin,
        AuditTargetType.superadmin,
        admin.id,
        { email: admin.email, role: admin.role, note: 'Resent invitation' }
      );
    }

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite?token=${inviteToken}`;
    console.log(
      `[No Email Service yet, manually copy and paste invite token for now]: ${inviteLink}`,
    );

    return { success: true, message: 'Invitation resent successfully', inviteToken };
  }
}

