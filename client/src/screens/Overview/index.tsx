import React, { Fragment, useState, useMemo, useEffect, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { useQuery, useSubscription } from "react-apollo";
import { Spinner, SimpleGrid, Box, InputGroup, InputLeftElement, Input, Icon, Flex, useToast, Tooltip } from '@chakra-ui/core';
import gql from 'graphql-tag';
import produce from 'immer';
import { throttle } from 'lodash';

import { FRAGMENT_ORDER } from '../../apollo/fragments';
import { QUERY_NOTIFICATIONS_OF_DAY } from '../../apollo/query';
import {useDebounce} from '../../hooks';
import DatePicker from '../../components/DatePicker';
import NotificationStack from '../../components/NotificationStack';
import CopyToClipboard from '../../components/CopyToClipboard';
import styled from '@emotion/styled';
import { theme } from '../../theme';


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
      return o[f]
    })
    .join(' ')
  )
  return (
      line.trim().length > 0 ? ((opt && opt.prefix) || '') + line.trim() : ''
  );
}

const StyledBox = styled(Box)`
  :active {
    box-shadow: ${theme.shadows.lg}
  }
`;

function Overview() {
  const toast = useToast();
  
  const [pickupDate, setPickupDate] = useState<Date>(new Date());

  const [keyword, setKeyword] = useState('');

  const filter = useMemo(() => ({
    keyword,
    pickupDate: keyword ? undefined : pickupDate,
  }), [keyword, pickupDate]);

  const {data, loading, refetch: refetchOrdersOfDay} = useQuery(gql`
    query ordersOfDay(
      $pickupDate: DateTime
      $keyword: String
    ) {
      orders(
        pickupDate: $pickupDate
        keyword: $keyword
      ) {
        ...OrderAllFields
      }
    }
    ${FRAGMENT_ORDER}
  `, {
    // pollInterval: 10000,
    variables: filter,
  });

  const filteredOrders = useMemo(() => {
    if (!data || !data.orders) {
      return [];
    }

    return data.orders
      .filter(order => order.paid);
  }, [data]);

  const debouncedFilter = useDebounce(filter, 2000);

  useEffect(() => {refetchOrdersOfDay(filter)}, [debouncedFilter]);

  // const { data: { notificationsOfDay } = { notificationsOfDay: [] }, loading: loadingNotifications, error, refetch: refetchNotifications } = useQuery(
  //   QUERY_NOTIFICATIONS_OF_DAY,
  //   { variables: { date: pickupDate } }
  // )
  // useEffect(() => {refetchNotifications({ date: pickupDate })}, [pickupDate]);

  // const { data: { newNotification } = { newNotification: null }, loading: loadingNewNotification } = useSubscription(
  //   gql`
  //     subscription {
  //       newNotification {
  //         orders {
  //           ...OrderAllFields
  //         }
  //         event
  //       }
  //     }
  //     ${FRAGMENT_ORDER}
  //   `,
  //   {
  //     variables: { },
  //     onSubscriptionData({ client, subscriptionData }) {
  //       const cachedNotifications = client.readQuery({
  //         query: QUERY_NOTIFICATIONS_OF_DAY,
  //         variables: { date: pickupDate },
  //       })

  //       client.writeQuery({
  //         query: QUERY_NOTIFICATIONS_OF_DAY,
  //         variables: { date: pickupDate },
  //         data: produce(cachedNotifications, state => {
  //           state.notificationsOfDay.push(subscriptionData.data?.newNotification)
  //         }),
  //       })
  //     }
  //   }
  // );
  
  return (
    <Flex>
      <Box padding={5} flex={1}>
        <DatePicker value={pickupDate} onChange={setPickupDate} />
        <InputGroup mb={5}>
          <InputLeftElement children={<Icon name="phone" color="gray.300" />} />
          <Input type="phone" placeholder="Phone number" onChange={e => setKeyword(e.target.value)} />
        </InputGroup>
        {loading ? (
          <Spinner />
        ) : (
          <SimpleGrid columns={[1, 2, 2, 4]} spacing="40px">
            {filteredOrders.map((order, index) => {
              const lines = [
                lineIf(order, ['name', 'phone'], {prefix: '👨 '}),
                lineIf(order, ['date', 'time'], {prefix: '🕐 '}),
                lineIf(order, ['cake', 'size'], {prefix: '🎂 '}),
                lineIf(order, ['shape', 'color']/*, {prefix: '      '}*/),
                lineIf(order, ['taste', 'letter']/*, {prefix: '      '}*/),
                lineIf(order, ['sentence'], {prefix: '✍️️ '}),
                lineIf(order, ['decorations']),
                lineIf(order, ['order_from', 'social_name'], {prefix: '📲 '}),
                lineIf(order, ['delivery_method', 'delivery_address'], {prefix: '🚚 '}),
                lineIf(order, ['remarks']),
              ];
              
              return (
                <CopyToClipboard text={lines.join('\n')} onCopy={(text) => toast({
                  title: 'Order copied!',
                  duration: 1000,
                  status: 'success'
                })}>
                    <StyledBox key={index} w="100%" borderWidth="1px" rounded="lg" overflow="hidden" p={5} shadow="md">
                  <Tooltip aria-label="Copy order" hasArrow label="Click to Copy :)" placement="top" showDelay={1000}>
                  <Box>
                      {lines.map( 
                        line => line && <Box key={line} mb={2}>{line}<br/></Box>
                      )}
                      </Box>
                  </Tooltip>
                    </StyledBox>
                </CopyToClipboard>
              )})}
          </SimpleGrid>
        )}
      </Box>
      {/* <NotificationStack maxW={300} notifications={notificationsOfDay} /> */}
    </Flex>
  );
}

export default Overview;
