import  React, { useMemo } from 'react';
import { StatGroup, Stat, StatLabel, StatNumber, StatHelpText, Stack, Box, Heading, Text, StackProps } from '@chakra-ui/core';
import { useQuery } from 'react-apollo';
import { gql } from 'apollo-boost';
import { startOfTomorrow, startOfToday } from 'date-fns';

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
      orders(
        pickupDate: $pickupDate
      ) {
        paid
      }
    }
  `, {
    pollInterval: 30000,
    variables: todayFilter,
  });

  const {data: ordersOfTomorrow, refetch: refetchOrdersOfTomorrow} = useQuery(gql`
    query ordersOfTomorrow(
      $pickupDate: DateTime
    ) {
      orders(
        pickupDate: $pickupDate
      ) {
        paid
      }
    }
  `, {
    pollInterval: 30000,
    variables: tomorrowFilter,
  });
  
  
  return (
    <Stack spacing={2} p={4} {...props}>
      <StatItem
        label="No. orders of today"
        number={ordersOfToday?.orders?.filter(o => o.paid).length}
      />
      <StatItem
        label="No. orders of tomorrow"
        number={ordersOfTomorrow?.orders?.filter(o => o.paid).length}
      />
    </Stack>
  )
}

export default  OrderStats
