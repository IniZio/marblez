import { getModelForClass, index, prop as Property } from "@typegoose/typegoose";
import { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Field, ObjectType } from "type-graphql";
import { GraphQLJSON } from 'graphql-type-json';
import { IOrder } from '../models/IOrder';

@ObjectType()
// @index({ phone: 1, date: 1, time: 1, cake: 1 }, { unique: true })
export class Order implements IOrder {
  @Field({ nullable: true })
  @Property({ unique: true })
  id?: string;
  
  @Field({ nullable: true })
  @Property()
  paid: boolean;

  @Field({ nullable: true })
  @Property()
  customerName?: string;
  
  @Field({ nullable: true })
  @Property()
  customerPhone?: string;

  @Field({ nullable: true })
  @Property()
  customerSocialChannel?: string;

  @Field({ nullable: true })
  @Property()
  customerSocialName?: string;

  @Field({ nullable: true })
  @Property()
  deliveryDate?: Date;

  @Field({ nullable: true })
  @Property()
  createdAt?: Date;

  @Field({ nullable: true })
  @Property()
  deliveryTime?: string;

  @Field(() => GraphQLJSON, { defaultValue: {} })
  @Property()
  otherAttributes: IOrder['otherAttributes'];

  @Field({ nullable: true })
  @Property()
  deliveryMethod?: string;
  @Field({ nullable: true })
  @Property()
  deliveryAddress?: string;
  @Field({ nullable: true })
  @Property()
  remarks?: string;
}

export const OrderModel = getModelForClass(Order);
