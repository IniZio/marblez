import { ObjectId } from "mongodb";
import { InputType, Field, Int } from "type-graphql";
import { InventoryTransactionReason } from '../../entities/inventory_transaction';

@InputType()
export class InventoryTransactionInput {
  @Field()
  materialId: ObjectId;

  @Field({ nullable: true })
  locationId: ObjectId;

  @Field({ nullable: true })
  prevLocationId: ObjectId;

  @Field()
  reason: InventoryTransactionReason; 

  @Field()
  quantity: number;
}
