import { endOfTomorrow, isWithinInterval, startOfToday } from 'date-fns';
import diff from 'diff-arrays-of-objects';
import { Order, OrderModel } from '../entities/order';
import { rowToOrder } from '../resolvers/order-resolver ';
import googleSheet, { snapshotGoogleSheetRepository } from '../respository/google-sheet';


export async function syncGoogleForms() {
  console.log('[Sync Google Form]: Starting to sync...')

  const records = await (await googleSheet.init()).getAllRows()
  const orders = records.map(rowToOrder).filter(o => o.id);

  await OrderModel.deleteMany({})
  await OrderModel.insertMany(orders);

  console.log('[Sync Google Form]: Finished!')

  return
}

export async function syncGoogleFormsIfStale() {
  const lastUpdated = await OrderModel.findOne();

  // Haven't refreshed for 10 min
  if (lastUpdated.createdAt < new Date(Date.now() - 10 * 6000)) {
    return syncGoogleForms();
  }

  return Promise.resolve();
}