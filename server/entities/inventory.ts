import { getModelForClass, index, prop as Property, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { ObjectId } from 'mongodb';

import { Material } from './material'
import { Location } from './location';

@ObjectType()
export class Inventory {
  @Field()
  readonly _id: ObjectId;
  
  @Field(type => Material)
  @Property({ ref: Material, required: true })
  material: Ref<Material>;

  @Field(type => Location, { nullable: true })
  @Property({ ref: Location, required: false })
  location: Ref<Location>;

  @Field()
  @Property({ default: 0 })
  quantity: number;
}

export const InventoryModel = getModelForClass(Inventory);
