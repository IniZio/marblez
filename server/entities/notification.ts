import { prop as Property, arrayProp, getModelForClass } from "@typegoose/typegoose";
import { ObjectType, Field } from "type-graphql";

import { Ref } from "../types";
import { Order } from './order';


@ObjectType()
export class Notification {
  @Field(type => [Order])
  @Property()
  orders: Ref<Order>[];

  @Field()
  @Property({ required: true })
  event: String;
}

export const NotificationModel = getModelForClass(Notification);
