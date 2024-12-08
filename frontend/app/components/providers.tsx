"use client";
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import Web3 from 'web3';
// Define the type for the context
interface Web3ContextProps {
  web3: Web3 | null;
  account: string | null;
  contract: any | null;
  connectWallet: () => Promise<void>;
}

// Create the Web3 Context
export const Web3Context = createContext<Web3ContextProps>({
  web3: null,
  account: null,
  contract: null,
  connectWallet: async () => { },
});

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any | null>(null);
 const [provider, setProvider] = useState<any | null>(null);

  const connectWallet = async () => {
    const provider: any = window.ethereum;
    if (provider) {
      setProvider(provider);
      const web3Instance = new Web3(provider);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.requestAccounts();
      setAccount(accounts[0]);
    } else {
      console.error('MetaMask is not installed.');
    }
  };

  useEffect(() => {
    const init = async () => {
      if (provider) {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);

        }
      }
    };
    init();
  }, []);

  return (
    <Web3Context.Provider value={{ web3, account, contract, connectWallet }}>
      {children}
    </Web3Context.Provider>
  );
};