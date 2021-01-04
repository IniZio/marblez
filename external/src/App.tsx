import React from 'react';
import tw, { GlobalStyles } from 'twin.macro'

import logoBannerSrc from './assets/logo-banner.jpg';

import './App.css';
import ListingsBoard from './components/ListingsBoard';
import ShopInfo from './components/ShopInfo';


function App() {
  return (
    <div tw="font-normal">
      <GlobalStyles />
      <div tw="container px-2 sm:px-0 py-12 pt-20 max-w-screen-md!">
        <a tw="font-title font-semibold text-4xl text-gray-700" href="/">Miss Marble.</a>
        <div tw="my-5 sm:h-80 h-44">
          <img
            src={logoBannerSrc} 
            alt="banner" 
            css={tw`
              my-8
              w-full h-full
              object-cover align-middle
              border-none shadow rounded
            `}
          />
        </div>
        <ShopInfo />
        <ListingsBoard />
      </div>
    </div>
  );
}

export default App;
