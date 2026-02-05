import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import { config } from './config/wagmi'
import { sepolia } from 'wagmi/chains'
import './index.css'
import './rainbowkit-custom.css'
import '@rainbow-me/rainbowkit/styles.css'
import App from './App.jsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: '#00d4ff',
            accentColorForeground: '#1a1a1a',
            borderRadius: 'large',
          })}
          initialChain={sepolia}
          modalSize="compact"
          avatar={{
            // Use Sepolia for ENS resolution in RainbowKit modals
            chainId: sepolia.id,
          }}
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
