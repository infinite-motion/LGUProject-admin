import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StaffService } from './staff.service';
import { ListApplicationsDto } from './dto/list-applications.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

interface RequestUser {
  userId: string;
  orgCode: string;
  departmentId: string | null;
}

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private staffService: StaffService) {}

  @Get('applications')
  listApplications(@Query() filters: ListApplicationsDto, @Req() req: Request) {
    return this.staffService.listApplications(req.user as RequestUser, filters);
  }

  @Patch('applications/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Req() req: Request,
  ) {
    return this.staffService.updateStatus(req.user as RequestUser, id, dto);
  }
}
