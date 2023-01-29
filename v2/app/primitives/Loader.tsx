import cn from "clsx"
import spinnerSrc from "../assets/spinner.svg"
import Icon from "./Icon"

export default function Loader({ className }: { className?: string }) {
  return (
    <Icon
      src={spinnerSrc.src}
      className={cn("max-h-full max-w-full animate-spin bg-black/50 focus:outline-none", className)}
    />
  )
}
