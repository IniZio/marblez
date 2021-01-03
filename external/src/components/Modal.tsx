import React from 'react';
import 'twin.macro'
import { FiX } from 'react-icons/fi';

interface RenderProp<TChildrenProps = {}, TElement = any> {
  (props?: TChildrenProps): React.ReactElement<TElement>;
}

export interface ModalProps {
  isVisible: boolean;
  title: string;
  renderBody: RenderProp;
  onRequestClose: () => any;
}

function Modal({
  title,
  renderBody,
  isVisible,
  onRequestClose,
}: ModalProps) {
  if (!isVisible) {
    return null;
  }
  
  return (
    <div tw="h-screen w-full fixed left-0 top-0 flex justify-center items-center bg-black bg-opacity-50">
      <div tw="my-auto bg-white rounded shadow-lg w-1/3 overflow-hidden">
        <div tw="border-b px-4 py-2 flex justify-between items-center">
          <h3 tw="font-semibold text-lg">{title}</h3>
          <button onClick={onRequestClose}><FiX /></button>
        </div>
        <div tw="p-3 w-auto h-3/4 max-h-screen-3/4 overflow-y-scroll transition-all">
          {renderBody()}
        </div>
        {/* <div tw="flex justify-end items-center w-full border-t p-3">
          <button tw="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white mr-1">Cancel</button>
          <button tw="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white">Oke</button>
        </div> */}
      </div>    
    </div>
  );
}

export default Modal
