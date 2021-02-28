import { ObjectId } from "mongodb";
import { Resolver, Query, FieldResolver, Arg, Root, Mutation, Ctx } from "type-graphql";

import { Context } from "../index";
import { ObjectIdScalar } from "../object-id.scalar";
import { Inventory, InventoryModel } from '../entities/inventory';
import { Material, MaterialModel } from '../entities/material';
import { MaterialInput } from './types/material-input'
import { InventoryTransactionInput } from './types/inventory-transaction-input';
import { InventoryTransaction, InventoryTransactionReason } from '../entities/inventory_transaction';
import { InventoryTransactionModel } from '../entities/inventory_transaction';

@Resolver(of => Material)
export class MaterialResolver {
  @Query(returns => [Material], { nullable: true })
  materials() {
    return MaterialModel.find();
  }

  @Mutation(returns => Material)
  async saveMaterial(
    @Arg("material") materialInput: MaterialInput,
  ): Promise<Material> {
    const material = new MaterialModel({
      ...materialInput,
    } as Material);

    return await material.save();
  }

  @Mutation(returns => Boolean)
  async deleteMaterial(
    @Arg("materialId") materialId: string,
  ): Promise<boolean> {
    await MaterialModel.deleteOne({ _id: materialId });
    await InventoryModel.deleteMany({ material: materialId });
    return true;
  }

  @Mutation(returns => InventoryTransaction)
  async addInventoryTransaction(
    @Arg("inventoryTransaction") inventoryTransactionInput: InventoryTransactionInput,
  ): Promise<InventoryTransaction> {
    const inventoryTransaction = new InventoryTransactionModel({
      material: inventoryTransactionInput.materialId,
      location: inventoryTransactionInput.locationId,
      quantity: inventoryTransactionInput.quantity,
      reason: inventoryTransactionInput.reason,
    } as InventoryTransaction);

    await inventoryTransaction.save();

    const inventory = 
      (await InventoryModel.findOne({ material: inventoryTransactionInput.materialId, location: inventoryTransactionInput.locationId }))
      || (await InventoryModel.create({ material: inventoryTransactionInput.materialId, location: inventoryTransactionInput.locationId }));

    switch(inventoryTransaction.reason) {
      case InventoryTransactionReason.Reconcile:
        inventory.quantity = inventoryTransaction.quantity;
        break;
      case InventoryTransactionReason.Restock:
        inventory.quantity += inventoryTransaction.quantity;
        break;
      case InventoryTransactionReason.Spend:
        inventory.quantity -= inventoryTransaction.quantity;
        break;
      case InventoryTransactionReason.Migrate:
        inventory.quantity += inventoryTransaction.quantity
        const prevInventory = 
          (await InventoryModel.findOne({ material: inventoryTransactionInput.materialId, location: inventoryTransactionInput.locationId }))
          || (await InventoryModel.create({ material: inventoryTransactionInput.materialId, location: inventoryTransactionInput.prevLocationId }));

        prevInventory.quantity -= inventoryTransaction.quantity;
        await prevInventory.save();
        break;
    }
    
    await inventory.save();

    return inventoryTransaction;
  }

  @FieldResolver(() => Number)
  async quantity(@Root() material: Material): Promise<number> {
      const inventories = (await InventoryModel.find({ material: material._id }));
      return inventories.reduce((acc, inventory) => acc + inventory.quantity, 0);
  }
}
