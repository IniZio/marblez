import { prop as Property } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Order {
  @Field({ nullable: true })
  @Property({ required: true })
  paid: boolean;

  @Field({ nullable: true })
  @Property({ required: true })
  name?: string;
  
  @Field({ nullable: true })
  @Property({ required: true })
  phone?: string;

  @Field({ nullable: true })
  @Property({ required: true })
  date?: Date;

  @Field({ nullable: true })
  @Property({ required: true })
  created_at?: Date;

  @Field({ nullable: true })
  @Property({ required: true })
  time?: string;

  @Field({ nullable: true })
  @Property({ required: true })
  cake?: string;

  @Field({ nullable: true })
  @Property({ required: true })
  letter?: string;

  @Field({ nullable: true })
  @Property({ required: true })
  taste?: string;

  @Field({ nullable: true })
  @Property({ required: true })
  size?: string;

  @Field({ nullable: true })
  @Property({ required: true })
  shape?: string;
  @Field({ nullable: true })
  @Property({ required: true })
  color?: string;
  @Field({ nullable: true })
  @Property({ required: true })
  sentence?: string;
  @Field(() => [String], { nullable: true })
  @Property({ required: true })
  decorations?: string[];
  @Field({ nullable: true })
  @Property({ required: true })
  social_name?: string;
  @Field({ nullable: true })
  @Property({ required: true })
  order_from?: string;
  @Field({ nullable: true })
  @Property({ required: true })
  delivery_method?: string;
  @Field({ nullable: true })
  @Property({ required: true })
  delivery_address?: string;
  @Field({ nullable: true })
  @Property({ required: true })
  remarks?: string;
}
