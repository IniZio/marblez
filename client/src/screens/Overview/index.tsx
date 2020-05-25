import React, { Fragment, useState, useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useQuery, useSubscription } from "react-apollo";
import { Spinner, SimpleGrid, Box, InputGroup, InputLeftElement, Input, Icon, Flex } from '@chakra-ui/core';
import gql from 'graphql-tag';

import { FRAGMENT_ORDER } from '../../apollo/fragments';
import DatePicker from '../../components/DatePicker';
import NotificationStack from '../../components/NotificationStack';

function Overview() {
  const [pickupDate, setPickupDate] = useState<Date>(new Date());

  const {data, loading, refetch} = useQuery(gql`
    query ordersOfDay($pickupDate: DateTime!) {
      orders(pickupDate: $pickupDate) {
        ...OrderAllFields
      }
    }
    ${FRAGMENT_ORDER}
  `, {
    // pollInterval: 10000,
    variables: { pickupDate },
  });

  const [keyword, setKeyword] = useState('');
  const filteredOrders = useMemo(() => {
    if (!data || !data.orders) {
      return [];
    }
    if (!keyword) {
      return data.orders;
    }

    return data.orders
      .filter(order => order.phone && order.phone.includes(keyword))
      .filter(order => order.paid);
  }, [data, keyword])

  useEffect(() => {refetch({ pickupDate })}, [pickupDate]);

  const { data: { newNotification } = { newNotification: null }, loading: loadingNotificatinos, error } = useSubscription(
    gql`
      subscription {
        newNotification {
          orders {
            ...OrderAllFields
          }
          event
        }
      }
      ${FRAGMENT_ORDER}
    `,
    {
      variables: { },
      // onSubscriptionData({ client, subscriptionData }) {
      //   const cachedNotifications = client.readQuery({
      //     query: gql``,
      //     variables: { date: new Date() }
      //   })
      //   cachedNotifications.notifications.push(subscriptionData.data?.newNotification);
      //   client.writeQuery({
      //     query: gql``,
      //     variables: { date: new Date() },
      //     data: cachedNotifications,
      //   })
      // }
    }
  );
  
  return (
    <Flex>
      <Box padding={5} flex={1}>
        <DatePicker value={pickupDate} onChange={setPickupDate} />
        { !loadingNotificatinos && JSON.stringify(newNotification) }
        { JSON.stringify(error) }
        <InputGroup mb={5}>
          <InputLeftElement children={<Icon name="phone" color="gray.300" />} />
          <Input type="phone" placeholder="Phone number" onChange={e => setKeyword(e.target.value)} />
        </InputGroup>
        {loading ? (
          <Spinner />
        ) : (
          <SimpleGrid columns={[1, 2, 2, 4]} spacing="40px">
            {filteredOrders.map((order, index) => {
              function lineIf(o, fields, opt?: any) {
                const line = (
                  fields
                  .map(function(f, i) {
                    if (opt && opt.overrides && opt.overrides[i]) {
                      return opt.overrides[i](o[f])
                    }
                    if (f === 'date') {
                      return  format(parseISO(o[f]), 'MM/dd');
                    }
                    // if (o[f] instanceof Date) {
                    //   return (o[f].getMonth() + 1) + '/' + o[f].getDate();
                    // }
                    return o[f]
                  })
                  .join(' ')
                )
                return (
                    line.trim().length > 0 ? <Box mb={2}>{((opt && opt.prefix) || '') + line.trim()} <br /></Box> : ''
                );
              }
              
              const lines = (
                <Fragment>
                {lineIf(order, ['name', 'phone'], {prefix: '👨 '})}
                {lineIf(order, ['date', 'time'], {prefix: '🕐 '})}
                {lineIf(order, ['cake', 'size'], {prefix: '🎂 '})}
                {lineIf(order, ['shape', 'color']/*, {prefix: '      '}*/)}
                {lineIf(order, ['taste', 'letter']/*, {prefix: '      '}*/)}
                {lineIf(order, ['sentence'], {prefix: '✍️️ '})}
                {lineIf(order, ['decorations'])}
                {lineIf(order, ['order_from', 'social_name'], {prefix: '📲 '})}
                {lineIf(order, ['delivery_method', 'delivery_address'], {prefix: '🚚 '})}
                {lineIf(order, ['remarks'])}
                </Fragment>
              )
              
              return (
                <Box key={index} w="100%" borderWidth="1px" rounded="lg" overflow="hidden" p={5} shadow="md">
                  {lines}
                </Box>
              )})}
          </SimpleGrid>
        )}
      </Box>
      <NotificationStack maxW={300} />
    </Flex>
  );
}

export default Overview;
