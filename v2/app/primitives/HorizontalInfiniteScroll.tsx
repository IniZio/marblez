import { cloneElement, useCallback, useEffect, useRef } from "react"

function HorizontalInfiniteScroll({ mainWrapper = <></>, children, loader, dipatchScroll }) {
  const mainWrapperRef = useRef()

  const triggerScroll = useCallback(
    (mainWrapperRef) => {
      if (mainWrapperRef.current && Object.keys(mainWrapperRef.current).length > 0) {
        const element = mainWrapperRef.current
        element.onscroll = (e) => {
          if (e.target.scrollTop + e.target.offsetHeight === e.target.scrollHeight)
            dipatchScroll({ scrollHeight: e.target.scrollHeight })
        }
      }
    },
    [dipatchScroll]
  )

  useEffect(() => {
    triggerScroll(mainWrapperRef)
  }, [triggerScroll])

  return cloneElement(mainWrapper, { ref: mainWrapperRef }, [children, loader])
}

HorizontalInfiniteScroll.defaultProps = {
  mainWrapper: null, //Should be html tag or React element
  loader: null, //It should be a React element.
  dipatchScroll: (data) => {
    console.log("dipatchScroll", data)
  }, //Used to handle scroll callback event in the parent.
}

export default HorizontalInfiniteScroll
