import { ObjectId } from "mongodb";
import { Resolver, Query, FieldResolver, Arg, Root, Mutation, Ctx, PubSubEngine, PubSub } from "type-graphql";
import { parse, isValid, isSameDay, addHours, compareDesc } from 'date-fns';

import { Order } from "../entities/order";
import * as GoogleSheetEvent from './types/google-sheet-event-input';
import googleSheet from '../respository/google-sheet';
import { NotificationModel, Notification } from '../entities/notification';
import PubSubEvent from '../pubsub';

const orderFields = {
  paid: 0,
  created_at: 1,
  name: 2,
  phone: 3,
  date: 4,
  time: 5,
  cake: 6,
  letter: 7,
  taste: [9, 10, 11, 12, 13],
  size: 16,
  shape: [17, 18],
  color: 8,
  sentence: [20, 21],
  decorations: 19,
  social_name: 22,
  order_from: 23,
  delivery_method: 24,
  delivery_address: 25,
  remarks: 26,
//  printed: ,
//  index: ,
};

const rowToOrder = (row: any[]): Order => {
  const order: any = {};
  Object.entries(orderFields).forEach(([key, columns]) => {
    for (const column of [].concat(columns)) {
      order[key] = order[key] || row[column];
    }

    switch(key) {
      case 'paid':
        order[key] = order[key] === 'TRUE'
        break;
      case 'date':
        order[key] = addHours(parse(order[key], 'M/d', new Date()), 8);
        console.log('=== date', order[key]);
        if (!isValid(order[key])) {
          order[key] = undefined;
        }
        break;
      case 'decorations':
        order[key] = (order[key] || '').split(', ');
        break;
      case 'created_at':
        order[key] = addHours(parse(order[key], 'M/d/y k:m:s', new Date()), 8);
        if (!isValid(order[key])) {
          order[key] = undefined;
        }
        break;
    }
  })
  return order;
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
    @Arg("keyword", type => String, { nullable: true }) keyword?: string,
  ) {
    const records = await (await googleSheet.init()).getAllRows()
    const orders = records.map(rowToOrder);
    
    return orders
    .filter(order => !pickupDate || isSameDay(order.date, pickupDate))
    .filter(order => !keyword || order.phone?.includes(keyword))
    // Sort from latest pickup date
    .sort((a, b) => compareDesc(a.date, b.date))
    // And sort from earliest time
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 100);
  }
}
