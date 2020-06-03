import React, { useState, useCallback, useEffect } from 'react'
import {format, addDays, isValid, parse} from 'date-fns'
import { IconButton, Flex, Editable, EditablePreview, EditableInput, Input } from '@chakra-ui/core';
import InputMask from 'react-input-mask';

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => any;
}

function DatePicker({value = new Date(), onChange, ...props}: DatePickerProps) {
  const [date, setDate] = useState(format(value, 'MM/dd/yyyy'));
  useEffect(() => { setDate(format(value, 'MM/dd/yyyy')); }, [value])
  const _onChange = useCallback((e) => {
    setDate(e.target.value);
    const parsedDate = parse(e.target.value, 'MM/dd/yyyy', new Date());
    if (isValid(parsedDate)) {
      onChange(parsedDate);
    }
  }, [date, setDate])
  
  return (
    <Flex p={3} alignItems="center" justifyContent="center" {...props}>
      <IconButton aria-label="yesterday" icon="arrow-back" onClick={() => onChange(addDays(value, -1))} />
      <Flex flex={1} alignItems="center" justifyContent="center">
        <InputMask mask="99/99/9999" value={date} onChange={_onChange}>
          {() => <Input textAlign="center" mx={3} />}
        </InputMask>
      </Flex>
      <IconButton aria-label="tomorrow" icon="arrow-forward" onClick={() => onChange(addDays(value, 1))} />
    </Flex>
  )
}

export default DatePicker
