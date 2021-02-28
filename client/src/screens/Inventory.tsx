import {
  Box, css, Flex, Heading, IconButton, Input, Modal, ModalBody, ModalContent, ModalFooter,


  ModalOverlay, NumberDecrementStepper, NumberIncrementStepper,
  NumberInput, NumberInputField,
  NumberInputStepper,
  useDisclosure,
} from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { gql } from 'apollo-boost';
import * as React from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { Check, Plus } from 'react-feather';
import { useForm, Controller  } from 'react-hook-form'

const INVENTORY_TRANSACTION_REASON_OPTIONS = [
  { label: '總共', value: 'Reconcile' },
  { label: '入貨', value: 'Restock' },
  { label: '消耗', value: 'Spend' }
]

function InventoryPage() {
  const { data: { materials = [] } = {}, refetch: refetchMaterials } = useQuery(gql`
    query {
      materials {
        _id
        name
        quantity
      }
    }
  `);

const [saveMaterial] = useMutation(gql`
  mutation($material: MaterialInput!) {
    saveMaterial(material: $material) {
      _id
      name
    }
  }
`, {
  onCompleted: refetchMaterials
});

const [addInventoryTransaction] = useMutation(gql`
  mutation($inventoryTransaction: InventoryTransactionInput!) {
    addInventoryTransaction(inventoryTransaction: $inventoryTransaction) {
      reason
    }
  }
`)

  const onSubmitInventoryTransaction = React.useCallback(async (values) => {
    await addInventoryTransaction({
      variables: {
        inventoryTransaction: {
          reason: values.reason.value,
          quantity: +values.quantity,
          materialId: values.material._id
        }
      }
    })
    onClose();
    refetchMaterials();
  }, [addInventoryTransaction])
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef<any>()

  const inventoryTransactionForm = useForm();

  const onClickInventory = React.useCallback(({material}) => {
    inventoryTransactionForm.reset({
      reason: INVENTORY_TRANSACTION_REASON_OPTIONS[0],
      material: { ...material, label: material.name },
    });
    onOpen();
  }, [])
  
  return (
    <>
      <Heading as="h1" size="xl" fontWeight="bold" mx={2} my={2}>現在庫存</Heading>
      <Flex flexWrap="wrap" p={1}>
        <IconButton m={1} aria-label="Create inventory" icon={<Plus />}  onClick={onOpen} />
        {materials.map(material => (
          <Box position="relative" onClick={() => onClickInventory({ material })} m={1} width={150} h={100} maxW="50vw" borderRadius={10} p={3} backgroundColor="orange"  shadow="md">
            <Box color="white" fontWeight="bold">{material.name}</Box>
            <Box color="white" fontWeight="bold" fontSize="2xl" position="absolute" bottom={2}>{material.quantity}</Box>
          </Box>
        ))}
      </Flex>
      <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={inventoryTransactionForm.handleSubmit(onSubmitInventoryTransaction)} position={["absolute", 'unset']} bottom={[0]} mb={[0]} >
          <ModalBody lineHeight={10} fontWeight="extrabold" fontSize="xl">
            <Flex flexWrap="wrap">
            <Box w={100}>
            <Controller as={Select} name="reason" control={inventoryTransactionForm.control}
              menuPlacement="auto"
              options={INVENTORY_TRANSACTION_REASON_OPTIONS}
             />
            </Box>
            <NumberInput mx={2} display="inline">
              <NumberInputField name="quantity" ref={inventoryTransactionForm.register()} width={100} />
            </NumberInput>
            件<br />
            <Controller as={CreatableSelect} name="material" control={inventoryTransactionForm.control}
              styles={{
                container: stylse => ({
                  ...stylse,
                  width: 300,
                  marginTop: 5
                })
              }}
              menuPlacement="auto"
              isClearable
              getOptionValue={option => option._id}
              onCreateOption={name => {
                saveMaterial({
                  variables: {
                    material: {
                      name
                    }
                  }
                })
              }}
              options={materials.map(material => ({ ...material, label: material.name }))}
             />
            </Flex>
          </ModalBody>

          <ModalFooter>
            <IconButton colorScheme="blue"  icon={<Check />} type="submit" />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default InventoryPage
