import gql from 'fake-tag';
import { BattleshipGamesDetails } from './fragments';
import { CLIENTS } from './client';
import {
  GameStatus,
  GetBattleshipGamesQuery,
  GetBattleshipGamesQueryVariables
} from './autogen/types';

const battleshipGamesQuery = gql`
  query GetBattleshipGames($limit: Int!, $status: GameStatus!) {
    battleshipGames(first: $limit, where: { status: $status }) {
      ...BattleshipGamesDetails
    }
  }
  ${BattleshipGamesDetails}
`;

/**
 * Function to connect games graphql fragment to urql client
 * 
 * @param {number} chainId - chain id of the network
 * @param {number} limit - number of games to return
 * @param {GameStatus} status - filter of what specific game status we are looking to return
 * @returns {Promise} - result from subgraph
 */
export const getGames = async (
  chainId: number,
  limit: number,
  status: GameStatus
): Promise<GetBattleshipGamesQuery | null> => {
  const { data, error } = await CLIENTS[chainId]
    .query<GetBattleshipGamesQuery, GetBattleshipGamesQueryVariables>(
      battleshipGamesQuery,
      { limit, status }
    )
    .toPromise();
  if (!data) {
    if (error) {
      throw error;
    }

    return null;
  }
  return data;
};
