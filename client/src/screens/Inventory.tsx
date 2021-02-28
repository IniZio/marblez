import {
  Box, css, Flex, Heading, IconButton, Input, Modal, ModalBody, ModalContent, ModalFooter,


  ModalOverlay, NumberDecrementStepper, NumberIncrementStepper,
  NumberInput, NumberInputField,
  NumberInputStepper,
  useDisclosure,
} from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';
import { gql } from 'apollo-boost';
import * as React from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { Check, Plus } from 'react-feather';
import { useForm, Controller  } from 'react-hook-form'

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
          reason: 'Reconcile',
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
  
  return (
    <>
      <Heading as="h1" size="xl" fontWeight="bold" mx={2} my={2}>現在庫存</Heading>
      <Flex flexWrap="wrap" p={1}>
        <IconButton m={1} aria-label="Create inventory" icon={<Plus />}  onClick={onOpen} />
        {materials.map(material => (
          <Box m={1} width={150} h={100} maxW="50vw" borderRadius={10} p={3} backgroundColor="orange"  shadow="md">
            <Box color="white" fontWeight="bold">{material.name}</Box>
            <Box color="red">{material.quantity}</Box>
          </Box>
        ))}
      </Flex>
      <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={inventoryTransactionForm.handleSubmit(onSubmitInventoryTransaction)} position={["absolute", 'unset']} bottom={[0]} mb={[0]} >
          <ModalBody lineHeight={10} fontWeight="extrabold" fontSize="xl">
            <span>總共</span>
            <NumberInput mx={2} display="inline">
              <NumberInputField name="quantity" ref={inventoryTransactionForm.register()} width={100} />
            </NumberInput>
            件<br />
            <Controller as={CreatableSelect} name="material" control={inventoryTransactionForm.control}
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
