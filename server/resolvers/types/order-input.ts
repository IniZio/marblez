import { InputType, Field, Int } from "type-graphql";

@InputType()
export class OrderInput {
  @Field({ nullable: true })
  index?: string;
  
  @Field({ nullable: true })
  paid: boolean;

  @Field({ nullable: true })
  name?: string;
  
  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  date?: Date;

  @Field({ nullable: true })
  created_at?: Date;

  @Field({ nullable: true })
  time?: string;

  @Field({ nullable: true })
  cake?: string;

  @Field({ nullable: true })
  letter?: string;

  @Field({ nullable: true })
  taste?: string;

  @Field({ nullable: true })
  inner_taste?: string;

  @Field({ nullable: true })
  bottom_taste?: string;

  @Field({ nullable: true })
  size?: string;

  @Field({ nullable: true })
  shape?: string;
  @Field({ nullable: true })
  color?: string;
  @Field({ nullable: true })
  sentence?: string;
  @Field({ nullable: true })
  paid_sentence?: string;
  @Field(() => [String], { nullable: true })
  decorations?: string[];
  @Field(() => [String], { nullable: true })
  toppings?: string[];
  @Field({ nullable: true })
  social_name?: string;
  @Field({ nullable: true })
  order_from?: string;
  @Field({ nullable: true })
  delivery_method?: string;
  @Field({ nullable: true })
  delivery_address?: string;
  @Field({ nullable: true })
  remarks?: string;

  @Field({ nullable: true })
  printed?: string;
}
