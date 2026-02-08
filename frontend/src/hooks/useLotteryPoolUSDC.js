import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { useEffect, useState } from 'react';
import { parseUnits } from 'viem';
import LotteryPoolUSBCABI from '../abis/LotteryPoolUSDC.json';

const LOTTERY_POOL_ADDRESS = import.meta.env.VITE_USDC_LOTTERY;

/**
 * Lottery Pool Hook - Main hook for lottery pool contract interactions
 * @param {string} userAddress - User wallet address
 */
export function useLotteryPoolUSDC(userAddress) {
  // State for storing winner events
  const [lastWinner, setLastWinner] = useState(null);
  const [winners, setWinners] = useState([]);
  // Read current round
  const { data: currentRound, isLoading: isLoadingRound, refetch: refetchRound } = useReadContract({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    functionName: 'currentRound',
  });

  // Read deposit window status - FIXED: use depositOpen() not depositWindowOpen()
  const { data: depositWindowOpen, isLoading: isLoadingWindow, refetch: refetchWindow } = useReadContract({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    functionName: 'depositOpen',
  });

  // Read draw phase status - FIXED: use drawReady() not drawPhaseActive()
  const { data: drawPhaseActive, isLoading: isLoadingDrawPhase, refetch: refetchDrawPhase } = useReadContract({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    functionName: 'drawReady',
  });

  // Read deposit window end time
  const { data: depositWindowEnd, refetch: refetchDepositWindowEnd } = useReadContract({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    functionName: 'depositWindowEnd',
  });

  // Read prize draw time
  const { data: prizeDrawTime, refetch: refetchPrizeDrawTime } = useReadContract({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    functionName: 'prizeDrawTime',
  });

  // Read min deposit
  const { data: minDeposit } = useReadContract({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    functionName: 'MIN_DEPOSIT',
  });

  // Read user deposits - need both round and address
  const { data: userDeposits, refetch: refetchUserDeposits } = useReadContract({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    functionName: 'userDeposits',
    args: currentRound !== undefined && userAddress ? [currentRound, userAddress] : undefined,
    enabled: !!userAddress && currentRound !== undefined,
  });

  // Read winner for current round
  const { data: roundWinner, refetch: refetchWinner } = useReadContract({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    functionName: 'roundWinners',
    args: currentRound ? [currentRound - 1n] : undefined,
    enabled: !!currentRound && currentRound > 0n,
  });

  // Read prize for current round
  const { data: roundPrize, refetch: refetchPrize } = useReadContract({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    functionName: 'roundPrizes',
    args: currentRound ? [currentRound - 1n] : undefined,
    enabled: !!currentRound && currentRound > 0n,
  });

  // Read bonus pool
  const { data: bonusPool, refetch: refetchBonusPool } = useReadContract({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    functionName: 'bonusPool',
  });

  // Read players for a specific round
  const { data: playersData, refetch: refetchPlayers } = useReadContract({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    functionName: 'getPlayers',
    args: currentRound !== undefined ? [currentRound] : undefined,
    enabled: currentRound !== undefined,
  });

  // Deposit function
  const { data: depositHash, writeContract: deposit, isPending: isDepositPending, error: depositError, reset: resetDeposit } = useWriteContract();

  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Auto-refetch after successful deposit
  useEffect(() => {
    if (isDepositSuccess) {
      // Wait a bit for blockchain to update
      const timer = setTimeout(() => {
        refetchAll();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDepositSuccess]);

  const handleDeposit = (amount) => {
    if (!amount) return;

    deposit({
      address: LOTTERY_POOL_ADDRESS,
      abi: LotteryPoolUSBCABI,
      functionName: 'deposit',
      args: [parseUnits(amount.toString(), 6)],
    });
  };

  // Start draw function
  const { data: drawHash, writeContract: startDraw, isPending: isDrawPending, error: drawError, reset: resetDraw } = useWriteContract();

  const { isLoading: isDrawConfirming, isSuccess: isDrawSuccess } = useWaitForTransactionReceipt({
    hash: drawHash,
  });

  // Auto-refetch after successful draw
  useEffect(() => {
    if (isDrawSuccess) {
      const timer = setTimeout(() => {
        refetchAll();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDrawSuccess]);

  const handleStartDraw = () => {
    startDraw({
      address: LOTTERY_POOL_ADDRESS,
      abi: LotteryPoolUSBCABI,
      functionName: 'startDraw',
    });
  };

  // Withdraw Principal function - amount parameter
  const { data: withdrawHash, writeContract: withdrawFn, isPending: isWithdrawPending, error: withdrawError, reset: resetWithdraw } = useWriteContract();

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  // Auto-refetch after successful withdraw
  useEffect(() => {
    if (isWithdrawSuccess) {
      const timer = setTimeout(() => {
        refetchAll();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isWithdrawSuccess]);

  /**
   * Withdraw principal from the lottery pool
   * @param {string|number} amount - Amount to withdraw in USDC (will be converted to 6 decimals)
   */
  const handleWithdraw = (amount) => {
    if (!amount) return;
    
    withdrawFn({
      address: LOTTERY_POOL_ADDRESS,
      abi: LotteryPoolUSBCABI,
      functionName: 'withdrawPrincipal',
      args: [parseUnits(amount.toString(), 6)],
    });
  };

  const refetchAll = () => {
    refetchRound();
    refetchWindow();
    refetchDrawPhase();
    refetchDepositWindowEnd();
    refetchPrizeDrawTime();
    refetchUserDeposits();
    refetchWinner();
    refetchPrize();
    refetchBonusPool();
    refetchPlayers();
  };

  /**
   * Get players for a specific round
   * @param {number} round - Round number
   * @returns {Array} Array of player addresses
   */
  const getPlayersForRound = (round) => {
    return playersData || [];
  };

  /**
   * Get current round number
   * @returns {number} Current round number
   */
  const getCurrentRound = () => {
    return currentRound ? Number(currentRound) : 0;
  };

  /**
   * Get bonus pool amount in USDC
   * @returns {number} Bonus pool amount
   */
  const getBonusPoolAmount = () => {
    return bonusPool ? Number(bonusPool) / 1e6 : 0;
  };

  /**
   * Get user deposit for current round
   * @param {string} address - User address
   * @returns {number} User deposit amount in USDC
   */
  const getUserDepositAmount = (address) => {
    return userDeposits ? Number(userDeposits) / 1e6 : 0;
  };

  // Watch for WinnerSelected events
  useWatchContractEvent({
    address: LOTTERY_POOL_ADDRESS,
    abi: LotteryPoolUSBCABI,
    eventName: 'WinnerSelected',
    onLogs(logs) {
      logs.forEach((log) => {
        const { user, amount } = log.args;
        const winnerData = {
          winner: user,
          prize: amount ? Number(amount) / 1e6 : 0,
          round: currentRound ? Number(currentRound) : 0,
          timestamp: Date.now(),
        };
        
        setLastWinner(winnerData);
        setWinners(prev => [winnerData, ...prev.slice(0, 9)]); // Keep last 10 winners
      });
    },
  });

  return {
    // Round info
    currentRound: currentRound ? Number(currentRound) : 0,
    getCurrentRound,
    
    // Phase status
    depositWindowOpen: depositWindowOpen || false,
    drawPhaseActive: drawPhaseActive || false,
    depositWindowEnd: depositWindowEnd ? Number(depositWindowEnd) : 0,
    prizeDrawTime: prizeDrawTime ? Number(prizeDrawTime) : 0,
    
    // Pool data
    bonusPool: bonusPool ? Number(bonusPool) / 1e6 : 0,
    getBonusPool: getBonusPoolAmount,
    players: playersData || [],
    getPlayers: getPlayersForRound,
    playersCount: playersData ? playersData.length : 0,
    playersData: playersData || [], // Add this for backward compatibility
    refetchPlayers, // Add refetch function for players
    
    // User data
    minDeposit: minDeposit ? Number(minDeposit) / 1e6 : 100,
    userDeposits: userDeposits ? Number(userDeposits) / 1e6 : 0,
    getUserDeposit: getUserDepositAmount,
    refetchUserDeposits, // Add refetch function for user deposits
    
    // Winner data
    roundWinner,
    roundPrize: roundPrize ? Number(roundPrize) / 1e6 : 0,
    refetchWinner, // Add refetch function for winner
    
    // Deposit functions
    deposit: handleDeposit,
    depositUSDC: handleDeposit, // Alias for clarity
    isDepositPending: isDepositPending || isDepositConfirming,
    isDepositSuccess,
    depositError,
    depositHash,
    resetDeposit,
    
    // Withdraw functions
    withdraw: handleWithdraw,
    withdrawPrincipal: handleWithdraw, // Alias for clarity
    isWithdrawPending: isWithdrawPending || isWithdrawConfirming,
    isWithdrawSuccess,
    withdrawError,
    withdrawHash,
    resetWithdraw,
    
    // Draw functions
    startDraw: handleStartDraw,
    startLotteryDraw: handleStartDraw, // Alias for clarity
    isDrawPending: isDrawPending || isDrawConfirming,
    isDrawSuccess,
    drawError,
    drawHash,
    resetDraw,
    
    // Loading and refetch
    isLoading: isLoadingRound || isLoadingWindow || isLoadingDrawPhase,
    refetchAll,
  };
}
