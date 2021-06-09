import { Box, BoxProps, Heading, Stack, StackProps, Text } from '@chakra-ui/react';
import React from 'react';
import { IOrder } from '../models/IOrder';

function Notification({ title, desc, ...rest }: NotificationProps) {
  return (
    <Box p={5} shadow="sm" borderWidth="1px" {...rest}>
      <Heading fontSize="l">{title}</Heading>
      <Text fontSize="sm" mt={4}>{desc}</Text>
    </Box>
  );
}

export interface NotificationProps extends BoxProps {
  title: string;
  desc: string;
}

export interface NotificationStackProps extends StackProps {
  notifications: any[],
}

function NotificationStack({notifications, ...props}: NotificationStackProps) {
  return (
    <Stack spacing={2} p={4} {...props}>
      {notifications.map(noti => (
        <Notification
          title={`${noti.event}-ed ${noti.orders.map((o: IOrder) => o.customerPhone)}`}
          desc=""
        />
      ))}
    </Stack>
  )
}

export default NotificationStack;
