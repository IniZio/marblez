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

function NotificationStack(props: StackProps) {
  return (
    <Stack spacing={2} p={4} {...props}>
      <Notification
        title="Plan Money"
        desc="The future can be even brighter but a goal without a plan is just a wish"
      />
      <Notification
        title="Save Money"
        desc="You deserve good things. With a whooping 10-15% interest rate per annum, grow your savings on your own terms with our completely automated process"
      />
    </Stack>
  )
}

export default NotificationStack;
