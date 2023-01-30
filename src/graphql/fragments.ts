import gql from 'fake-tag';

/**
 * Fragment to fetch game state of a specific game on the BattleZips-Noir contract
 */
export const BattleshipGameDetails = gql`
  fragment BattleshipGameDetails on BattleshipGame {
    id
    joinedBy
    startedBy
    status
    shots(first: 200, orderBy: turn, orderDirection: asc) {
      hit
      x
      y
      turn
    }
    winner
  }
`;

/**
 * Fragment used to grab details of all games that exist on the BattleZips-Noir contract
 */
export const BattleshipGamesDetails = gql`
  fragment BattleshipGamesDetails on BattleshipGame {
    startedBy
    id
    status
    totalShots
    winner
  }
`;

/**
 * Fragment to grab ENS details for a provided address to render in game list. Queries
 * mainnet names even though BattleZips-Noir contract exist on goerli
 */
export const ENSDetails = gql`
  fragment ENSDetails on Account {
    domains(first: 1) {
      labelhash
      labelName
      name
      resolver {
        texts
      }
      owner {
        id
      }
    }
  }
`;
