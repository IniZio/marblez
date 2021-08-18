import cn from "classnames";
import spinnerSrc from "../assets/spinner.svg"
import Icon from "./Icon";

export default function Loader({ className }: { className?: string; }) {
  return (
    <Icon src={spinnerSrc.src} className={cn("max-w-full max-h-full animate-spin focus:outline-none bg-opacity-50", className)} />
  )
}
