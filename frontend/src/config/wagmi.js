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

export const config = getDefaultConfig({
  appName: 'NoCap Lottery',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
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
});
