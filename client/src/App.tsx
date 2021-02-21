import { Button, ChakraProvider, css, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import ApolloClient from "apollo-boost";
import React, { FC } from "react";
import { ApolloProvider } from "react-apollo";
import OrdersCalendar from './components/OrdersCalendar';
import OverviewScreen from './screens/Overview';
import { theme } from './theme';


const App: FC<{ client: ApolloClient<any> }> = ({ client }) => (
  <ApolloProvider client={client}>
    <ChakraProvider theme={theme}>
      <OverviewScreen />
    </ChakraProvider>
  </ApolloProvider>
);

export default App;
