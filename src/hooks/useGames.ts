import { useCallback, useEffect, useState } from 'react';
import { getGames } from 'graphql/getGames';
import { Game } from 'views/Home/types';
// import { getENSDomains } from 'graphql/getENSNames';
import { useWallet } from 'contexts/WalletContext';
import { GameStatus } from 'graphql/autogen/types';
import useInterval from './useInterval';

/**
 * Hook to fetch list of games by status
 * 
 * @param {number} limit - number of games to fetch
 * @param {GameStatus} status - status to filter by
 * @param {boolean} isPlaying - whether logged-in user is already in a game or not
 * @returns {Error | null} error - error if any occurs while fetching. If no error then null
 * @returns {boolean} fetching - whether hook is fetching or not
 * @returns {Array<Game> | null} game - array of games once fetched. Initial value of null
 * @returns {number} refreshCount - number of times data has refreshed off interval 
 */
export const useGames = (
  limit = 1000,
  status: GameStatus,
  isPlaying: boolean
): {
  fetching: boolean;
  error: Error | null;
  games: Array<Game> | null;
  refreshCount: number;
} => {
  const { chainId } = useWallet();
  const [error, setError] = useState<Error | null>(null);
  const [fetching, setFecthing] = useState(true);
  const [games, setGames] = useState<Array<Game> | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!chainId || isPlaying) return;
    try {
      setFecthing(true);
      const res = (await getGames(chainId, limit, status)) as any;
      // const addresses = res.battleshipGames.map((game: any) => game.startedBy);
      // const ensDomains =
      //   (await getENSDomains(limit, addresses))?.accounts.map(
      //     (account: any) => ({
      //       [account.domains[0].owner.id]: account.domains[0].name
      //     })
      //   ) ?? [];
      // const ensObj = Object.assign({}, ...ensDomains);
      const gameArr = res.battleshipGames.map((game: any) => ({
        address: game.startedBy,
        ens: '',
        id: game.id
      }));
      setGames(gameArr);
    } catch (err) {
      setGames(null);
      setError(error as Error);
    } finally {
      setFecthing(false);
    }
  }, [chainId, error, isPlaying, limit, status]);

  const intervalFunction = () => {
    fetchData();
    setRefreshCount((prev) => prev + 1);
  };

  useInterval(intervalFunction, 15000);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return {
    error,
    fetching,
    games,
    refreshCount
  };
};
