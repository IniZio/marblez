import { getModelForClass, index, prop as Property, arrayProp as ArrayProperty, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { GraphQLJSON } from 'graphql-type-json';
import { ObjectId } from 'mongodb';

import { Material } from './material'
import { IMaterial, IOrderLabel, IOrderLabelCondition } from '@marblez/graphql';



@ObjectType()
export class OrderLabel implements IOrderLabel {
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
