import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Box } from '@chakra-ui/core';
import styled from '@emotion/styled';

import { theme } from '../theme';
import SocialButton from '../components/SocialButton';

export interface OrderProps {
  order?: any;
}


function lineIf(o, fields, opt?: any) {
  if (!o) {
    return null;
  }
  
  const line = (
    fields
    .map(function(f, i) {
      if (opt && opt.overrides && opt.overrides[i]) {
        return opt.overrides[i](o[f])
      }
      if (f === 'date') {
        return  format(parseISO(o[f]), 'MM/dd');
      }

      if (['cake', 'shape', 'color', 'taste', 'letter'].includes(f)) {
        return o[f].replace(/\([^(\))]*\)/g, '')
      }

      if (f === 'decorations') {
        return o[f].map(v => v.replace(/\([^(\))]*\)/g, ''))
      }
      return o[f]
    })
    .filter(Boolean)
    .join(' ')
  )
  return (
      line.trim().length > 0 ? ((opt && opt.prefix) || '') + line.trim() : ''
  );
}

const SocialButtonGroup = styled(Box)`
  > *:not(:last-child) {
    margin-right: ${theme.space[2]};
  }
`;

const StyledBox = styled(Box)`
  :active {
    box-shadow: ${theme.shadows.lg}
  }
`;

function Order({ order }: OrderProps) {
  const lines = useMemo(() => [
    lineIf(order, ['name', 'phone'], {prefix: '👨 '}),
    lineIf(order, ['date', 'time'], {prefix: '🕐 '}),
    lineIf(order, ['cake', 'size'], {prefix: '🎂 '}),
    lineIf(order, ['shape', 'color'], {prefix: '‎‎‎⠀⠀ '}),
    lineIf(order, ['taste', 'letter'], {prefix: '‎‎⠀⠀ '}),
    lineIf(order, ['sentence'], {prefix: '✍️️ '}),
    lineIf(order, ['decorations'], {prefix: '📿 '}),
    lineIf(order, ['order_from', 'social_name'], {prefix: '📲 '}),
    lineIf(order, ['delivery_method', 'delivery_address'], {prefix: '🚚 '}),
    lineIf(order, ['remarks']),
  ].filter(Boolean), [order]);
  
  return (
    <StyledBox w="100%" borderWidth="1px" rounded="lg" overflow="hidden" p={5} shadow="md" minHeight={353} fontSize={20} position="relative">
      <Box>
      {lines.map( 
        line => line && <Box key={line} mb={2}>{line}</Box>
      )}
      </Box>
      <SocialButtonGroup pos="absolute" right="5" top="5">
        <SocialButton.WhatsApp icon="external-link" text={lines.join('\n')} />
      </SocialButtonGroup>
      <SocialButtonGroup pos="absolute" right="5" bottom="5" bg="orange">
        <SocialButton.WhatsApp phone={order && order.phone} />
        {order?.order_from?.toLowerCase()?.includes('ig') && !order?.social_name?.trim()?.includes(' ') && <SocialButton.Instagram username={order?.social_name} />}
      </SocialButtonGroup>
    </StyledBox>
  )
}

export default Order;
