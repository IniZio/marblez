import { getModelForClass, index, prop as Property, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { ObjectId } from 'mongodb';

import { Material } from './material'

@ObjectType()
export class InventoryTransaction {
  @Field()
  readonly _id: ObjectId;
  
  @Field(type => Material)
  @Property({ ref: Material, required: true })
  material: Ref<Material>;

  @Field(type => Location)
  @Property({ ref: Location, required: true })
  location: Ref<Location>;

  @Field()
  delta: number;

  @Field()
  result: number;
}

export const InventoryTransactionModel = getModelForClass(InventoryTransaction);
