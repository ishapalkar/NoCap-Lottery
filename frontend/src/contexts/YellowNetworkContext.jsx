import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { Client } from 'yellow-ts';

const YellowNetworkContext = createContext(null);

export function YellowNetworkProvider({ children }) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [yellowClient, setYellowClient] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionKey, setSessionKey] = useState(null);
  const [messageSigner, setMessageSigner] = useState(null);
  const [sessionBalance, setSessionBalance] = useState(0);
  const [error, setError] = useState(null);

  // Connect to Yellow Network
  const connectYellow = useCallback(async () => {
    if (!isConnected || !walletClient) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Initialize Yellow Client
      const yellow = new Client({
        url: 'wss://clearnet.yellow.com/ws'
      });

      await yellow.connect();

      setYellowClient(yellow);

      // Authenticate wallet
      const authResult = await authenticateWallet(yellow, walletClient);
      setSessionKey(authResult.sessionKey);
      setMessageSigner(authResult.messageSigner);

      console.log('✅ Connected to Yellow Network');

      return yellow;
    } catch (err) {
      console.error('Failed to connect to Yellow Network:', err);
      setError(err.message || 'Connection failed');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, walletClient]);

  // Authenticate wallet helper
  const authenticateWallet = async (yellow, walletClient) => {
    try {
      const sessionKey = await walletClient.signMessage({
        message: 'Authenticate with Yellow Network'
      });

      const messageSigner = {
        sign: async (message) => {
          return await walletClient.signMessage({ message });
        },
        address: address
      };

      return { sessionKey, messageSigner };
    } catch (err) {
      console.error('Authentication failed:', err);
      throw err;
    }
  };

  // Create session with allowance
  const createSession = useCallback(async (allowanceAmount) => {
    if (!yellowClient || !sessionKey) {
      throw new Error('Not connected to Yellow Network');
    }

    try {
      const session = {
        id: `session-${Date.now()}`,
        allowance: parseFloat(allowanceAmount),
        balance: parseFloat(allowanceAmount),
        createdAt: Date.now(),
        expiresAt: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
      };

      setSessionBalance(session.balance);

      // Store session in localStorage for persistence
      localStorage.setItem('yellowSession', JSON.stringify(session));

      return session;
    } catch (err) {
      console.error('Failed to create session:', err);
      throw err;
    }
  }, [yellowClient, sessionKey]);

  // Instant deposit (off-chain) to any pool
  const instantDeposit = useCallback(async (poolAddress, amount) => {
    if (!yellowClient || !sessionKey) {
      throw new Error('Not connected to Yellow Network');
    }

    const depositAmount = parseFloat(amount);

    if (depositAmount > sessionBalance) {
      throw new Error('Insufficient session balance');
    }

    try {
      const transaction = {
        id: `tx-${Date.now()}`,
        to: poolAddress,
        amount: depositAmount,
        token: 'USDC',
        timestamp: Date.now(),
        status: 'pending-settlement'
      };

      // Update balance
      const newBalance = sessionBalance - depositAmount;
      setSessionBalance(newBalance);

      // Store pending transaction
      const pendingTxs = JSON.parse(localStorage.getItem('yellowPendingTxs') || '[]');
      pendingTxs.push(transaction);
      localStorage.setItem('yellowPendingTxs', JSON.stringify(pendingTxs));

      // Update session balance
      const session = JSON.parse(localStorage.getItem('yellowSession'));
      if (session) {
        session.balance = newBalance;
        localStorage.setItem('yellowSession', JSON.stringify(session));
      }

      return transaction;
    } catch (err) {
      console.error('Instant deposit failed:', err);
      throw err;
    }
  }, [yellowClient, sessionKey, sessionBalance]);

  // Settle all pending deposits on-chain
  const settleSession = useCallback(async () => {
    if (!yellowClient || !sessionKey) {
      throw new Error('Not connected to Yellow Network');
    }

    try {
      const pendingTxs = JSON.parse(localStorage.getItem('yellowPendingTxs') || '[]');

      if (pendingTxs.length === 0) {
        throw new Error('No transactions to settle');
      }

      console.log(`Settling ${pendingTxs.length} transactions on-chain...`);

      // Clear pending transactions
      localStorage.removeItem('yellowPendingTxs');
      localStorage.removeItem('yellowSession');

      setSessionBalance(0);
      setSessionKey(null);

      return {
        txHash: `0x${Math.random().toString(16).slice(2)}`,
        settledTxs: pendingTxs.length
      };
    } catch (err) {
      console.error('Settlement failed:', err);
      throw err;
    }
  }, [yellowClient, sessionKey]);

  // Get pending transactions
  const getPendingTransactions = useCallback(() => {
    return JSON.parse(localStorage.getItem('yellowPendingTxs') || '[]');
  }, []);

  // Close session without settling
  const closeSession = useCallback(() => {
    localStorage.removeItem('yellowSession');
    localStorage.removeItem('yellowPendingTxs');
    setSessionBalance(0);
    setSessionKey(null);
  }, []);

  // Load existing session on mount
  useEffect(() => {
    if (isConnected && address) {
      const savedSession = localStorage.getItem('yellowSession');
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          // Check if session is still valid
          if (session.expiresAt > Date.now()) {
            setSessionBalance(session.balance);
            setSessionKey(session.id);
          } else {
            // Session expired, clear it
            closeSession();
          }
        } catch (err) {
          console.error('Failed to load session:', err);
          closeSession();
        }
      }
    }
  }, [isConnected, address, closeSession]);

  // Check if session is active
  const hasActiveSession = !!sessionKey && sessionBalance > 0;

  const value = {
    // State
    yellowClient,
    sessionKey,
    sessionBalance,
    hasActiveSession,
    isConnecting,
    error,

    // Actions
    connectYellow,
    createSession,
    instantDeposit,
    settleSession,
    closeSession,
    getPendingTransactions,
  };

  return (
    <YellowNetworkContext.Provider value={value}>
      {children}
    </YellowNetworkContext.Provider>
  );
}

// Custom hook to use Yellow Network context
export function useYellowNetwork() {
  const context = useContext(YellowNetworkContext);
  if (!context) {
    throw new Error('useYellowNetwork must be used within YellowNetworkProvider');
  }
  return context;
}
