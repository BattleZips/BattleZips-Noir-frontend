import { useCallback, useEffect, useState } from 'react';
import { getGame } from 'graphql/getGame';
import { useWallet } from 'contexts/WalletContext';
import useInterval from './useInterval';

/**
 * Hook to fetch single game state
 * 
 * @param {string} id - game id
 * @returns {Error | null} error - error if any occurs while fetching. If no error then null
 * @returns {boolean} fetching - whether hook is fetching or not
 * @returns {any | null} game - game once fetched. Initial value of null
 * @returns {number} refreshCount - number of times data has refreshed off interval 
 * 
 */
export const useGame = (
  id: string
): {
  fetching: boolean;
  error: Error | null;
  game: any | null;
  refreshCount: number;
} => {
  const { chainId } = useWallet();
  const [error, setError] = useState<Error | null>(null);
  const [fetching, setFecthing] = useState(true);
  const [game, setGame] = useState<any | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!chainId) return;
    try {
      setFecthing(true);
      const game = await getGame(chainId, id);
      setGame(game.battleshipGame);
    } catch (err) {
      setGame(null);
      setError(error as Error);
    } finally {
      setFecthing(false);
    }
  }, [chainId, error, id]);

  const intervalFunction = () => {
    fetchData();
    setRefreshCount((prev) => prev + 1);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useInterval(intervalFunction, 15000);

  return { error, fetching, game, refreshCount };
};
