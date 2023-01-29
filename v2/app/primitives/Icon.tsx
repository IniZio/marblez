import cn from "clsx"
// eslint-disable-next-line no-use-before-define
import React, { memo } from "react"

interface IconProps {
  src: string
  size?: string
  className?: string
}

export const Icon: React.FC<IconProps> = ({ src, size, className }) => {
  return (
    <div
      className={cn("align-middle", className)}
      style={{
        maskImage: `url('${src}')`,
        WebkitMaskImage: `url('${src}')`,
        maskSize: "100%",
        WebkitMaskSize: "100%",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        width: size,
        height: size,
      }}
    />
  )
}

export default memo(Icon)
