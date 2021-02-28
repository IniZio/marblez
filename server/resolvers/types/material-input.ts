import { ObjectId } from "mongodb";
import { InputType, Field, Int } from "type-graphql";

@InputType()
export class MaterialInput {
  @Field({ nullable: true })
  _id: ObjectId;

  @Field()
  name: string;
}
