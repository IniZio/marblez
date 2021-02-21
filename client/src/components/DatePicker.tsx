import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { Flex, FlexProps, IconButton, Input } from '@chakra-ui/react';
import { addDays, format, isDate, isValid, parse } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import InputMask from 'react-input-mask';

export interface DatePickerProps {
  name?: string;
  value?: Date;
  onChange?: (e: any) => any;
  onValue?: (date: Date) => any;
  withArrows?: boolean;
}

const valueToDate = (value: any) => isDate(value) ? value : new Date(value);

function DatePicker({value = new Date(), onChange, onValue, id, name, withArrows = true, ...props}: DatePickerProps & FlexProps) {
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
    <Flex position="relative" alignItems="center" justifyContent="center" {...props}>
      {withArrows && <IconButton borderRightRadius={0} aria-label="yesterday" icon={<ArrowBackIcon />} onClick={(e) => { e.stopPropagation(); handleChange(e, addDays(value, -1)) }} />}
      <Flex flex={1} alignItems="center" justifyContent="center">
        <InputMask id={id} name={name} mask="99/99/9999" value={date} onChange={_onChange}>
          {() => <Input borderRadius={0} textAlign="center" />}
        </InputMask>
      </Flex>
      {withArrows && <IconButton borderLeftRadius={0} aria-label="tomorrow" icon={<ArrowForwardIcon />} onClick={(e) => handleChange(e, addDays(value, 1))}  />}
    </Flex>
  )
}

export default DatePicker
