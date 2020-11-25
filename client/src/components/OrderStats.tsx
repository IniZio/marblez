import { Box, Heading, Stack, StackProps, Text } from '@chakra-ui/react';
import { gql } from 'apollo-boost';
import { startOfToday, startOfTomorrow } from 'date-fns';
import React from 'react';
import { useQuery } from 'react-apollo';

const todayFilter = { pickupDate: startOfToday() };
const tomorrowFilter = { pickupDate: startOfTomorrow() }

function StatItem({ label, number, ...rest }) {
  return (
    <Box p={5} shadow="sm" borderWidth="1px" {...rest}>
      <Heading fontSize="l">{label}</Heading>
      <Text fontSize="sm" mt={4}>{number}</Text>
    </Box>
  );
}

function OrderStats(props: StackProps) {
  const {data: ordersOfToday, refetch: refetchOrdersOfToday} = useQuery(gql`
    query ordersOfToday(
      $pickupDate: DateTime
    ) {
      ordersOfDay(
        pickupDate: $pickupDate
      ) {
        paid
      }
    }
  `, {
    pollInterval: 1000 * 60 * 5,
    variables: todayFilter,
  });

  const {data: ordersOfTomorrow, refetch: refetchOrdersOfTomorrow} = useQuery(gql`
    query ordersOfTomorrow(
      $pickupDate: DateTime
    ) {
      ordersOfDay(
        pickupDate: $pickupDate
      ) {
        paid
      }
    }
  `, {
    pollInterval: 1000 * 60 * 5,
    variables: tomorrowFilter,
  });
  
  
  return (
    <Stack spacing={2} p={4} {...props}>
      <StatItem
        label="No. orders of today"
        number={ordersOfToday?.ordersOfDay?.filter(o => o.paid).length}
      />
      <StatItem
        label="No. orders of tomorrow"
        number={ordersOfTomorrow?.ordersOfDay?.filter(o => o.paid).length}
      />
    </Stack>
  )
}

export default  OrderStats
