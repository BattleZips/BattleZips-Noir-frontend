import { SUPPORTED_NETWORKS } from './constants';
/**
 * Function to check if chainId is a supported network
 * 
 * @param {number} chainId - chainId of selected network
 * @returns {boolean} - whether chain is supported or not
 */
export const isSupportedChain = (chainId: number): boolean =>
  SUPPORTED_NETWORKS.includes(chainId);
