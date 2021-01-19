import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  ModalProps,
  Stack,
  Box,
  Circle,
  Input,
} from "@chakra-ui/react"
import { IOrder } from '@marblez/graphql';

export interface OrderLabelsModalProps extends ModalProps {
  order: IOrder
}

function OrderLabelsModal({ order, isOpen, onClose }: OrderLabelsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          {order.meta?.labels?.map(label => (
            <Box display="flex" alignItems="center">
              <Circle bgColor={label.color} size="12px" />
              <Input value={label.name} />
            </Box>
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default OrderLabelsModal
