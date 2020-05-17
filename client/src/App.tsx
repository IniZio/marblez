import React, { FC } from "react";
import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-boost";
import { ThemeProvider, CSSReset  } from "@chakra-ui/core";

import Counter from "./Counter/Counter";
import OverviewScreen from './screens/Overview';

const App: FC<{ client: ApolloClient<any> }> = ({ client }) => (
  <ApolloProvider client={client}>
    <ThemeProvider>
      <CSSReset />
      {/* <Counter /> */}
      <OverviewScreen />
    </ThemeProvider>
  </ApolloProvider>
);

export default App;
