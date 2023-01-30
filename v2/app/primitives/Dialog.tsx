import { Dialog as BaseDialog, Transition } from "@headlessui/react"
import { Fragment, ReactNode, useRef } from "react"

export interface DialogProps {
  open?: boolean
  onClose?: () => any
  className?: string
  children?: ReactNode
}

export default function Dialog(props: DialogProps) {
  const defaultInitialFocusRef = useRef(null)

  return (
    <Transition appear show={props.open} as={Fragment}>
      <BaseDialog
        initialFocus={defaultInitialFocusRef}
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={() => props.onClose?.()}
      >
        <div ref={defaultInitialFocusRef} className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <BaseDialog.Overlay className="fixed inset-0 bg-gray-700/30" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="my-8 inline-block w-full max-w-md rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              {props.children}
            </div>
          </Transition.Child>
        </div>
      </BaseDialog>
    </Transition>
  )
}
