import { addHours, addYears, isBefore, isValid, parse } from 'date-fns';
import { Order, OrderModel } from '../entities/order';
import { IOrder } from '../models/IOrder';
import googleSheet from '../respository/google-sheet';


type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

type Join<K, P> = K extends string | number ?
    P extends string | number ?
    `${K}${"" extends P ? "" : "."}${P}`
    : never : never;

type Paths<T, D extends number = 10> = T extends Array<any> ? never : [D] extends [never] ? never : T extends object ?
    { [K in keyof T]-?: K extends string ?
        `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never
    }[keyof T] : ""

const orderFields: Partial<{ [k in Paths<IOrder, 3>]: number | number[] }> = {
  paid: 0,
  receivedAt: 1,
  customerName: 2,
  customerPhone: 3,
  deliveryDate: 4,
  deliveryTime: 5,
  'otherAttributes.cake': [6, 7, 24],
  'otherAttributes.letter': 8,
  'otherAttributes.taste': [10, 11, 12, 13],
  'otherAttributes.innerTaste': [14],
  'otherAttributes.bottomTaste': [15],
  'otherAttributes.size': 18,
  'otherAttributes.shape': [19, 20],
  'otherAttributes.color': [9, 16],
  'otherAttributes.sentence': 25,
  'otherAttributes.paidSentence': [26, 27],
  'otherAttributes.toppings': 21,
  'otherAttributes.decorations': [22, 23],
  'customerSocialName': 28,
  'customerSocialChannel': 29,
  'deliveryMethod': 30,
  'deliveryAddress': 31,
  remarks: 32,
  'otherAttributes.printedReceipt': 89,
  'otherAttributes.printed': 90,
};

export const rowToOrder = (row: any[], index: any): Order => {
  const order: any = { otherAttributes: {} };
  Object.entries(orderFields).forEach(([key, columns]) => {
    // +2 to compenstate column header and start with 1 index
    order.row = index + 2;

    for (const column of [].concat(columns)) {
      order[key] = [row[column], order[key]].filter(Boolean).join(', ');
    }

    switch(key) {
      case 'paid':
      case 'otherAttributes.printed':
      case 'otherAttributes.printedReceipt':
        order[key] = order[key] === 'TRUE'
        break;
      case 'deliveryDate':
        order[key] = parse(order[key], 'M/d', order.receivedAt ? new Date(order.receivedAt) : new Date());
        if (!isValid(order[key])) {
          order[key] = undefined;
          break;
        }

        if(isBefore(order[key], order.receivedAt)) {
          order[key] = addYears(order[key], 1);
        }
        order[key] = addHours(order[key], 8);
        break;
      case 'otherAttributes.decorations':
      case 'otherAttributes.toppings':
        order[key] = (order[key] || '').split(', ').filter(Boolean);
        break;
      case 'receivedAt':
        order[key] = parse(order[key], 'M/d/y H:mm:ss', new Date());
        if (!isValid(order[key])) {
          order[key] = undefined;
        }
        break;
      case 'otherAttributes.cake':
      case 'otherAttributes.shape':
      case 'otherAttributes.color':
      case 'otherAttributes.taste':
      case 'otherAttributes.letter':
        order[key] = (order[key] as string).trim();
        break;
    }

    if (key.includes('otherAttributes.')) {
      order.otherAttributes[key.replace('otherAttributes.', '')] = order[key];
      delete order[key];
    }
  })

  return order;
}

export async function syncGoogleForms() {
  console.log('[Sync Google Form]: Starting to sync...')

  const records = await (await googleSheet.init()).getAllRows()
  const orders = records.map(rowToOrder).filter(o => o.customerPhone);

  await OrderModel.deleteMany({})
  await OrderModel.insertMany(orders);

  console.log('[Sync Google Form]: Finished!')

  return
}
