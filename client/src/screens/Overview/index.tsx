import React, { Fragment } from 'react';
import { gql } from "apollo-boost";
import { useQuery } from "react-apollo";
import { Spinner, SimpleGrid, Box } from '@chakra-ui/core';

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

  if (loading) {
    return <Spinner />;
  }
  
  return (
    <SimpleGrid columns={[2, 3, 4]} spacing="40px">
      {data.orders.map(order => {
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
          <Box w="100%" borderWidth="1px" rounded="lg" overflow="hidden">
            {lines}
          </Box>
        )})}
    </SimpleGrid>
  );
}

export default Overview;
