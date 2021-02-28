import { getModelForClass, index, prop as Property, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { ObjectId } from 'mongodb';

import { Material } from './material'
import { Location } from './location'

export enum InventoryTransactionReason {
  Reconcile ='Reconcile',
  Migrate = 'Migrate',
  Adjust = 'Adjust',
}

@ObjectType()
export class InventoryTransaction {
  @Field()
  readonly _id: ObjectId;
  
  @Field(type => Material)
  @Property({ ref: Material, required: true })
  material: Ref<Material>;

  @Field(type => Location, { nullable: true })
  @Property({ ref: Location, required: false })
  location: Ref<Location>;

  @Field(type => Location, { nullable: true })
  @Property({ ref: Location, required: false })
  prevLocation: Ref<Location>;

  @Field()
  @Property({ enum: InventoryTransactionReason })
  reason: InventoryTransactionReason;

  @Field()
  @Property()
  quantity: number;
}

export const InventoryTransactionModel = getModelForClass(InventoryTransaction);
