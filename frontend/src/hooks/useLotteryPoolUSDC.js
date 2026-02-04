import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useEffect } from 'react';
import { parseUnits } from 'viem';
import LotteryPoolUSBCABI from '../abis/LotteryPoolUSDC.json';

const LOTTERY_POOL_ADDRESS = import.meta.env.VITE_USDC_LOTTERY;

export function useLotteryPoolUSDC(userAddress) {
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

  // Withdraw function - NEW
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

  const handleWithdraw = () => {
    withdrawFn({
      address: LOTTERY_POOL_ADDRESS,
      abi: LotteryPoolUSBCABI,
      functionName: 'withdraw',
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
  };

  return {
    currentRound: currentRound ? Number(currentRound) : 0,
    depositWindowOpen: depositWindowOpen || false,
    drawPhaseActive: drawPhaseActive || false,
    depositWindowEnd: depositWindowEnd ? Number(depositWindowEnd) : 0,
    prizeDrawTime: prizeDrawTime ? Number(prizeDrawTime) : 0,
    withdraw: handleWithdraw,
    isWithdrawPending: isWithdrawPending || isWithdrawConfirming,
    isWithdrawSuccess,
    withdrawError,
    withdrawHash,
    resetWithdraw,
    minDeposit: minDeposit ? Number(minDeposit) / 1e6 : 100,
    userDeposits: userDeposits ? Number(userDeposits) / 1e6 : 0,
    roundWinner,
    roundPrize: roundPrize ? Number(roundPrize) / 1e6 : 0,
    isLoading: isLoadingRound || isLoadingWindow || isLoadingDrawPhase,
    deposit: handleDeposit,
    isDepositPending: isDepositPending || isDepositConfirming,
    isDepositSuccess,
    depositError,
    depositHash,
    resetDeposit,
    startDraw: handleStartDraw,
    isDrawPending: isDrawPending || isDrawConfirming,
    isDrawSuccess,
    drawError,
    drawHash,
    resetDraw,
    refetchAll,
  };
}
