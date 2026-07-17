import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StaffService } from './staff.service';
import { ListApplicationsInput } from './dto/list-applications.input';
import { UpdateApplicationStatusInput } from './dto/update-application-status.input';
import { ApplicationCaseModel } from './models/application.model';

interface RequestUser {
  userId: string;
  orgCode: string;
  departmentId: string | null;
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class StaffResolver {
  constructor(private staffService: StaffService) {}

  @Query(() => [ApplicationCaseModel])
  applications(
    @Args('filters', { nullable: true }) filters: ListApplicationsInput,
    @CurrentUser() user: RequestUser,
  ): Promise<ApplicationCaseModel[]> {
    return this.staffService.listApplications(user, filters ?? {});
  }

  @Mutation(() => ApplicationCaseModel)
  updateApplicationStatus(
    @Args('input') input: UpdateApplicationStatusInput,
    @CurrentUser() user: RequestUser,
  ): Promise<ApplicationCaseModel> {
    return this.staffService.updateStatus(user, input.id, input);
  }
}
