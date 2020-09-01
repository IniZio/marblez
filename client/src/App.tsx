import React, { FC } from "react";
import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-boost";
import { ThemeProvider, CSSReset, Button, Tabs  } from "@chakra-ui/core";
import { TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/core";

import { theme } from './theme'
import Counter from "./Counter/Counter";
import OverviewScreen from './screens/Overview';
import OrdersCalendar from './components/OrdersCalendar';

const App: FC<{ client: ApolloClient<any> }> = ({ client }) => (
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <CSSReset />
      <Button data-feedbackok-trigger="l4xncog">Give Feedback</Button>
      <Tabs defaultIndex={1}>
        <TabList>
            <Tab>Today</Tab>
            <Tab>Calendar</Tab>
        </TabList>

        <TabPanels>
            <TabPanel>
                <OverviewScreen />
            </TabPanel>
            <TabPanel>
                <OrdersCalendar />
            </TabPanel>
        </TabPanels>
        </Tabs>
    </ThemeProvider>
  </ApolloProvider>
);

export default App;
