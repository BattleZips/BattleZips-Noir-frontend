import { providers } from 'ethers';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import Web3Modal from 'web3modal';
import { providerOptions } from 'web3/providerOptions';
import {
  // BICONOMY_CHAINS,
  DEFAULT_NETWORK,
  ENS_CHAINS,
  NETWORK_NAMES
} from 'web3/constants';
import { switchChainOnMetaMask } from 'web3/metamask';

export type WalletContextType = {
  provider: providers.Web3Provider | null | undefined; // ethers provider
  biconomy: any; // biconomy object
  chainId: number | null | undefined; // network id
  address: string | null | undefined; // signer public key
  ensName: string | null | undefined; // public key ENS resolution
  connectWallet: () => Promise<void>; // connect an eip1193 object
  disconnect: () => void; // disconnect an eip1193 object
  isConnecting: boolean;
  isConnected: boolean;
  isMetamask: boolean;
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions,
  theme: 'dark'
});

/**
 * Context containing relevant state related to ethereum wallet
 */
export const WalletContext = createContext<WalletContextType>({
  provider: null,
  biconomy: null,
  chainId: null,
  address: null,
  ensName: null,
  connectWallet: async () => {
    return;
  },
  disconnect: () => undefined,
  isConnecting: true,
  isConnected: false,
  isMetamask: false
});

type WalletStateType = {
  provider?: providers.Web3Provider | null;
  biconomy?: any | null;
  chainId?: number | null;
  address?: string | null;
  authToken?: string | null;
  ensName?: string | null;
};

/**
 * Determines whether provider is MetaMask provider or not
 *
 * @param {providers.Web3Provider} provider
 * @returns {bool} - true or false
 */
const isMetamaskProvider = (
  provider: providers.Web3Provider | null | undefined
) => provider?.connection?.url === 'metamask';

/**
 * Context provider to deliver wallet related state across the app
 */
export const WalletProvider: React.FC = ({ children }) => {
  const [{ provider, biconomy, chainId, address, ensName }, setWalletState] =
    useState<WalletStateType>({});

  /**
   * Memoized value based on whether address, chainId, and provider have been set
   */
  const isConnected: boolean = useMemo(
    () => !!provider && !!address && !!chainId,
    [provider, address, chainId]
  );

  const [isConnecting, setConnecting] = useState<boolean>(true); // Whether wallet is connecting or not
  // Memoized value to determine whether particular provider is memoized
  const isMetamask = useMemo(() => isMetamaskProvider(provider), [provider]);

  /**
   * Disconnect wallet by clearing cache and setting wallet state to empty
   */
  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setWalletState({});
  }, []);

  /**
   * Utilize metamask listeners to disconnect from app on account or chain change
   */
  const addMetaMaskListeners = useCallback(
    (modalProvider: any) => {
      modalProvider.on('accountsChanged', () => {
        disconnect();
      });
      // If chain change is not goerli then disconnect
      modalProvider.on('chainChanged', (chainId: string) => {
        if (Number(chainId) !== DEFAULT_NETWORK) {
          disconnect();
        }
      });
    },
    [disconnect]
  );

  /**
   * Handle instance of incorrect network
   */
  const handleIncorrectNetwork = useCallback(async (_provider: any) => {
    // If provider is metamask then force chain change via extension
    const success =
      _provider.isMetaMask && (await switchChainOnMetaMask(DEFAULT_NETWORK));
    // Throw error message provider is not metamask or network switch is not successful
    if (!success) {
      const errorMsg = `Network not supported, please switch to ${NETWORK_NAMES[DEFAULT_NETWORK]}`;
      // toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  /**
   * Set the EIP-1193 Compliant web3 Provider with Signer in context
   *
   * @param _provider - the eip1193 object being set
   */
  const setWalletProvider = useCallback(async (_provider) => {
    let ethersProvider = new providers.Web3Provider(_provider);
    await ethersProvider.ready;
    const providerNetwork = await ethersProvider.getNetwork();
    let network = Number(providerNetwork.chainId);
    // const biconomy = BICONOMY_CHAINS.includes(network)
    //   ? new window.Biconomy(_provider, {
    //       strictMode: true,
    //       apiKey: process.env.REACT_APP_BICONOMY_API,
    //       debug: true
    //     })
    //   : null;
    const biconomy = null;
    // if (biconomy) {
    //   try {
    //     new Promise((resolve, reject) => {
    //       biconomy
    //         .onEvent(biconomy.READY, () => resolve(0))
    //         .onEvent(biconomy.ERROR, (err: Error) => reject(err));
    //     });
    //   } catch (err) {
    //     // TODO: handle switch to non-metatransactions gracefully
    //     throw new Error('Biconomy failed to connect');
    //   }
    // }
    const supportsENS = ENS_CHAINS.includes(network);
    const signerAddress = await ethersProvider.getSigner().getAddress();
    let signerName;
    try {
      signerName = supportsENS
        ? await ethersProvider.lookupAddress(signerAddress)
        : '';
    } catch (err) {
      console.log('Signer name error: ', err);
    }
    setWalletState({
      provider: ethersProvider,
      biconomy,
      chainId: network,
      address: signerAddress.toLowerCase(),
      ensName: signerName
    });
  }, []);

  /**
   * Connect to ethereum provider via web modal
   */
  const connectWallet = useCallback(async () => {
    try {
      setConnecting(true);
      const modalProvider = await (async () => {
        // Grab provider from web3 modal
        let chosenProvider = await web3Modal.connect();
        // If chain id is not default network then attempt to switch
        if (Number(chosenProvider.chainId) !== DEFAULT_NETWORK) {
          await handleIncorrectNetwork(chosenProvider);
        }
        await setWalletProvider(chosenProvider);
        return chosenProvider;
      })();
      // Add metamask listeenrs if provider is metamask
      if (modalProvider.isMetaMask) addMetaMaskListeners(modalProvider);
    } catch (web3Error) {
      // eslint-disable-next-line no-console
      console.error(web3Error);
      disconnect();
    } finally {
      // When successfully connected to network set connecting to false
      setConnecting(false);
    }
  }, [
    addMetaMaskListeners,
    handleIncorrectNetwork,
    setWalletProvider,
    disconnect
  ]);

  /**
   * useEffect for restoring connection in case of cached provider
   */
  useEffect(() => {
    const load = async () => {
      // If cached provider exists then restore connection
      if (web3Modal.cachedProvider) {
        await connectWallet();
        // If cached provider is not present revert to pre-connection state
      } else {
        setConnecting(false);
      }
    };
    load();
  }, [connectWallet]);

  return (
    <WalletContext.Provider
      value={{
        provider,
        biconomy,
        address,
        chainId,
        ensName,
        connectWallet,
        isConnected,
        isConnecting,
        disconnect,
        isMetamask
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => useContext(WalletContext);
