import { getModelForClass, index, prop as Property } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { GraphQLJSON } from 'graphql-type-json';
import { ObjectId } from 'mongodb';

interface OrderLabelCondition {
  keyword?: string,
}

@ObjectType()
export class OrderLabel {
  @Field()
  readonly _id: ObjectId;
  
  @Field({ nullable: true })
  @Property()
  name?: string;

  @Field({ nullable: true })
  @Property()
  color?: string;

  @Field(() => GraphQLJSON, { defaultValue: {} })
  @Property()
  conditions: OrderLabelCondition[];
}

export const OrderLabelModel = getModelForClass(OrderLabel);
