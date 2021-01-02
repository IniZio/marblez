import { ObjectId } from "mongodb";
import { Resolver, Query, FieldResolver, Arg, Root, Mutation, Ctx, PubSubEngine, PubSub } from "type-graphql";
import { parse, isValid, isSameDay, addHours, compareDesc, getDay, getDate, getMonth, format, isSameMonth, isBefore, addYears } from 'date-fns';
import agent from 'superagent';
import { get } from 'lodash';

import { Order, OrderModel } from "../entities/order";
import * as GoogleSheetEvent from './types/google-sheet-event-input';
import googleSheet from '../respository/google-sheet';
import { NotificationModel, Notification } from '../entities/notification';
import PubSubEvent from '../pubsub';

import { OrderInput } from './types/order-input';
import { IOrder } from '@marblez/graphql';

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
  createdAt: 1,
  customerName: 2,
  customerPhone: 3,
  deliveryDate: 4,
  deliveryTime: 5,
  'attributes.cake': [6, 7, 24],
  'attributes.letter': 8,
  'attributes.taste': [10, 11, 12, 13],
  'attributes.innerTaste': [14],
  'attributes.bottomTaste': [15],
  'attributes.size': 18,
  'attributes.shape': [19, 20],
  'attributes.color': [9, 16],
  'attributes.sentence': 25,
  'attributes.paidSentence': [26, 27],
  'attributes.toppings': 21,
  'attributes.decorations': [22, 23],
  'customerSocialName': 28,
  'customerSocialChannel': 29,
  'deliveryMethod': 30,
  'deliveryAddress': 31,
  remarks: 32,
  'attributes.printed': 90,
  id: 91,
};

export const rowToOrder = (row: any[], index: any): Order => {
  const order: any = { attributes: {} };
  Object.entries(orderFields).forEach(([key, columns]) => {
    // +2 to compenstate column header and start with 1 index
    order.id = index + 2;
    
    for (const column of [].concat(columns)) {
      order[key] = [row[column], order[key]].filter(Boolean).join(', ');
    }

    switch(key) {
      case 'paid':
      case 'attributes.printed':
        order[key] = order[key] === 'TRUE'
        break;
      case 'deliveryDate':
        order[key] = parse(order[key], 'M/d', new Date(order.createdAt));
        if (!isValid(order[key])) {
          order[key] = undefined;
        } else if(isBefore(order[key], order.createdAt)) {
          order[key] = addYears(order[key], 1);
        }
        break;
      case 'attributes.decorations':
      case 'attributes.toppings':
        order[key] = (order[key] || '').split(', ').filter(Boolean).map((v: any) => v.replace(/\([^(\))]*\)/g, ''));
        break;
      case 'createdAt':
        order[key] = parse(order[key], 'M/d/y h:m:s', new Date());
        if (!isValid(order[key])) {
          order[key] = undefined;
        }
        break;
      case 'attributes.cake':
      case 'attributes.shape':
      case 'attributes.color':
      case 'attributes.taste':
      case 'attributes.letter':
        order[key] = (order[key] as string)?.replace(/\([^(\))]*\)/g, '').trim();
        break;
    }

    if (key.includes('attributes.')) {
      order.attributes[key.replace('attributes.', '')] = order[key];
      delete order[key];
    }
  })

  return order;
}

const validateOrder = (order: Order): boolean => {
  // if (!order.attributes.cake) {
  //   return false;
  // }

  return true;
}

const orderToRow = (orderInput: OrderInput, prevRow: any[] = []) => {
  const row: any = [];
  Object.entries(orderFields).forEach(([key, _columns]) => {
    const columns = [].concat(_columns);

    let value = get(orderInput, key);

    switch(key) {
      case 'paid':
      case 'attributes.printed':
        value =  [null, undefined].includes(value) ? undefined : value;
        break;
      case 'deliveryDate':
        value = format(value as any, 'M/d')
        break;
      case 'createdAt':
        value = format(value as any, 'M/d/y h:m:s')
        break;
      case 'attributes.decorations':
      case 'attributes.toppings':
        value = ((value || []) as string[]).filter(Boolean).join(', ')
        break;
      case 'attributes.cake':
      case 'attributes.shape':
      case 'attributes.color':
      case 'attributes.taste':
      case 'attributes.letter':
        value = (value as string)?.replace(/\([^(\))]*\)/g, '').trim();
        break;
    }

    let found;
    for (const column of columns.reverse()) {
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
  async ordersOfMonth(
    @Arg("pickupMonth", type => Number, { nullable: true }) pickupMonth?: number,
    @Arg("keyword", type => String, { nullable: true }) keyword?: string,
  ) {
    return this._orders({
      pickupMonth,
      keyword,
    })
  }

  @Query(returns => [Order], { nullable: true })
  async ordersOfDay(
    @Arg("pickupDate", type => Date, { nullable: true }) pickupDate?: Date,
    @Arg("keyword", type => String, { nullable: true }) keyword?: string,
  ) {
    return this._orders({
      pickupDate,
      keyword,
    })
  }
  
  async _orders({
    pickupDate,
    pickupMonth,
    keyword: _keyword,
  }: {
    pickupDate?: Date;
    pickupMonth?: number;
    keyword?: string;
  }) {
    const records = await (await googleSheet.init()).getAllRows()
    const orders = records.map(rowToOrder).filter(validateOrder);

    const keyword = _keyword?.replace(' ', '');

    return orders
    .filter(order => !pickupDate || isSameDay(order.deliveryDate, addHours(pickupDate, 8)))
    .filter(order => !pickupMonth || getMonth(order.deliveryDate) === pickupMonth)
    .filter(order => !keyword || order.customerPhone?.includes(keyword) || order.customerName?.includes(keyword) || order.customerSocialName?.includes(keyword))
    // Sort from latest pickup date
    .sort((a, b) => compareDesc(a.deliveryDate, b.deliveryDate))
    // And sort from earliest time
    .sort((a, b) => a.deliveryTime?.localeCompare(b.deliveryTime))
    .sort((a, b) => (Number(a.paid) || -1) - (Number(b.paid) || -1))
    .slice(0, keyword ? 100 : undefined);
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
    const row = await (await googleSheet.init()).getRow(orderInput.id);
    const updatedRow = orderToRow(orderInput, row);
    await (await googleSheet.init()).updateRow(orderInput.id, updatedRow)
    return orderInput;
  }

  @Mutation(returns => Order)
  async createOrder(
    @Arg('order', type => OrderInput) orderInput?: OrderInput
  ) {
    const row = orderToRow(orderInput);
    await (await googleSheet.init()).insertRow(row)
    return orderInput;
  }
}
