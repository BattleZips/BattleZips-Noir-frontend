// import WalletConnectProvider from '@walletconnect/web3-provider';
import { IProviderOptions } from 'web3modal';

/**
 * Web3Modal provider options. Not in use currently but could easily be changed to support Torus connections
 * among other providers
 */
export const providerOptions: IProviderOptions = {
  torus: {
    package: window.Torus,
    options: {
      networkParams: {
        host: 'https://matic-mumbai.chainstacklabs.com',
        chainId: 80001,
        networkName: 'mumbai'
      },
    }
  }
};
