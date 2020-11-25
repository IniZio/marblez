import { DownloadIcon, PhoneIcon, RepeatIcon } from '@chakra-ui/icons';
import { Box, Button, ButtonGroup, Checkbox, Flex, Heading, Input, InputGroup, InputLeftElement, SimpleGrid, Skeleton, useToast } from '@chakra-ui/react';
import gql from 'graphql-tag';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from "react-apollo";
import { FRAGMENT_ORDER } from '../../apollo/fragments';
import DatePicker from '../../components/DatePicker';
import Order from '../../components/Order';
import OrderStats from '../../components/OrderStats';
import { useDebounce } from '../../hooks';
import { downloadURI } from '../../util/dom';


function Overview() {
  const toast = useToast();
  const [pickupDate, setPickupDate] = useState<Date>(new Date());
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 1000);
  const [includeUnpaid, setIncludeUnpaid] = useState(false);
  const [autoReload, setAutoReload] = useState(false);

  const filter = useMemo(() => ({
    keyword,
    pickupDate: debouncedKeyword ? undefined : pickupDate,
  }), [debouncedKeyword, pickupDate]);

  const {data, loading, refetch: refetchOrdersOfDay, called} = useQuery(gql`
    query ordersOfDay(
      $pickupDate: DateTime
      $keyword: String
    ) {
      ordersOfDay(
        pickupDate: $pickupDate
        keyword: $keyword
      ) {
        ...OrderAllFields
      }
    }
    ${FRAGMENT_ORDER}
  `, {
    pollInterval: 1000 * 60,
    // pollInterval: 1000 * 3,
    notifyOnNetworkStatusChange: true,
    variables: filter,
  });

  const paidOrders = useMemo(() => {
    if (!data || !data.ordersOfDay) {
      return [];
    }

    return data.ordersOfDay
      .filter(order => order.paid);
  }, [data]);

  const filteredOrders = useMemo(() => {
    if (!data || !data.ordersOfDay) {
      return [];
    }

    return data.ordersOfDay
      .filter(order => includeUnpaid || order.paid);
  }, [data, includeUnpaid]);
  const filteredNewOrders = useMemo(
    () => filteredOrders.filter(order => !order.printed),
    [filteredOrders]
  );
  const filteredExistingOrders = useMemo(
    () => filteredOrders.filter(order => order.printed),
    [filteredOrders]
  );

  const previousPaidOrdersRef = useRef(paidOrders);
  const previousPickupDateRef = useRef(pickupDate);
  useEffect(() => {
    if (previousPaidOrdersRef.current.length) {
      setAutoReload(true);
    }
    
    const previousPaidOrders = previousPaidOrdersRef.current;

    if (!loading) {
      previousPaidOrdersRef.current = paidOrders;
    }

    if (previousPickupDateRef.current !== pickupDate || previousPaidOrders.length === 0) {
      return;
    }

    previousPickupDateRef.current = pickupDate;
    const newPaidOrders = paidOrders.filter(
      order => !previousPaidOrders.find(
        pOrder => pOrder.index === order.index
      )
    );
    if (newPaidOrders.length !== 0 && previousPaidOrders.length !== 0) {
      toast({
        title: 'New Order',
        description: newPaidOrders.map(o => o.phone).join(', '),
        status: 'info',
        duration: null,
        isClosable: true,
        position: 'top-right'
      });
    }
  }, [paidOrders])


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
        <DatePicker value={pickupDate} onValue={setPickupDate} my={5} />
        <InputGroup mb={5}>
          <InputLeftElement children={<PhoneIcon color="gray.300" />} />
          <Input type="phone" placeholder="Phone number" onChange={e => setKeyword(e.target.value)} />
        </InputGroup>
        <ButtonGroup pb={5}>
          <Button mb={[3, 0]} leftIcon={<RepeatIcon />} onClick={() => { setAutoReload(false); refetchOrdersOfDay(filter)}} isLoading={loading} loadingText="Refreshing orders">Refresh orders</Button>
          <Button mb={[3, 0]} leftIcon={<DownloadIcon />} onClick={downloadOrdersOfDay} isLoading={loadingDownloadOrdersOfDay} loadingText="Downloading orders">Download orders</Button>
          <Checkbox isChecked={includeUnpaid} onChange={() => setIncludeUnpaid(!includeUnpaid)} verticalAlign="middle">Show Unpaid?</Checkbox>
        </ButtonGroup>
        <OrderStats />
          {(loading && !autoReload) ? (
            [1, 1, 1, 1, 1, 1, 1, 1].map((_, index) => <Skeleton key={index}><Order /></Skeleton>)
          ) : (
            <>
              {filteredNewOrders.length > 0 && (
                <Box p={3} border="1px solid green">
                  <Heading my={3}>急單</Heading>
                    <SimpleGrid columns={[1, 2, 2, 3, 3]} spacing="40px">
                      {(
                        filteredNewOrders.map((order, index) => <Order onUpdate={() => refetchOrdersOfDay(filter)} order={order} key={index} />)
                      )}
                    </SimpleGrid>
                </Box>
              )}

              {filteredExistingOrders.length > 0 && (
                <Box p={3}>
                  <Heading my={3}>舊單</Heading>
                  <SimpleGrid columns={[1, 2, 2, 3, 3]} spacing="40px">
                    {(loading && !autoReload) ? (
                      [1, 1, 1, 1, 1, 1, 1, 1].map((_, index) => <Skeleton key={index}><Order /></Skeleton>)
                    ) : (
                      filteredExistingOrders.map((order, index) => <Order onUpdate={() => refetchOrdersOfDay(filter)} order={order} key={index} />)
                    )}
                  </SimpleGrid>
                </Box>
              )}
            </>
          )}
      </Box>
      {/* <NotificationStack maxW={300} notifications={notificationsOfDay} /> */}
    </Flex>
  );
}

export default Overview;
