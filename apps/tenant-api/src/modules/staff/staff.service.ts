import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListApplicationsDto } from './dto/list-applications.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

interface RequestUser {
  userId: string;
  orgCode: string;
  departmentId: string | null;
}

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  async listApplications(user: RequestUser, filters: ListApplicationsDto) {
    return this.prisma.applicationCase.findMany({
      where: {
        orgCode: user.orgCode,
        assignedDepartmentId: user.departmentId,
        ...(filters.status && { status: filters.status }),
        ...(filters.serviceTypeCode && {
          serviceTypeCode: filters.serviceTypeCode,
        }),
      },
      include: { citizen: true, serviceType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    user: RequestUser,
    caseId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.applicationCase.findUnique({
      where: { id: caseId },
    });

    if (!application || application.orgCode !== user.orgCode) {
      throw new NotFoundException('Application not found');
    }

    if (application.assignedDepartmentId !== user.departmentId) {
      throw new ForbiddenException(
        'This application is not assigned to your department',
      );
    }

    return this.prisma.applicationCase.update({
      where: { id: caseId },
      data: { status: dto.status },
    });
  }
}
