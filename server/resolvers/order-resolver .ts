import { ObjectId } from "mongodb";
import { Resolver, Query, FieldResolver, Arg, Root, Mutation, Ctx, PubSubEngine, PubSub } from "type-graphql";
import { parse, isValid, isSameDay, addHours, compareDesc, getDay, getDate, getMonth, format } from 'date-fns';
import agent from 'superagent';

import { Order } from "../entities/order";
import * as GoogleSheetEvent from './types/google-sheet-event-input';
import googleSheet from '../respository/google-sheet';
import { NotificationModel, Notification } from '../entities/notification';
import PubSubEvent from '../pubsub';

import { OrderInput } from './types/order-input';

const orderFields = {
  paid: 0,
  created_at: 1,
  name: 2,
  phone: 3,
  date: 4,
  time: 5,
  cake: [6, 7, 24],
  letter: 8,
  taste: [10, 11, 12, 13],
  inner_taste: [14],
  bottom_taste: [15],
  size: 18,
  shape: [19, 20],
  color: [9, 16],
  sentence: 25,
  paid_sentence: 26,
  toppings: 21,
  decorations: [22, 23],
  social_name: 28,
  order_from: 29,
  delivery_method: 30,
  delivery_address: 31,
  remarks: 32,
  printed: 90,
//  index: ,
};

const rowToOrder = (row: any[], index: any): Order => {
  const order: any = {};
  Object.entries(orderFields).forEach(([key, columns]) => {
    // +2 to compenstate column header and start with 1 index
    order.index = index + 2;
    
    for (const column of [].concat(columns)) {
      order[key] = [row[column], order[key]].filter(Boolean).join(', ');
    }

    switch(key) {
      case 'paid':
        order[key] = order[key] === 'TRUE'
        break;
      case 'date':
        order[key] = parse(order[key], 'M/d', new Date());
        if (!isValid(order[key])) {
          order[key] = undefined;
        }
        break;
      case 'decorations':
        order[key] = (order[key] || '').split(', ').filter(Boolean).map((v: any) => v.replace(/\([^(\))]*\)/g, ''));
        break;
      case 'printed':
        // order[key] = typeof order[key] === 'string' && order[key].toUpperCase() === 'TRUE'
        break;
      case 'created_at':
        order[key] = parse(order[key], 'M/d/y k:m:s', new Date());
        if (!isValid(order[key])) {
          order[key] = undefined;
        }
        break;
      default:
        if (['cake', 'shape', 'color', 'taste', 'letter'].includes(key)) {
          return order[key]?.replace(/\([^(\))]*\)/g, '');
        }
        return order[key]
    }
  })
  return order;
}

const orderToRow = (orderInput: OrderInput, prevRow: any[]) => {
  const row: any = [];
  Object.entries(orderFields).forEach(([key, _columns]) => {
    const columns = [].concat(_columns);

    let value = orderInput[key as keyof OrderInput];

    switch(key) {
      case 'paid':
      case 'printed':
        value =  [null, undefined].includes(value) ? undefined : value;
        break;
      case 'date':
        value = format(value as any, 'M/d')
        break;
      case 'decorations':
        value = (value as string[]).filter(Boolean).join(', ')
        break;
      default:
        if (['cake', 'shape', 'color', 'taste', 'letter'].includes(key)) {
          value = (value as any)?.replace(/\([^(\))]*\)/g, '');
        }
    }

    let found;
    for (const column of columns) {
      if (prevRow[column]) {
        found = true;
        row[column] = [null, undefined].includes(value) ? row[column] : value;
      }
    }

    if (!found) {
      row[columns[columns.length - 1]] = value;
    }

  })
  return row;
}

@Resolver(of => Order)
export class OrderResolver {
  @Mutation(returns => Notification)
  async onOrderGoogleSheetEditEvent(
    @Arg('editEvent', type => GoogleSheetEvent.EditEventInput) editEvent: GoogleSheetEvent.EditEventInput,
    @PubSub() pubsub: PubSubEngine,
  ) {
    const records = await (await googleSheet.init()).getAllRows()
    const orders = records.map(rowToOrder);

    const order = orders[editEvent.row - 1];

    const notification = new NotificationModel({
      orders: [order],
      event: 'onEdit',
    } as Notification);

     const payload = await notification.save();

     await pubsub.publish(PubSubEvent.NOTIFICATION, payload.toObject());
     return payload;
  }
  
  @Query(returns => [Order], { nullable: true })
  async orders(
    @Arg("pickupDate", type => Date, { nullable: true }) pickupDate?: Date,
    @Arg("keyword", type => String, { nullable: true }) _keyword?: string,
  ) {
    const records = await (await googleSheet.init()).getAllRows()
    const orders = records.map(rowToOrder);

    const keyword = _keyword?.replace(' ', '');

    return orders
    .filter(order => !pickupDate || isSameDay(order.date, addHours(pickupDate, 8)))
    .filter(order => !keyword || order.phone?.includes(keyword) || order.name?.includes(keyword) || order.social_name?.includes(keyword))
    // Sort from latest pickup date
    .sort((a, b) => compareDesc(a.date, b.date))
    // And sort from earliest time
    .sort((a, b) => a.time?.localeCompare(b.time))
    .sort((a, b) => (Number(a.paid) || -1) - (Number(b.paid) || -1))
    .slice(0, 100);
  }

  @Query(returns => String)
  async downloadOrdersOfDay(
    @Arg("date", type => Date, { nullable: true, defaultValue: new Date() }) date?: Date,
  ) {
    const res = await agent.get(`${process.env.GOOGLE_SHEET_SCRIPT_URL}?date=${date.toISOString()}`);
    return res.text
  }

  @Mutation(returns => Order)
  async updateOrder(
    @Arg('order', type => OrderInput) orderInput?: OrderInput
  ) {
    const row = await (await googleSheet.init()).getRow(orderInput.index);
    const updatedRow = orderToRow(orderInput, row);
    await (await googleSheet.init()).updateRow(orderInput.index, updatedRow)
    return orderInput;
  }
}
