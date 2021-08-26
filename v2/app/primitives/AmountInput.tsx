import { MinusIcon, PlusIcon } from "@heroicons/react/outline"
import { forwardRef, useImperativeHandle, useRef } from "react"

export interface NumberInputProps {
  value: number
  // eslint-disable-next-line no-unused-vars
  onChange: (value: number) => any
}

const AmountInput = forwardRef<HTMLInputElement, NumberInputProps>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current!)

  return (
    <div className="flex">
      <MinusIcon className="w-5 cursor-pointer" onClick={() => props.onChange(props.value - 1)} />
      <input
        {...props}
        onChange={(event) => props.onChange(+event.target.value)}
        className="w-10 text-center"
        ref={inputRef}
      />
      <PlusIcon className="w-5 cursor-pointer" onClick={() => props.onChange(props.value + 1)} />
    </div>
  )
})

export default AmountInput
