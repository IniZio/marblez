import {
  Box, Flex, Heading, IconButton, Modal, ModalBody, ModalContent, ModalFooter,


  ModalOverlay, NumberDecrementStepper, NumberIncrementStepper,
  NumberInput, NumberInputField,
  NumberInputStepper,

  useDisclosure
} from '@chakra-ui/react';
import * as React from 'react';
import { Check, Plus } from 'react-feather';

const inventories = [
  {
    name: '巧克力蛋糕',
    quality: 10,
  }
]

function InventoryPage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef<any>()
  
  return (
    <>
      <Heading as="h1" size="xl" fontWeight="bold" mx={2} my={2}>現在庫存</Heading>
      <Flex flexWrap="wrap" p={1}>
        <IconButton m={1} aria-label="Create inventory" icon={<Plus />}  onClick={onOpen} />
        {inventories.map(inventory => (
          <Box m={1} maxW={150} borderRadius={10} p={3} backgroundColor="orange"  shadow="md">
            <Box color="white" fontWeight="bold">{inventory.name}</Box>
            <Box color="red">{inventory.quality}</Box>
          </Box>
        ))}
      </Flex>
      <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent position="absolute" bottom={0} mb={0} >
          <ModalBody lineHeight={10}>
            <span>總共</span>
            <NumberInput mx={2} display="inline">
              <NumberInputField width={100} />
            </NumberInput>
             件
            巧克力蛋糕 
          </ModalBody>

          <ModalFooter>
            <IconButton colorScheme="blue" onClick={onClose} icon={<Check />} />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default InventoryPage
