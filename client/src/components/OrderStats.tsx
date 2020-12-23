import { Box, Heading, StackProps, Stat, StatGroup, StatLabel, StatNumber, Text, CircularProgress } from '@chakra-ui/react';
import { gql } from 'apollo-boost';
import { addDays, startOfDay, startOfToday, startOfTomorrow } from 'date-fns';
import React, { useMemo } from 'react';
import { useQuery } from 'react-apollo';

// const todayFilter = { pickupDate: startOfToday() };
// const tomorrowFilter = { pickupDate: startOfTomorrow() }

function StatItem({ label, number, ...rest }) {
  return (
    <Box p={5} shadow="sm" borderWidth="1px" {...rest}>
      <Heading fontSize="l">{label}</Heading>
      <Text fontSize="sm" mt={4}>{number}</Text>
    </Box>
  );
}

export interface OrderStatsProps extends StackProps {
  date: Date;
}

function OrderStats(props: OrderStatsProps) {
  const todayFilter = useMemo(() => ({pickupDate: startOfDay(props.date)}), [props.date]);
  const tomorrowFilter = useMemo(() => ({pickupDate: addDays(startOfDay(props.date), 1)}), [props.date]);
  
  const {data: ordersOfToday, refetch: refetchOrdersOfToday, loading: loadingOrdersOfToday} = useQuery(gql`
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

  const {data: ordersOfTomorrow, refetch: refetchOrdersOfTomorrow, loading: loadingOrdersOfTomorrow} = useQuery(gql`
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
    <StatGroup p={4} borderWidth={1} borderRadius="lg" {...props}>
      <Stat>
        <StatLabel>No. orders of today</StatLabel>
        <StatNumber>{loadingOrdersOfToday ? <CircularProgress size={5} isIndeterminate /> : ordersOfToday?.ordersOfDay?.filter(o => o.paid).length}</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>No. orders of tomorrow</StatLabel>
        <StatNumber>{loadingOrdersOfTomorrow ? <CircularProgress size={5} isIndeterminate /> : ordersOfTomorrow?.ordersOfDay?.filter(o => o.paid).length}</StatNumber>
      </Stat>
    </StatGroup>
  )
}

export default  OrderStats
