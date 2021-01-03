import React from 'react';
import 'twin.macro'

import Services from "tripetto-services";
import { useEffect, useState } from 'react';
import { IDefinition } from 'tripetto-runner-foundation';
import ListingCard from './ListingCard';
import { IListing } from '../models/Listing';

const { definition } = Services.init({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicmg1amlTWmNpMi9RVVFwc0JVODQ1TXlRcHpaOHpldUdpS0J5QTREaE9QRT0iLCJkZWZpbml0aW9uIjoiaDFETTNmM0JnMHN6YWlIL1RmYk5kTHAxZ3gxZUZDTnZ5L29TaTRKdW1iRT0iLCJ0eXBlIjoiY29sbGVjdCJ9.YCKVhrT5_v5RbPeMdGBgZZe6hXsfyFMpUAEjlcmm3fc" });

function ListingsBoard() {
  const [formDefinition, setFormDefinition] = useState<IDefinition>();
  useEffect(() => {
    definition.then(setFormDefinition);
  }, [])
  
  if (!formDefinition) {
    return null;
  }

  return (
    <div tw="grid grid-cols-2 grid-rows-3 gap-4">
      {(formDefinition.clusters[0]?.nodes?.[0]?.block?.choices as IListing[])?.map(listing => (
        <ListingCard 
          listing={listing}
        />
      ))}
    </div>
  )
}

export default ListingsBoard;
