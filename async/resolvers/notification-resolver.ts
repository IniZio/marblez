import { ObjectId } from "mongodb";
import { Resolver, Query, FieldResolver, Arg, Root, Mutation, Ctx, Subscription } from "type-graphql";
import { parse, isValid, isSameDay, endOfDay, startOfDay, addHours } from 'date-fns';

import { Notification, NotificationModel } from '../entities/notification';
import googleSheet from '../respository/google-sheet';
import PubSubEvent from '../pubsub';

@Resolver(of => Notification)
export class NotificationResolver {
  @Query(returns => [Notification], { nullable: true })
  async notificationsOfDay(
    @Arg('date', type => Date, { defaultValue: new Date(2020, 1, 16) }) date: Date,
  ) {
    return NotificationModel.find({
      'orders.date': { $gte: startOfDay(date), $lte: endOfDay(date) } ,
    })
  }

  @Subscription({
    topics: PubSubEvent.NOTIFICATION,
  })
  newNotification(
    @Root() notificationPayload: Notification,
  ): Notification {
    console.log('=== new notification', notificationPayload)
    
    return notificationPayload;
  }
}
