import { getModelForClass, index, prop as Property, arrayProp as ArrayProperty, Ref, } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { GraphQLJSON } from 'graphql-type-json';

import { OrderLabel } from './order_label';
import { ObjectId } from 'mongodb';

@ObjectType()
export class OrderMeta {
  @Field({ nullable: true })
  @Property()
  orderId?: string;

  @Field(type => [OrderLabel])
  @ArrayProperty({ ref: OrderLabel, default: [] })
  labels: Ref<OrderLabel>[];
}

export const OrderMetaModel = getModelForClass(OrderMeta);
