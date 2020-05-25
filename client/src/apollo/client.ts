import ApolloClient, { Resolver, Resolvers } from "apollo-client";
import { buildTypeDefsAndResolvers } from "type-graphql";
import { WebSocketLink } from 'apollo-link-ws';
import { withClientState } from 'apollo-link-state';
import { HttpLink } from 'apollo-link-http';
import { split, ApolloLink } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';

import CounterResolver from "../Counter/counter.resolver";
import CounterType from "../Counter/counter.type";

export default async function createApolloClient() {
  const { API_URL = 'http://localhost:4000/graphql' } = process.env;
  
  const { typeDefs, resolvers } = await buildTypeDefsAndResolvers({
    resolvers: [CounterResolver],
    skipCheck: true, // allow for schema without queries
  });

  const WS_URL = API_URL.replace('http', 'ws');

  console.log('=== websocket', WS_URL);

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
      console.log(kind, operation)
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
  )

  const cache = new InMemoryCache();

  const stateLink = withClientState({
    cache,
    resolvers,
    defaults: {
      counter: {
        __typename: CounterType.name,
        value: 0,
      },
    },
  })

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    typeDefs,
    resolvers: resolvers as Resolvers,
    defaultOptions: {
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    },
  });

  return client;
}
