import React, { Fragment, useState, useMemo, useEffect } from 'react';
import { gql } from "apollo-boost";
import { useQuery } from "react-apollo";
import { Spinner, SimpleGrid, Box, InputGroup, InputLeftElement, Input, Icon } from '@chakra-ui/core';

import { FRAGMENT_ORDER } from '../../apollo/fragments';
import DatePicker from '../../components/DatePicker';
import { isValid, getMonth, parse, parseISO } from 'date-fns';
import { format } from 'date-fns/esm';

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
    pollInterval: 10000,
    variables: { pickupDate }
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
  
  return (
    <Box padding={5}>
      <DatePicker value={pickupDate} onChange={setPickupDate} />
      <InputGroup mb={5}>
        <InputLeftElement children={<Icon name="phone" color="gray.300" />} />
        <Input type="phone" placeholder="Phone number" onChange={e => setKeyword(e.target.value)} />
      </InputGroup>
      {loading ? (
        <Spinner />
      ) : (
        <SimpleGrid columns={[1, 2, 3, 4]} spacing="40px">
          {filteredOrders.map(order => {
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
              <Box w="100%" borderWidth="1px" rounded="lg" overflow="hidden" p={5}>
                {lines}
              </Box>
            )})}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default Overview;
