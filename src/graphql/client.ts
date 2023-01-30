import { Client, createClient, dedupExchange, fetchExchange } from 'urql';
import { SUBGRAPH_URLS } from 'web3/constants';

type GraphQLClients = {
  [chainId: number]: Client;
};

/**
 * Create urql clients based on provided subgraph URLs
 */
export const CLIENTS: GraphQLClients = Object.entries(SUBGRAPH_URLS).reduce(
  (o, [chainId, url]) => ({
    ...o,
    [chainId]: createClient({
      url,
      exchanges: [dedupExchange, fetchExchange]
    })
  }),
  {}
);
