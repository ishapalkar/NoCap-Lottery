import { useState, useCallback } from 'react';
import { createConfig, getRoutes, executeRoute } from '@lifi/sdk';
import { useAccount, useWalletClient } from 'wagmi';

// Initialize LI.FI SDK configuration
createConfig({
  integrator: 'NoCap-Lottery', // Your project name for analytics
  apiUrl: 'https://li.quest/v1',
});

// Base Sepolia chain ID (where the vault is deployed)
const TARGET_CHAIN_ID = 84532; // Base Sepolia
const TARGET_TOKEN = 'USDC';

export function useLiFi() {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txStatus, setTxStatus] = useState(null);

  /**
   * Get a quote for cross-chain deposit
   * @param {string} fromChainId - Source chain ID
   * @param {string} fromToken - Source token symbol (ETH, USDC, USDT, etc.)
   * @param {string} amount - Amount in smallest unit (e.g., 100 USDC = "100000000" for 6 decimals)
   */
  const getQuote = useCallback(async (fromChainId, fromToken, amount) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setError(null);
      setIsLoading(true);

      // LI.FI uses different approach - let's use native token (0x0000...) for ETH
      const fromTokenAddress = fromToken === 'ETH' ? '0x0000000000000000000000000000000000000000' : fromToken;
      const toTokenAddress = 'USDC'; // Use symbol for simplicity

      // Request routes from LI.FI
      const routesRequest = {
        fromChainId: parseInt(fromChainId),
        toChainId: TARGET_CHAIN_ID,
        fromTokenAddress: fromTokenAddress,
        toTokenAddress: toTokenAddress,
        fromAmount: amount,
        fromAddress: address,
        toAddress: address, // Same address receives on target chain
        options: {
          slippage: 0.03, // 3% slippage tolerance
          order: 'RECOMMENDED', // Get best route
          allowSwitchChain: true, // Allow chain switching
        },
      };

      console.log('Requesting route with:', routesRequest);
      const result = await getRoutes(routesRequest);
      
      if (!result.routes || result.routes.length === 0) {
        throw new Error('No routes found for this transaction. Chain or token might not be supported by LI.FI.');
      }

      return result.routes[0]; // Return best route
    } catch (err) {
      console.error('Error getting quote:', err);
      const errorMsg = err.message.includes('fromChainId') 
        ? 'This chain is not supported by LI.FI. Try Ethereum Mainnet, Arbitrum, Optimism, or Base.'
        : err.message;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  /**
   * Execute cross-chain deposit using LI.FI
   * @param {object} route - Route object from getQuote
   */
  const executeDeposit = useCallback(async (route) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      setError(null);
      setIsLoading(true);
      setTxStatus('Initiating transaction...');

      // Execute the route
      const execution = await executeRoute(route, {
        updateRouteHook: (updatedRoute) => {
          console.log('Route updated:', updatedRoute);
          
          // Update status based on execution step
          const currentStep = updatedRoute.steps.find(step => 
            step.execution?.status === 'PENDING' || step.execution?.status === 'DONE'
          );
          
          if (currentStep) {
            setTxStatus(`Step ${currentStep.id}: ${currentStep.action} - ${currentStep.execution?.status}`);
          }
        },
        switchChainHook: async (chainId) => {
          setTxStatus(`Switching to chain ${chainId}...`);
          // wagmi handles chain switching automatically
          return walletClient;
        },
        acceptExchangeRateUpdateHook: async (oldRate, newRate) => {
          // Auto-accept rate updates (you can add user confirmation here)
          console.log('Rate updated:', { oldRate, newRate });
          return true;
        },
      });

      setTxStatus('Transaction completed successfully!');
      return execution;
    } catch (err) {
      console.error('Error executing deposit:', err);
      setError(err.message);
      setTxStatus(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address]);

  /**
   * Combined function: get quote and execute deposit
   * @param {string} fromChainId - Source chain ID
   * @param {string} fromToken - Source token symbol
   * @param {string} amount - Amount in smallest unit
   */
  const depositFromAnyChain = useCallback(async (fromChainId, fromToken, amount) => {
    try {
      setError(null);
      setTxStatus('Getting best route...');
      
      // Step 1: Get quote
      const route = await getQuote(fromChainId, fromToken, amount);
      
      console.log('Route found:', {
        fromChain: route.fromChainId,
        toChain: route.toChainId,
        fromToken: route.fromToken.symbol,
        toToken: route.toToken.symbol,
        estimatedTime: route.estimate.executionDuration,
        gasCost: route.estimate.gasCosts,
      });

      // Step 2: Execute deposit
      const result = await executeDeposit(route);
      
      return result;
    } catch (err) {
      console.error('Deposit failed:', err);
      throw err;
    }
  }, [getQuote, executeDeposit]);

  return {
    depositFromAnyChain,
    getQuote,
    executeDeposit,
    isLoading,
    error,
    txStatus,
    isConnected: !!address,
    userAddress: address,
    currentChain: chain,
  };
}
