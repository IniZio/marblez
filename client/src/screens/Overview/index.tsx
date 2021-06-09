import { DownloadIcon, EditIcon, PhoneIcon, RepeatIcon } from '@chakra-ui/icons';
import { Box, Button, Checkbox, css, Flex, Heading, HStack, IconButton, Input, InputGroup, InputLeftElement, LinkProps, SimpleGrid, Skeleton, useToast } from '@chakra-ui/react';
import gql from 'graphql-tag';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from "react-apollo";
import { Switch, Route, Link } from 'react-router-dom';
import { Home as HomeIcon, Calendar as CalendarIcon, Database } from 'react-feather';
import { FRAGMENT_ORDER } from '../../apollo/fragments';
import DatePicker from '../../components/DatePicker';
import Order from '../../components/Order';
import OrdersCalendar from '../../components/OrdersCalendar';
import OrderStats from '../../components/OrderStats';
import { useDebounce } from '../../hooks';
import { downloadURI } from '../../util/dom';
import InventoryPage from '../Inventory';
import TimelinePage from '../Timeline';
import { format } from 'date-fns';
import { IOrder } from '../../models/IOrder';

const NavigationLink = ({ icon, ...props }: { icon: React.ReactElement } & LinkProps) => (
  <Flex as={Link} flex={1} h={10} align="center" justify="center" {...props}>
    {icon}
  </Flex>
)

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

  const {data, loading, refetch: refetchOrdersOfDay, called} = useQuery<{ ordersOfDay: IOrder[] }>(gql`
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

  const paidOrders = useMemo<IOrder[]>(() => {
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
    () => filteredOrders.filter(order => !order.otherAttributes.printed),
    [filteredOrders]
  );
  const filteredExistingOrders = useMemo(
    () => filteredOrders.filter(order => order.otherAttributes.printed),
    [filteredOrders]
  );

  useEffect(
    () => {
      console.log('=== orders of day', filteredOrders, filteredNewOrders);
    },
    [filteredOrders, filteredNewOrders]
  )


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
        pOrder => pOrder.id === order.id
      )
    );
    if (newPaidOrders.length !== 0 && previousPaidOrders.length !== 0) {
      toast({
        title: 'New Order',
        description: newPaidOrders.map(o => o.customerPhone).join(', '),
        status: 'info',
        duration: null,
        isClosable: true,
        position: 'top-right'
      });
    }
  }, [paidOrders])


  const [loadingDownloadOrdersOfDay, setLoadingDownloadOrdersOfDay] = useState(false);
  const {refetch: refetchDownloadOrdersOfDay} = useQuery(gql`
    query downloadOrdersOfDay(
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
    downloadURI(linkToOrdersOfDay, `Orders of ${format(pickupDate, 'M_d')} (Paid).pdf`);
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
    <Flex flexDirection="column" maxH="100vh">
      <Switch>
        <Route path="/inventory" component={InventoryPage} />
        <Route path="/timeline" component={TimelinePage} />
        <Route path="/" exact>
          <Heading as="h1" size="xl" fontWeight="bold" mx={2} my={2}>訂單</Heading>
          <Box flex={1} maxW="100%" maxH="100vh" overflowY="auto" px={[2, 5]}>
            <InputGroup my={5}>
              <InputLeftElement children={<PhoneIcon color="gray.300" />} />
              <Input type="phone" placeholder="電話號碼" onChange={e => setKeyword(e.target.value)} />
            </InputGroup>
            <HStack spacing={[1, 5]} pb={5} flexWrap={['wrap']}>
              <DatePicker flex={1} value={pickupDate} onValue={setPickupDate} />
              <IconButton aria-label="Reload" icon={<RepeatIcon />} onClick={() => { setAutoReload(false); refetchOrdersOfDay(filter)}} isLoading={loading} />
            </HStack>
            <OrderStats date={pickupDate} />
            <HStack spacing={[1, 5]} py={2} flexWrap={['wrap']}>
              <Button leftIcon={<DownloadIcon />} onClick={downloadOrdersOfDay} isLoading={loadingDownloadOrdersOfDay} loadingText="正在下載...">下載訂單</Button>
              {/* <Checkbox isChecked={includeUnpaid} onChange={() => setIncludeUnpaid(!includeUnpaid)} verticalAlign="middle">顯示未付款訂單?</Checkbox> */}
            </HStack>
            {/* <OrdersCalendar filter={filter} /> */}
            {(loading && !autoReload) ? (
              [1, 1, 1, 1, 1, 1, 1, 1].map((_, index) => <Skeleton key={index}><Order /></Skeleton>)
            ) : (
              <>
                {filteredNewOrders.length > 0 && (
                  <Box border="1px solid green">
                    <Heading size="lg" my={3}>急單</Heading>
                      <SimpleGrid columns={[1, 2, 2, 3, 3]} spacing="40px">
                        {(
                          filteredNewOrders.map((order, index) => <Order onUpdate={() => refetchOrdersOfDay(filter)} order={order} key={order.id} />)
                        )}
                      </SimpleGrid>
                  </Box>
                )}

                {filteredExistingOrders.length > 0 && (
                  <Box>
                    <Heading size="lg" my={3}>舊單</Heading>
                    <SimpleGrid columns={[1, 2, 2, 3, 3]} spacing="40px">
                      {(loading && !autoReload) ? (
                        [1, 1, 1, 1, 1, 1, 1, 1].map((_, index) => <Skeleton key={index}><Order /></Skeleton>)
                      ) : (
                        filteredExistingOrders.map((order, index) => <Order onUpdate={() => refetchOrdersOfDay(filter)} order={order} key={order.id} />)
                      )}
                    </SimpleGrid>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Route>
      </Switch>
      {/* <NotificationStack maxW={300} notifications={notificationsOfDay} /> */}
      <Box mt="40px" h={0} />
      <Flex position="fixed" bottom={0} left={0} right={0} bg="white" css={css`
        ;box-shadow: rgb(0 0 0 / 10%) 0px 0 40px;
        padding-top: constant(safe-area-inset-top);
        padding-right: constant(safe-area-inset-right);
        padding-bottom: constant(safe-area-inset-bottom);
        padding-left: constant(safe-area-inset-left);
      `}>
        <NavigationLink to="/inventory" icon={<Database size={18} />} />
        <NavigationLink to="/" icon={<HomeIcon size={18} />} />
        <NavigationLink to="/timeline" icon={<CalendarIcon size={18} />} />
      </Flex>
    </Flex>
  );
}

export default Overview;
