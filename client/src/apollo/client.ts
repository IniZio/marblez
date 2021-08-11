import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient, { Resolvers } from "apollo-client";
import { ApolloLink, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { withClientState } from 'apollo-link-state';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { buildTypeDefsAndResolvers } from "type-graphql";


const API_URL = import.meta.env.VITE_APP_API_URL;

export async function createApolloClient() {
  const WS_URL = API_URL!.replace('http', 'ws');

  const wsLink = new WebSocketLink({
    uri: WS_URL,
    options: {
      reconnect: true
    }
  });
  const httpLink = new HttpLink({
    uri: API_URL,
  });
  const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query) as unknown as any;
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
  )

  const cache = new InMemoryCache();

  const client = new ApolloClient({
    link: ApolloLink.from([
      link,
    ]),
    cache: new InMemoryCache({
      // addTypename: false
    }),
    connectToDevTools: true,
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  });

  return client;
}
