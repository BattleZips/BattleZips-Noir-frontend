import gql from 'fake-tag';
import { BattleshipGameDetails } from './fragments';
import { CLIENTS } from './client';

const battleshipGameQuery = gql`
  query GetBattleshipGame($id: ID!) {
    battleshipGame(id: $id) {
      ...BattleshipGameDetails
    }
  }
  ${BattleshipGameDetails}
`;

/**
 * Function to connect single game graphql fragment to urql client
 * 
 * @param {number} chainId - chain id of the network
 * @param {string} id - id of the game being queried
 * @returns {Promise} - result from subgraph
 */
export const getGame = async (
  chainId: number,
  id: String
): Promise<any | null> => {
  const { data, error } = await CLIENTS[chainId]
    .query<any, any>(battleshipGameQuery, { id })
    .toPromise();
  if (!data) {
    if (error) {
      throw error;
    }

    return null;
  }
  return data;
};
