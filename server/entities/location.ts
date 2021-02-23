import { getModelForClass, index, prop as Property } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { ObjectId } from 'mongodb';
import { IMaterial } from '@marblez/graphql';

@ObjectType()
export class Location implements IMaterial {
  @Field()
  readonly _id: ObjectId;
  
  @Field({ nullable: true })
  @Property()
  name?: string;
}

export const LocationModel = getModelForClass(Location);
