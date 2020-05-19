import React, { Fragment, useState, useMemo } from 'react';
import { gql } from "apollo-boost";
import { useQuery } from "react-apollo";
import { Spinner, SimpleGrid, Box, InputGroup, InputLeftElement, Input, Icon } from '@chakra-ui/core';

import { FRAGMENT_ORDER } from '../../apollo/fragments';

function Overview() {
  const {data, loading} = useQuery(gql`
    query {
      orders {
        ...OrderAllFields
      }
    }
    ${FRAGMENT_ORDER}
  `);

  const [keyword, setKeyword] = useState('');
  const filteredOrders = useMemo(() => {
    if (!data || !data.orders) {
      return [];
    }

    if (!keyword) {
      return data.orders;
    }

    return data.orders.filter(order => order.phone && order.phone.includes(keyword));
  }, [data, keyword])

  if (loading) {
    return <Spinner />;
  }
  
  return (
    <Box padding={5}>
      <InputGroup mb={5}>
        <InputLeftElement children={<Icon name="phone" color="gray.300" />} />
        <Input type="phone" placeholder="Phone number" onChange={e => setKeyword(e.target.value)} />
      </InputGroup>
      <SimpleGrid columns={[2, 3, 4]} spacing="40px">
        {filteredOrders.map(order => {
          function lineIf(o, fields, opt?: any) {
            const line = (
              fields
              .map(function(f, i) {
                if (opt && opt.overrides && opt.overrides[i]) {
                  return opt.overrides[i](o[f])
                }
                if (o[f] instanceof Date) {
                  return (o[f].getMonth() + 1) + '/' + o[f].getDate();
                }
                return o[f]
              })
              .join(' ')
            )
            return (
                line.trim().length > 0 ? <Fragment>{((opt && opt.prefix) || '') + line.trim()} <br /></Fragment> : ''
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
    </Box>
  );
}

export default Overview;
