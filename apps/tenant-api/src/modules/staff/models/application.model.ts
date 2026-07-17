import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class CitizenSummary {
  @Field(() => ID)
  id!: string;

  @Field()
  fullName!: string;

  @Field(() => String, { nullable: true })
  email!: string | null;

  @Field(() => String, { nullable: true })
  phone!: string | null;

  @Field()
  verificationLevel!: string;
}

@ObjectType()
export class ServiceTypeModel {
  @Field()
  code!: string;

  @Field()
  name!: string;

  @Field()
  category!: string;

  @Field()
  requiresVerification!: boolean;
}

@ObjectType()
export class ApplicationCaseModel {
  @Field(() => ID)
  id!: string;

  @Field()
  orgCode!: string;

  @Field()
  citizenId!: string;

  @Field(() => CitizenSummary)
  citizen!: CitizenSummary;

  @Field()
  serviceTypeCode!: string;

  @Field(() => ServiceTypeModel)
  serviceType!: ServiceTypeModel;

  @Field()
  status!: string;

  @Field(() => String, { nullable: true })
  assignedDepartmentId!: string | null;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
