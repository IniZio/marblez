import { ObjectId } from "mongodb";
import { Resolver, Query, FieldResolver, Arg, Root, Mutation, Ctx, Subscription } from "type-graphql";
import { parse, isValid, isSameDay, endOfDay, startOfDay } from 'date-fns';

import { Notification, NotificationModel } from '../entities/notification';
import googleSheet from '../respository/google-sheet';
import PubSubEvent from '../pubsub';

@Resolver(of => Notification)
export class NotificationResolver {
  @Query(returns => [Notification], { nullable: true })
  async notificationsToday() {
    console.log(endOfDay(new Date(2020, 11, 30)));
    
    return NotificationModel.find({
      'orders.date': { $gte: startOfDay(new Date(2020, 11, 30)) } ,
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
