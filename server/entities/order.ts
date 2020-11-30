import { getModelForClass, index, prop as Property } from "@typegoose/typegoose";
import { ObjectId } from 'mongodb';
import { Field, ObjectType } from "type-graphql";

@ObjectType()
// @index({ phone: 1, date: 1, time: 1, cake: 1 }, { unique: true })
export class Order {
  // @Field()
  // @Property({ unique: true, required: true })
  // readonly _id: ObjectId;

  @Field({ nullable: true })
  @Property({ unique: true })
  index?: string;
  
  @Field({ nullable: true })
  @Property()
  paid: boolean;

  @Field({ nullable: true })
  @Property()
  name?: string;
  
  @Field({ nullable: true })
  @Property()
  phone?: string;

  @Field({ nullable: true })
  @Property()
  date?: Date;

  @Field({ nullable: true })
  @Property()
  created_at?: Date;

  @Field({ nullable: true })
  @Property()
  time?: string;

  @Field({ nullable: true })
  @Property()
  cake?: string;

  @Field({ nullable: true })
  @Property()
  letter?: string;

  @Field({ nullable: true })
  @Property()
  taste?: string;

  @Field({ nullable: true })
  @Property()
  inner_taste?: string;

  @Field({ nullable: true })
  @Property()
  bottom_taste?: string;

  @Field({ nullable: true })
  @Property()
  size?: string;

  @Field({ nullable: true })
  @Property()
  shape?: string;
  @Field({ nullable: true })
  @Property()
  color?: string;
  @Field({ nullable: true })
  @Property()
  sentence?: string;
  @Field({ nullable: true })
  @Property()
  paid_sentence?: string;
  @Field(() => [String], { nullable: true })
  @Property()
  decorations?: string[];
  @Field(() => [String], { nullable: true })
  @Property()
  toppings?: string[];
  @Field({ nullable: true })
  @Property()
  social_name?: string;
  @Field({ nullable: true })
  @Property()
  order_from?: string;
  @Field({ nullable: true })
  @Property()
  delivery_method?: string;
  @Field({ nullable: true })
  @Property()
  delivery_address?: string;
  @Field({ nullable: true })
  @Property()
  remarks?: string; 

  @Field({ nullable: true })
  @Property()
  printed?: boolean;
}

export const OrderModel = getModelForClass(Order);
