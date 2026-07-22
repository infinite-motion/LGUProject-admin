import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AuthUser {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  role!: string | null;

  @Field()
  orgCode!: string;
}

@ObjectType()
export class LoginResponse {
  @Field(() => AuthUser)
  user!: AuthUser;,
}

@ObjectType()
export class CurrentUser {
  @Field()
  userId!: string;

  @Field()
  email!: string;

  @Field(() => String, { nullable: true })
  role!: string | null;

  @Field()
  orgCode!: string;

  @Field(() => String, { nullable: true })
  departmentId!: string | null;
}

@ObjectType()
export class MeResponse {
  @Field(() => CurrentUser)
  user!: CurrentUser;
}
