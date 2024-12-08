import { http, createConfig } from 'wagmi'
import { base, optimism } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'
import { getDefaultWallets, getDefaultConfig } from "@rainbow-me/rainbowkit"

import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets"
import {
  arbitrum,
  arbitrumSepolia,
  localhost,
  mainnet,
  sepolia,
} from "wagmi/chains"

const { wallets } = getDefaultWallets()

const projectId = '61ce83245bfd18e6728a33c718b5946c'

export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: projectId,
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: [
    mainnet,
    arbitrumSepolia, arbitrum, localhost,sepolia
  ],
  ssr: true,
})

export const TRADE_TO_ATTEST=5000
export const CHART_REFRESH_INTERVAL=2000