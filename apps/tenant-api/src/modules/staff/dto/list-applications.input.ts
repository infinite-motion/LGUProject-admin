import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ListApplicationsInput {
  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { nullable: true })
  serviceTypeCode?: string;
}
