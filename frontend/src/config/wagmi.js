import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  arbitrum,
  optimism,
  base,
  baseSepolia,
  sepolia,
  arbitrumSepolia,
  optimismSepolia
} from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'NoCap Lottery',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [
    // Mainnets
    mainnet,
    arbitrum,
    optimism,
    base,
    // Testnets for development
    baseSepolia, // Primary testnet - vault deployed here
    sepolia, // Ethereum Sepolia
    arbitrumSepolia, // Arbitrum Sepolia
    optimismSepolia, // Optimism Sepolia - you have ETH here!
  ],
  ssr: false, // If using Next.js, set to true
  transports: {
    [mainnet.id]: http('https://eth.llamarpc.com'),
    [arbitrum.id]: http('https://arbitrum.llamarpc.com'),
    [optimism.id]: http('https://optimism.llamarpc.com'),
    [base.id]: http('https://base.llamarpc.com'),
    [baseSepolia.id]: http('https://base-sepolia.blockpi.network/v1/rpc/public'),
    [sepolia.id]: http('https://ethereum-sepolia.publicnode.com'),
    [arbitrumSepolia.id]: http('https://arbitrum-sepolia.blockpi.network/v1/rpc/public'),
    [optimismSepolia.id]: http('https://optimism-sepolia.blockpi.network/v1/rpc/public'),
  },
});
