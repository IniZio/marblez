import { ObjectId } from "mongodb";
import { Resolver, Query, FieldResolver, Arg, Root, Mutation, Ctx, PubSubEngine, PubSub } from "type-graphql";
import { parse, isValid, isSameDay, addHours, compareDesc, getDay, getDate, getMonth, format, isSameMonth, isBefore, addYears, startOfDay, endOfDay, startOfMonth, endOfMonth, addDays } from 'date-fns';
import agent from 'superagent';
import { get } from 'lodash';

import { Order, OrderModel } from "../entities/order";
import * as GoogleSheetEvent from './types/google-sheet-event-input';
import googleSheet, { testGoogleSheetRepository } from '../respository/google-sheet';
import { NotificationModel, Notification } from '../entities/notification';
import { OrderMeta, OrderMetaModel } from '../entities/order_meta';
import PubSubEvent from '../pubsub';

import { OrderInput } from './types/order-input';
import { IOrder } from '@marblez/graphql';
import { FilterQuery } from 'mongoose';

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
  id: 91,
};

export const rowToOrder = (row: any[], index: any): Order => {
  const order: any = { otherAttributes: {} };
  Object.entries(orderFields).forEach(([key, columns]) => {
    // +2 to compenstate column header and start with 1 index
    order.id = index + 2;
    
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
        order[key] = parse(order[key], 'M/d', new Date(order.createdAt));
        if (!isValid(order[key])) {
          order[key] = undefined;
          break;
        } 
        
        if(isBefore(order[key], order.createdAt)) {
          order[key] = addYears(order[key], 1);
        }
        order[key] = addHours(order[key], 8);
        break;
      case 'otherAttributes.decorations':
      case 'otherAttributes.toppings':
        order[key] = (order[key] || '').split(', ').filter(Boolean).map((v: any) => v.replace(/\([^(\))]*\)/g, '').replace(/\*.[^\*]*$/, ''));
        break;
      case 'createdAt':
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
        order[key] = (order[key] as string)?.replace(/\([^(\))]*\)/g, '').trim();
        break;
    }

    if (key.includes('otherAttributes.')) {
      order.otherAttributes[key.replace('otherAttributes.', '')] = order[key];
      delete order[key];
    }
  })

  return order;
}


const orderToRow = (orderInput: OrderInput, prevRow: any[] = []) => {
  const row: any = [];
  Object.entries(orderFields).forEach(([key, _columns]) => {
    const columns = [].concat(_columns);

    let value = get(orderInput, key);

    switch(key) {
      case 'paid':
      case 'otherAttributes.printed':
        value =  [null, undefined].includes(value) ? undefined : value;
        break;
      case 'deliveryDate':
        value = format(value as any, 'M/d')
        break;
      case 'createdAt':
        value = format(value as any, 'M/d/y H:mm:ss')
        break;
      case 'otherAttributes.decorations':
      case 'otherAttributes.toppings':
        value = ((value || []) as string[]).filter(Boolean).join(', ')
        break;
      case 'otherAttributes.cake':
      case 'otherAttributes.shape':
      case 'otherAttributes.color':
      case 'otherAttributes.taste':
      case 'otherAttributes.letter':
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

  @Query(returns => [Order], { nullable: true })
  async receiptsOfDay(
    @Arg("pickupDate", type => Date, { nullable: true }) pickupDate?: Date,
    @Arg("keyword", type => String, { nullable: true }) keyword?: string,
  ) {
    const orders = await this._orders({
      pickupDate,
      keyword,
    })

    const newReceipts = orders.filter(order => !order.otherAttributes.printedReceipt);

    await Promise.all(newReceipts.map(receipt => googleSheet.updateCell(receipt.id, +orderFields['id'], 'TRUE')));

    return newReceipts;
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
    const keyword = _keyword?.replace(' ', '');

    const findFilter: FilterQuery<Order> = {};

    if (pickupDate) {
      findFilter.deliveryDate = {$gte: startOfDay(pickupDate), $lt: endOfDay(pickupDate)}
    }

    if (pickupMonth !== undefined) {
      const pickupDate = new Date();
      pickupDate.setMonth(pickupMonth);

      findFilter.deliveryDate = {$gte: startOfMonth(pickupDate), $lt: endOfMonth(pickupDate)};
    }

    if (keyword) {
      findFilter.$or = [
        { customerPhone: { $regex: keyword, $options: 'i' } },
        { customerName: { $regex: keyword, $options: 'i' } },
        { customerSocialName: { $regex: keyword, $options: 'i' } },
      ]
    }

    return OrderModel
      .find(findFilter)
      .sort([['deliveryDate', 1], ['deliveryTime', 1], ['paid', -1]])
      .limit(keyword ? 100 : undefined)
  }

  @Query(returns => String)
  async downloadOrdersOfDay(
    @Arg("date", type => Date, { nullable: true, defaultValue: new Date() }) date?: Date,
  ) {
    const res = await agent.get(`${process.env.GOOGLE_SHEET_SCRIPT_URL}?date=${date.toISOString()}&num_of_column=2`);
    return JSON.parse(res.text)?.url;
  }

  @Mutation(returns => Order)
  async updateOrder(
    @Arg('order', type => OrderInput) orderInput?: OrderInput
  ) {
    const row = await (await testGoogleSheetRepository.init()).getRow(orderInput.id);
    const updatedRow = orderToRow(orderInput, row);
    await (await testGoogleSheetRepository.init()).updateRow(orderInput.id, updatedRow)
    return orderInput;
  }

  @Mutation(returns => Order)
  async createOrder(
    @Arg('order', type => OrderInput) orderInput?: OrderInput
  ) {
    const row = orderToRow(orderInput);
    await (await testGoogleSheetRepository.init()).insertRow(row)
    return orderInput;
  }

  @FieldResolver(returns => OrderMeta, { nullable: true })
  async meta(@Root() order: Order): Promise<OrderMeta> {
    return OrderMetaModel.findOne({ orderId: order.id });
  }
}
