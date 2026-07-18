import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const admins = await this.prisma.superAdmin.findMany({
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
          }
        }
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    return admins.map(admin => ({
      ...admin,
      appointedByName: admin.appointedBy?.fullName || null,
    }));
  }

  async inviteAdmin(data: { email: string; fullName: string }, inviter: any) {
    const crypto = require('crypto');
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    const inviteExpiresAt = new Date();
    inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 7);

    // If inviter is ROOT_SUPERADMIN, status is INVITED, otherwise PENDING_APPROVAL
    const status = inviter && inviter.role === 'ROOT_SUPERADMIN' ? 'INVITED' : 'PENDING_APPROVAL';

    const newAdmin = await this.prisma.superAdmin.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        role: 'ADMIN',
        status,
        inviteToken,
        inviteExpiresAt,
        appointedById: inviter?.sub,
      },
      include: {
        appointedBy: {
          select: { fullName: true }
        }
      }
    });

    return {
      ...newAdmin,
      appointedByName: newAdmin.appointedBy?.fullName || null
    };
  }

  async acceptInvite(data: { token: string; password: string }) {
    const admin = await this.prisma.superAdmin.findUnique({
      where: { inviteToken: data.token }
    });

    if (!admin) {
      throw new Error('Invalid or expired invite token');
    }

    if (admin.inviteExpiresAt && admin.inviteExpiresAt < new Date()) {
      throw new Error('Invite token has expired');
    }

    if (admin.status === 'PENDING_APPROVAL') {
      throw new Error('Invite is still pending approval');
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.superAdmin.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        status: 'ACTIVE',
        inviteToken: null,
        inviteExpiresAt: null,
      }
    });
  }

  async rejectInvite(data: { token: string }) {
    const admin = await this.prisma.superAdmin.findUnique({
      where: { inviteToken: data.token }
    });

    if (!admin) {
      throw new Error('Invalid or expired invite token');
    }

    return this.prisma.superAdmin.update({
      where: { id: admin.id },
      data: {
        status: 'REJECTED',
        inviteToken: null,
        inviteExpiresAt: null,
      }
    });
  }

  async approveAdmin(id: string, approver: any) {
    if (approver?.role !== 'ROOT_SUPERADMIN') {
      throw new Error('Only ROOT_SUPERADMIN can approve invites');
    }

    const admin = await this.prisma.superAdmin.findUnique({ where: { id } });
    if (!admin) throw new Error('Administrator not found');

    if (admin.status !== 'PENDING_APPROVAL') {
      throw new Error('Admin is not pending approval');
    }

    const updatedAdmin = await this.prisma.superAdmin.update({
      where: { id },
      data: {
        status: 'INVITED',
        // Optional: you could update appointedById to the approver's ID or keep the original inviter
      },
      include: {
        appointedBy: { select: { fullName: true } }
      }
    });

    return {
      ...updatedAdmin,
      appointedByName: updatedAdmin.appointedBy?.fullName || null
    };
  }

  async rejectPendingAdmin(id: string, approver: any) {
    if (approver?.role !== 'ROOT_SUPERADMIN') {
      throw new Error('Only ROOT_SUPERADMIN can reject invites');
    }

    const admin = await this.prisma.superAdmin.findUnique({ where: { id } });
    if (!admin) throw new Error('Administrator not found');

    if (admin.status !== 'PENDING_APPROVAL') {
      throw new Error('Admin is not pending approval');
    }

    const updatedAdmin = await this.prisma.superAdmin.update({
      where: { id },
      data: {
        status: 'REJECTED',
        inviteToken: null,
        inviteExpiresAt: null,
      },
      include: {
        appointedBy: { select: { fullName: true } }
      }
    });

    return {
      ...updatedAdmin,
      appointedByName: updatedAdmin.appointedBy?.fullName || null
    };
  }

  async deleteAdmin(id: string, user: any) {
    const admin = await this.prisma.superAdmin.findUnique({ where: { id } });
    if (!admin) throw new Error('Administrator not found');
    
    // Prevent deleting the root admin
    if (admin.role === 'ROOT_SUPERADMIN') {
      throw new Error('Cannot delete the root superadmin');
    }

    return this.prisma.superAdmin.delete({
      where: { id }
    });
  }
}
