import { getModelForClass, index, prop as Property, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { ObjectId } from 'mongodb';

import { Material } from './material'

@ObjectType()
export class MaterialLocation {
  @Field()
  readonly _id: ObjectId;
  
  @Field(type => Material)
  @Property({ ref: Material, required: true })
  material: Ref<Material>;

  @Field(type => Location)
  @Property({ ref: Location, required: true })
  location: Ref<Location>;

  @Field()
  quantity: number;
}

export const MaterialLocationModel = getModelForClass(MaterialLocation);
