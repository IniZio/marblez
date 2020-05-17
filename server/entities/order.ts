import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Order {
  @Field({ nullable: true })
  paid: boolean;

  @Field({ nullable: true })
  name?: string;
  
  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  date?: Date;

  @Field({ nullable: true })
  time?: string;

  @Field({ nullable: true })
  cake?: string;

  @Field({ nullable: true })
  letter?: string;

  @Field({ nullable: true })
  taste?: string;

  @Field({ nullable: true })
  size?: string;

  @Field({ nullable: true })
  shape?: string;
  @Field({ nullable: true })
  color?: string;
  @Field({ nullable: true })
  sentence?: string;
  @Field(() => [String], { nullable: true })
  decorations?: string[];
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
}
