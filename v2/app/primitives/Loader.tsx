import cn from "classnames"
import spinnerSrc from "../assets/spinner.svg"
import Icon from "./Icon"

export default function Loader({ className }: { className?: string }) {
  return (
    <Icon
      src={spinnerSrc.src}
      className={cn(
        "max-w-full max-h-full bg-opacity-50 animate-spin focus:outline-none",
        className
      )}
    />
  )
}
