import { InputType, Field, Int } from "type-graphql";
import GraphQLJSON from 'graphql-type-json';
import { IOrder } from '../../models/IOrder';

@InputType()
export class OrderInput {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  paid: boolean;

  @Field({ nullable: true })
  customerName?: string;

  @Field({ nullable: true })
  customerPhone?: string;

  @Field({ nullable: true })
  customerSocialChannel?: string;

  @Field({ nullable: true })
  customerSocialName?: string;

  @Field({ nullable: true })
  deliveryDate?: Date;

  @Field({ nullable: true })
  receivedAt?: Date;

  @Field({ nullable: true })
  deliveryTime?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  otherAttributes: IOrder['otherAttributes']

  @Field({ nullable: true })
  deliveryMethod?: string;

  @Field({ nullable: true })
  deliveryAddress?: string;

  @Field({ nullable: true })
  remarks?: string;
}

@InputType()
class OrderLabelConditionInput {
  @Field({ nullable: true })
  keyword?: string;
}

@InputType()
export class OrderLabelInput {
  @Field({ nullable: true })
  _id?: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  color: string;

  @Field(type => [OrderLabelConditionInput], { nullable: true })
  conditions?: OrderLabelConditionInput[];
}

@InputType()
export class OrderMetaInput {
  @Field({ nullable: true })
  orderId?: string;

  @Field(type => [OrderLabelInput], { nullable: true })
  labels?: OrderLabelInput[];
}

@InputType()
export class OrderLabelsInput {
  @Field(type => [OrderLabelInput], { nullable: true })
  labels?: OrderLabelInput[];
}
