import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from "react"
import cn from "classnames"

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
        variant === "primary" && "p-2 min-h-[42px] font-bold text-white rounded-md hover:shadow-sm",
        variant === "secondary" &&
          "py-[9px] px-[13px] text-sm active:bg-gray-100 disabled:bg-gray-50 rounded-md border shadow-sm disabled:shadow-none transition-colors disabled:cursor-default"
      )}
    />
  )
})

export default Button
