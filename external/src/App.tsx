import React from 'react';
import tw, { GlobalStyles } from 'twin.macro'

import logoBannerSrc from './assets/logo-banner.jpg';

import './App.css';
import ListingsBoard from './components/ListingsBoard';


function App() {
  return (
    <div tw="font-normal">
      <GlobalStyles />
      <div tw="container px-2 sm:px-0 my-5 max-w-screen-md!">
        <h1 tw="font-title font-semibold text-3xl text-gray-900">Miss Marble</h1>
        <div tw="mt-5 my-9 sm:h-80 h-44">
          <img
            src={logoBannerSrc} 
            alt="banner" 
            css={tw`
              w-full h-full
              object-cover align-middle
              border-none shadow rounded

              transition-all transform hover:-translate-y-1 hover:scale-105
            `}
          />
        </div>
        <ListingsBoard />
      </div>
    </div>
  );
}

export default App;
