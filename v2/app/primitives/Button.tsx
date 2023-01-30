import cn from "clsx"
import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from "react"

export type ButtonVariant = "primary" | "primary-dark" | "secondary"

interface ButtonProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  variant?: ButtonVariant
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant, ...props }, ref) => {
  return (
    <button
      type="button"
      {...props}
      ref={ref}
      className={cn(
        props.className,
        "relative",
        variant === "primary" && "min-h-[42px] rounded-md p-2 font-bold text-white hover:shadow-sm",
        variant === "secondary" &&
          "rounded-md border py-[9px] px-[13px] text-sm shadow-sm transition-colors active:bg-gray-100 disabled:cursor-default disabled:bg-gray-50 disabled:shadow-none"
      )}
    />
  )
})

export default Button
