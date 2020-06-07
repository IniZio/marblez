import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from "react-apollo";
import { SimpleGrid, Box, InputGroup, InputLeftElement, Input, Icon, Flex, useToast, Tooltip, Button, Skeleton, IconButton, ButtonGroup } from '@chakra-ui/core';
import gql from 'graphql-tag';

import { FRAGMENT_ORDER } from '../../apollo/fragments';
import {useDebounce} from '../../hooks';
import DatePicker from '../../components/DatePicker';
import { downloadURI } from '../../util/dom';
import Order from '../../components/Order';
import OrderStats from '../../components/OrderStats';

function Overview() {
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
    pollInterval: 30000,
    notifyOnNetworkStatusChange: true,
    variables: filter,
  });

  const filteredOrders = useMemo(() => {
    if (!data || !data.orders) {
      return [];
    }

    return data.orders
      .filter(order => order.paid);
  }, [data]);


  const [loadingDownloadOrdersOfDay, setLoadingDownloadOrdersOfDay] = useState(false);
  const {refetch: refetchDownloadOrdersOfDay} = useQuery(gql`
    query ordersOfDay(
      $date: DateTime
    ) {
      downloadOrdersOfDay(
        date: $date
      )
    }
  `, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    skip: true,
    variables: { date: pickupDate },
  });
  const downloadOrdersOfDay = useCallback(async () => {
    setLoadingDownloadOrdersOfDay(true);
    const res = await refetchDownloadOrdersOfDay();
    const linkToOrdersOfDay = res.data.downloadOrdersOfDay;
    downloadURI(linkToOrdersOfDay, `Orders of ${pickupDate}.pdf`);
    setLoadingDownloadOrdersOfDay(false);
  }, [pickupDate])

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
        <ButtonGroup pb={5}>
          <Button mb={[3, 0]} leftIcon="repeat" onClick={() => refetchOrdersOfDay()} isLoading={loading} loadingText="Refreshing orders">Refresh orders</Button>
          <Button mb={[3, 0]} leftIcon="download" onClick={downloadOrdersOfDay} isLoading={loadingDownloadOrdersOfDay} loadingText="Downloading orders">Download orders</Button>
        </ButtonGroup>
          <SimpleGrid columns={[1, 2, 2, 3, 3]} spacing="40px">
            {loading ? (
              [1, 1, 1, 1, 1, 1, 1, 1].map((_, index) => <Skeleton key={index}><Order /></Skeleton>)
            ) : (
              filteredOrders.map((order, index) => <Order order={order} key={index} />)
            )}
          </SimpleGrid>
      </Box>
      {/* <NotificationStack maxW={300} notifications={notificationsOfDay} /> */}
      <OrderStats display={['none', 'none', 'block', 'block']} />
    </Flex>
  );
}

export default Overview;
