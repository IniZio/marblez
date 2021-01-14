import { endOfTomorrow, isWithinInterval, startOfToday } from 'date-fns';
import diff from 'diff-arrays-of-objects';
import { Order, OrderModel } from '../entities/order';
import { rowToOrder } from '../resolvers/order-resolver ';
import googleSheet, { snapshotGoogleSheetRepository } from '../respository/google-sheet';



const lineIf = (order: Order, key: keyof Order) => {
  const value = order[key] ;
  return [].concat(value).join(', ')
}

export async function syncGoogleForms() {
  console.log('[Sync Google Form]: Starting to sync...')

  const records = await (await googleSheet.init()).getAllRows()
  const orders = records.map(rowToOrder);
  
  await OrderModel.deleteMany({})
  await OrderModel.insertMany(orders);
  return

  const [todayStart, tmwEnd] = [startOfToday(), endOfTomorrow()];

  // const ordersToTrack = await OrderModel.find({
  //   date: {$gte: todayStart, $lt: tmwEnd}
  // });


  const ordersToMatch = await OrderModel.find({
    date: {$gte: todayStart, $lt: tmwEnd}
  });

  const snapshotOrders = (await (await snapshotGoogleSheetRepository.init()).getAllRows()).map(rowToOrder)
  const oldOrdersToCheck = snapshotOrders.filter(order => isWithinInterval(order.deliveryDate, {start: todayStart, end: tmwEnd}));
  const newOrdersToCheck = orders.filter(order => isWithinInterval(order.deliveryDate, {start: todayStart, end: tmwEnd}));

  // fs.writeFileSync(path.resolve(__dirname, '../../wtf1.json'), JSON.stringify(oldOrdersToCheck, null, 4))


  await (await googleSheet.init()).snapshot();

  const difference = diff(oldOrdersToCheck, newOrdersToCheck, 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff })

  // fs.writeFileSync(path.resolve(__dirname, '../../wtf.json'), JSON.stringify(difference, null, 4))

  const messages = []

  // Added orders
  messages.push(
    'Added:\n'
    + difference.added.map((order: Order) => `#${order.id}`).join('\n')
  )

  messages.push(
    'Removed:\n'
    + difference.removed.map((order: Order) => `#${order.id}`).join('\n')
  )

  messages.push(
    'Updated:\n'
    + difference.updated.map(([older, newer, patches]: [Order, Order, any[]]) => {
      const patchNotes: string[] = [`#${older.id}`];
      const paths: { [index in keyof Order]?: boolean } = {}
      patches.forEach(patch => {
        let patchNote = '';
        const key: keyof Order = patch.path[0];
        if (paths[key]) {
          return;
        }
        paths[key] = true;
        const oldValue = lineIf(older, key);
        const newValue = lineIf(newer, key);
        if (patch.kind === 'E' || patch.kind === 'A' || patch.kind === 'N') {
          patchNote += `${key}: ${oldValue} -> ${newValue}`
        } else if (patch.kind === 'D') {
          patchNote += `X ${key}`;
        }
        patchNotes.push(patchNote)
      })
      return patchNotes.join('\n')
    }).join('\n\n')
  )

  console.log('=== messages\n', messages.join('\n\n'));

  console.log('[Sync Google Form]: Finished!')

}
