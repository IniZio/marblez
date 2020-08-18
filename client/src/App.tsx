import React, { FC } from "react";
import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-boost";
import { ThemeProvider, CSSReset, Button  } from "@chakra-ui/core";

import { theme } from './theme'
import Counter from "./Counter/Counter";
import OverviewScreen from './screens/Overview';

const App: FC<{ client: ApolloClient<any> }> = ({ client }) => (
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <CSSReset />
      <Button data-feedbackok-trigger="l4xncog">Give Feedback</Button>
      <OverviewScreen />
    </ThemeProvider>
  </ApolloProvider>
);

export default App;
