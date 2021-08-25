import { RepeatIcon } from '@chakra-ui/icons';
import { Box, css, Flex, Heading, IconButton } from '@chakra-ui/react';
import { gql } from 'apollo-boost';
import { format } from 'date-fns';
import { isSameDay, parseISO } from 'date-fns/esm';
import * as React from 'react';
import { useQuery } from 'react-apollo';
import { INVENTORY_TRANSACTION_REASON_OPTIONS } from './Inventory';

function TimelinePage() {
  const { data: inventoryTransactionsData, refetch: refetchInventoryTransactions, loading: inventoryTransactionsIsLoading } = useQuery(gql`
    query {
      inventoryTransactions {
        reason
        material {
          _id
          name
        }
        location {
          name
        }
        prevLocation {
          name
        }
        quantity
        receivedAt
      }
    }
  `, {
    notifyOnNetworkStatusChange: true,
  });

  return (
    <>
      <Heading as="h1" size="xl" fontWeight="bold" mx={2} my={2}>庫存時間綫</Heading>
      <Box mx={2}>
        <IconButton aria-label="Reload" icon={<RepeatIcon />} onClick={() => { refetchInventoryTransactions()}} isLoading={inventoryTransactionsIsLoading} />
      </Box>
      {inventoryTransactionsData?.inventoryTransactions.map((inventoryTransaction, index) => (
        <Flex mx={2}>
          {(!inventoryTransactionsData?.inventoryTransactions[index - 1]
            || !isSameDay(
              parseISO(inventoryTransactionsData?.inventoryTransactions[index - 1].receivedAt),
              parseISO(inventoryTransaction.receivedAt)
            )) ? (<Box w={50} as="span">{format(parseISO(inventoryTransaction.receivedAt), 'MMM d')}</Box> ) : <Box w={50} />}
          <Box position="relative" m={1} width={150} h={100} maxW="50vw" borderRadius={10} p={3} backgroundColor="orange"  shadow="md">
            <Box color="white" fontWeight="bold">{inventoryTransaction.material.name}</Box>
            {INVENTORY_TRANSACTION_REASON_OPTIONS.find(option => option.value === inventoryTransaction.reason)?.label}
            {inventoryTransaction.quantity}
          </Box>
        </Flex>
      ))}
    </>
  );
}

export default TimelinePage
