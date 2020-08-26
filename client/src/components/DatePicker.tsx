import React, { useState, useCallback, useEffect } from 'react'
import {format, addDays, isValid, parse, isDate} from 'date-fns'
import { IconButton, Flex, Editable, EditablePreview, EditableInput, Input, BoxProps } from '@chakra-ui/core';
import InputMask from 'react-input-mask';

export interface DatePickerProps extends BoxProps {
  id?: string;
  name?: string;
  value?: Date;
  onChange?: (e: any) => any;
  onValue?: (date: Date) => any;
  withArrows?: boolean;
}

const valueToDate = (value: any) => isDate(value) ? value : new Date(value);

function DatePicker({value = new Date(), onChange, onValue, id, name, withArrows = true, ...props}: DatePickerProps) {
  const [date, setDate] = useState(format(valueToDate(value), 'MM/dd/yyyy'));
  useEffect(() => { setDate(format(valueToDate(value), 'MM/dd/yyyy')); }, [value])
  const _onChange = useCallback((e) => {
    setDate(e.target.value);
    const parsedDate = parse(e.target.value, 'MM/dd/yyyy', new Date());
    if (isValid(parsedDate)) {
      e.target.value = parsedDate;
      if (onChange) {
        onChange(e)
      }
      if (onValue) {
        onValue(parsedDate)
      }
    }
  }, [date, setDate])
  const handleChange = useCallback((e, value) => {
    if (onChange) {
      e.target.value = value;
      onChange(e);
    }
    if (onValue) {
      onValue(value)
    } 
  }, [onChange, onValue])
  
  return (
    <Flex alignItems="center" justifyContent="center" {...props}>
      {withArrows && <IconButton aria-label="yesterday" icon="arrow-back" onClick={(e) => handleChange(e, addDays(value, -1))}  mr={3} />}
      <Flex flex={1} alignItems="center" justifyContent="center">
        <InputMask id={id} name={name} mask="99/99/9999" value={date} onChange={_onChange}>
          {() => <Input textAlign="center" />}
        </InputMask>
      </Flex>
      {withArrows && <IconButton aria-label="tomorrow" icon="arrow-forward" onClick={(e) => handleChange(e, addDays(value, 1))}  ml={3} />}
    </Flex>
  )
}

export default DatePicker
