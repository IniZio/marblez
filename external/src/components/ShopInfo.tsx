import React from 'react';
import tw, { styled } from 'twin.macro';
import { FiClock, FiMapPin } from 'react-icons/fi'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa'

const ContactLink = styled.a`
  ${tw`flex items-center bg-blue-50 px-3 py-2 w-full flex justify-center text-xs text-blue-600 rounded`}
  ${tw`sm:w-44`}
  > svg {
    ${tw`mr-1`}
  }
`
ContactLink.defaultProps = {
  rel: 'noreferrer',
  target: '_blank'
}

function ShopInfo() {
  return (
    <div tw="my-6">
      <div tw="flex items-center">
        <h3 tw="font-title font-semibold text-lg text-gray-900">Shop Info</h3>
        <FiClock tw="ml-4 mr-1" /> 12PM - 8PM
      </div>
      <div tw="my-4 flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
        <ContactLink href="https://www.google.com.hk/maps/place/Miss+Marble/@22.3026222,114.1701171,17z/data=!3m1!4b1!4m5!3m4!1s0x34040194492f3381:0x6f1560137f0d270a!8m2!3d22.3026222!4d114.1723111">
          <FiMapPin />
          尖沙咀山林道
        </ContactLink>

        <ContactLink href="https://www.instagram.com/missmarble.hk">
          <FaInstagram />
          Instagram
        </ContactLink>

        <ContactLink href="https://wa.me/85255775038">
          <FaWhatsapp />
          WhatsApp
        </ContactLink>
      </div>
    </div>
  );
}

export default ShopInfo
