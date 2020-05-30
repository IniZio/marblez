import React from 'react';
import { Stack, Box, Heading, Text, StackProps } from '@chakra-ui/core';

function Notification({ title, desc, ...rest }) {
  return (
    <Box p={5} shadow="sm" borderWidth="1px" {...rest}>
      <Heading fontSize="l">{title}</Heading>
      <Text fontSize="sm" mt={4}>{desc}</Text>
    </Box>
  );
}

export interface NotificationStackProps extends StackProps {
  notifications: any[],
}

function NotificationStack({notifications, ...props}: NotificationStackProps) {
  return (
    <Stack spacing={2} p={4} {...props}>
      {notifications.map(noti => (
        <Notification
          title={`${noti.event}-ed ${noti.orders.map(o => o.phone)}`}
          desc=""
        />
      ))}
    </Stack>
  )
}

export default NotificationStack;
