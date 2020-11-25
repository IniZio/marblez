import { Button, ChakraProvider, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import ApolloClient from "apollo-boost";
import React, { FC } from "react";
import { ApolloProvider } from "react-apollo";
import OrdersCalendar from './components/OrdersCalendar';
import OverviewScreen from './screens/Overview';
import { theme } from './theme';


const App: FC<{ client: ApolloClient<any> }> = ({ client }) => (
  <ApolloProvider client={client}>
    <ChakraProvider theme={theme}>
      <Button data-feedbackok-trigger="l4xncog">Give Feedback</Button>
      <Tabs mt={5} defaultIndex={1} isFitted variant="enclosed-colored">
        <TabList>
            <Tab>Today</Tab>
            <Tab>Calendar</Tab>
        </TabList>

        <TabPanels>
            <TabPanel p={[2]}>
                <OverviewScreen />
            </TabPanel>
            <TabPanel p={[2]}>
                <OrdersCalendar />
            </TabPanel>
        </TabPanels>
        </Tabs>
    </ChakraProvider>
  </ApolloProvider>
);

export default App;
