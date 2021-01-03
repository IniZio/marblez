import { IOrder } from '@marblez/graphql';
import { InputType, Field, Int } from "type-graphql";
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class OrderInput {
  @Field({ nullable: true })
  id?: string;
  
  @Field({ nullable: true })
  paid: boolean;

  @Field({ nullable: true })
  customerName?: string;
  
  @Field({ nullable: true })
  customerPhone?: string;

  @Field({ nullable: true })
  customerSocialChannel?: string;

  @Field({ nullable: true })
  customerSocialName?: string;

  @Field({ nullable: true })
  deliveryDate?: Date;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  deliveryTime?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes: IOrder['attributes']

  @Field({ nullable: true })
  deliveryMethod?: string;

  @Field({ nullable: true })
  deliveryAddress?: string;

  @Field({ nullable: true })
  remarks?: string; 
}
