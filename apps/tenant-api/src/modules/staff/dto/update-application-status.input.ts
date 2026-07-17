import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class UpdateApplicationStatusInput {
  @Field(() => ID)
  id!: string;

  @Field()
  status!: string;
}
