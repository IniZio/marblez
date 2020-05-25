import { Field, InputType } from "type-graphql";

@InputType()
export class EditEventInput {
  @Field({ nullable: true })
  oldValue?: string;
  
  @Field({ nullable: true })
  value?: string;

  @Field()
  row: number;

  @Field()
  column: number;
}
