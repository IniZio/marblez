import React from 'react';
import { GlobalStyles } from 'twin.macro'

import './App.css';
import ExampleButton from './components/ExampleButton';
import Form from './Form';


function App() {
  return (
    <div className="App">
      <GlobalStyles />
      <ExampleButton isPrimary>Hello</ExampleButton>
      <Form />
    </div>
  );
}

export default App;
