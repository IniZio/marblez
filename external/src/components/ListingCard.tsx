import React, { useCallback, useState } from 'react';
import 'twin.macro';
import Form from '../Form';
import { IListing } from '../models/Listing';
import Modal from './Modal';

export interface ListingCardProps {
  listing: IListing;
}

function ListingCard({
  listing,
}: ListingCardProps) {
  const [listingFormIsVisible, setListingFormIsVisible] = useState(false);
  const onClickAddToCart = useCallback(
    () => { setListingFormIsVisible(true) },
    [setListingFormIsVisible],
  );
  
  return (
    <>
      <div 
        tw="flex max-w-md bg-white shadow-sm rounded-md overflow-hidden bg-gray-50"
      >
        <div tw="w-1/3 bg-cover" style={{ backgroundImage: `url('${listing.image}')` }} />
        <div tw="w-2/3 p-4 flex flex-col">
          <h1 tw="text-gray-900 font-bold text-lg leading-5">{listing.name}</h1>
          {/* <p tw="mt-2 text-gray-600 text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit In odit exercitationem
            fuga id nam quia</p> */}
          <div tw="flex items-center mt-2">
          </div>
          <div tw="flex-1" />
          <div tw="flex items-center justify-between mt-3">
            {/* <h1 tw="text-gray-700 font-bold text-xl">$220</h1> */}
            <div tw="flex-1" />
            <button 
              tw="px-3 py-2 bg-gray-800 text-white text-xs font-bold uppercase rounded"
              onClick={onClickAddToCart}
            >Order</button>
          </div>
        </div>
      </div>
      <Modal 
        isVisible={listingFormIsVisible}
        title={listing.name}
        renderBody={() => <Form cake={listing.name} onSubmit={() => setListingFormIsVisible(false)} />}
        onRequestClose={() => setListingFormIsVisible(false)}
      />
    </>
  );
}

export default ListingCard
