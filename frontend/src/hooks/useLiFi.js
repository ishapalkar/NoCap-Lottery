import { useState, useCallback } from 'react';
import { createConfig, getRoutes, executeRoute } from '@lifi/sdk';
import { useAccount, useWalletClient } from 'wagmi';

// Initialize LI.FI SDK configuration
createConfig({
  integrator: 'NoCap-Lottery', // Your project name for analytics
  apiUrl: 'https://li.quest/v1',
});

// Target chain where vaults are deployed
const TARGET_CHAIN_ID = 8453; // Base mainnet (change to 84532 for Base Sepolia)

// Asset pool configurations - each pool has its own vault
const ASSET_POOLS = {
  STABLECOIN: {
    name: 'Stablecoin Pool',
    vaultAsset: 'USDC', // Canonical asset for the vault
    acceptedTokens: ['USDC', 'USDT', 'DAI'], // Allowed inputs (normalized to USDC)
    vaultAddress: null, // TODO: Deploy ERC-4626 USDC vault
    description: 'Stablecoins normalized to USDC',
  },
  ETH: {
    name: 'ETH Pool',
    vaultAsset: 'WETH', // Canonical asset for the vault
    acceptedTokens: ['ETH', 'WETH'], // ETH wrapped to WETH
    vaultAddress: null, // TODO: Deploy ERC-4626 WETH vault
    description: 'ETH exposure (no selling)',
  },
  BTC: {
    name: 'BTC Pool',
    vaultAsset: 'WBTC', // Canonical asset for the vault
    acceptedTokens: ['WBTC'], // BTC wrappers only
    vaultAddress: null, // TODO: Deploy ERC-4626 WBTC vault
    description: 'Bitcoin exposure via WBTC',
    disabled: true, // Future feature
  },
};

export function useLiFi() {
  const { address, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txStatus, setTxStatus] = useState(null);

  /**
   * Get a quote for same-asset cross-chain routing
   * @param {string} fromChainId - Source chain ID
   * @param {string} fromToken - Source token symbol (ETH, USDC, USDT, WBTC, etc.)
   * @param {string} amount - Amount in smallest unit
   * @param {string} assetPool - Asset pool type (STABLECOIN, ETH, BTC)
   * @param {number} toChainId - Target chain ID (defaults to Base mainnet since LI.FI doesn't support testnets)
   */
  const getQuote = useCallback(async (fromChainId, fromToken, amount, assetPool = 'STABLECOIN', toChainId = 8453) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      setError(null);
      setIsLoading(true);

      const pool = ASSET_POOLS[assetPool];
      if (!pool) {
        throw new Error(`Invalid asset pool: ${assetPool}`);
      }

      if (pool.disabled) {
        throw new Error(`${pool.name} is not available yet. Coming soon!`);
      }

      // Validate token is accepted in this pool
      if (!pool.acceptedTokens.includes(fromToken)) {
        throw new Error(`${fromToken} is not accepted in ${pool.name}. Accepted: ${pool.acceptedTokens.join(', ')}`);
      }

      // Determine target token (preserve asset or normalize within pool)
      let toToken = pool.vaultAsset;
      
      // For stablecoins: normalize to USDC
      // For ETH: keep as WETH (wrap if needed)
      // For BTC: keep as WBTC
      
      // Native ETH needs special handling
      const fromTokenAddress = fromToken === 'ETH' ? '0x0000000000000000000000000000000000000000' : fromToken;

      // Request SAME-ASSET cross-chain route (or normalized within pool)
      // Note: Using Base mainnet (8453) as default since LI.FI doesn't support testnets
      const routesRequest = {
        fromChainId: parseInt(fromChainId),
        toChainId: parseInt(toChainId),
        fromTokenAddress: fromTokenAddress,
        toTokenAddress: toToken, // Same asset or normalized (USDT→USDC, ETH→WETH)
        fromAmount: amount,
        fromAddress: address,
        toAddress: address, // Same address receives on target chain
        options: {
          slippage: 0.03, // 3% slippage tolerance
          order: 'RECOMMENDED', // Get best route
          allowSwitchChain: true, // Allow chain switching
        },
      };

      console.log(`🔄 Routing ${fromToken} → ${toToken} via ${pool.name}`);
      console.log('Route request:', routesRequest);
      
      const result = await getRoutes(routesRequest);
      
      if (!result.routes || result.routes.length === 0) {
        throw new Error(`No routes found for ${fromToken} → ${toToken}. Chain or token might not be supported by LI.FI on mainnet.`);
      }

      return result.routes[0]; // Return best route
    } catch (err) {
      console.error('Error getting quote:', err);
      const errorMsg = err.message.includes('fromChainId') 
        ? 'This chain is not supported by LI.FI. Use mainnets: Ethereum, Arbitrum, Optimism, Base, Polygon.'
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
   * Combined function: get quote and execute same-asset deposit
   * @param {string} fromChainId - Source chain ID
   * @param {string} fromToken - Source token symbol
   * @param {string} amount - Amount in smallest unit
   * @param {string} assetPool - Asset pool type (STABLECOIN, ETH, BTC)
   */
  const depositFromAnyChain = useCallback(async (fromChainId, fromToken, amount, assetPool = 'STABLECOIN') => {
    try {
      setError(null);
      setTxStatus(`Routing ${fromToken} via ${ASSET_POOLS[assetPool]?.name || 'pool'}...`);
      
      // Step 1: Get quote (same-asset routing)
      const route = await getQuote(fromChainId, fromToken, amount, assetPool);
      
      const pool = ASSET_POOLS[assetPool];
      console.log(`✅ Route found for ${pool.name}:`, {
        fromChain: route.fromChainId,
        toChain: route.toChainId,
        fromToken: route.fromToken.symbol,
        toToken: route.toToken.symbol,
        preservingAsset: route.fromToken.symbol === route.toToken.symbol || pool.acceptedTokens.includes(route.toToken.symbol),
        estimatedTime: route.estimate.executionDuration,
        gasCost: route.estimate.gasCosts,
      });

      // Verify we're preserving asset exposure (no ETH→USDC conversions!)
      if (assetPool === 'ETH' && !['ETH', 'WETH'].includes(route.toToken.symbol)) {
        throw new Error(`❌ Asset preservation violated! Attempted to convert ETH to ${route.toToken.symbol}`);
      }
      if (assetPool === 'STABLECOIN' && !['USDC', 'USDT', 'DAI'].includes(route.toToken.symbol)) {
        throw new Error(`❌ Asset preservation violated! Attempted to convert stablecoin to ${route.toToken.symbol}`);
      }

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
    assetPools: ASSET_POOLS, // Expose pool configurations
  };
}

// Export asset pools for use in components
export { ASSET_POOLS };
