import { getModelForClass, index, prop as Property, arrayProp as ArrayProperty, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { GraphQLJSON } from 'graphql-type-json';
import { ObjectId } from 'mongodb';

import { Material } from './material'

export interface IMaterial {
  _id: any;
  name?: string;
}


export interface IOrderLabelCondition {
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
  conditions: IOrderLabelCondition[];

  @Field(type => [Material])
  @ArrayProperty({ ref: Material, default: [] })
  materials: Ref<IMaterial>[];
}

export const OrderLabelModel = getModelForClass(OrderLabel);
