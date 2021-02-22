import { Button, ChakraProvider, css, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import ApolloClient from "apollo-boost";
import React, { FC } from "react";
import { ApolloProvider } from "react-apollo";
import {
  BrowserRouter as Router,
} from "react-router-dom";
import OrdersCalendar from './components/OrdersCalendar';
import OverviewScreen from './screens/Overview';
import { theme } from './theme';


const App: FC<{ client: ApolloClient<any> }> = ({ client }) => (
  <Router>
    <ApolloProvider client={client}>
      <ChakraProvider theme={theme}>
        <OverviewScreen />
      </ChakraProvider>
    </ApolloProvider>
  </Router>
);

export default App;
