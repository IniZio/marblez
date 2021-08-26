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
        className="overflow-y-auto fixed inset-0 z-10"
        onClose={() => props.onClose?.()}
      >
        <div ref={defaultInitialFocusRef} className="px-4 min-h-screen text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <BaseDialog.Overlay className="fixed inset-0 bg-gray-700 bg-opacity-30" />
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
            <div className="inline-block p-6 my-8 w-full max-w-md text-left align-middle bg-white rounded-2xl shadow-xl transition-all transform">
              {props.children}
            </div>
          </Transition.Child>
        </div>
      </BaseDialog>
    </Transition>
  )
}
