import React from 'react'
import {format, addDays} from 'date-fns'
import { IconButton, Flex } from '@chakra-ui/core';

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => any;
}

function DatePicker({value = new Date(), onChange, ...props}: DatePickerProps) {
  return (
    <Flex p={3} alignItems="center" justifyContent="center" {...props}>
      <IconButton aria-label="yesterday" icon="arrow-back" onClick={() => onChange(addDays(value, -1))} />
      <Flex flex={1} alignItems="center" justifyContent="center">{format(value, 'dd/MM/yyyy')}</Flex>
      <IconButton aria-label="tomorrow" icon="arrow-forward" onClick={() => onChange(addDays(value, 1))} />
    </Flex>
  )
}

export default DatePicker
