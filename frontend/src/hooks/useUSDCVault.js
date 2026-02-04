import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import USDCVault4626ABI from '../abis/USDCVault4626.json';

const VAULT_ADDRESS = import.meta.env.VITE_USDC_VAULT;

export function useUSDCVault() {
  // Read total assets in vault
  const { data: totalAssets, isLoading: isLoadingAssets, refetch: refetchAssets } = useReadContract({
    address: VAULT_ADDRESS,
    abi: USDCVault4626ABI,
    functionName: 'totalAssets',
  });

  // Withdraw function
  const { data: withdrawHash, writeContract: withdraw, isPending: isWithdrawPending, error: withdrawError } = useWriteContract();

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  const handleWithdraw = (amount, receiverAddress, ownerAddress) => {
    if (!amount || !receiverAddress || !ownerAddress) return;
    
    withdraw({
      address: VAULT_ADDRESS,
      abi: USDCVault4626ABI,
      functionName: 'withdraw',
      args: [parseUnits(amount.toString(), 6), receiverAddress, ownerAddress],
    });
  };

  return {
    totalAssets: totalAssets ? Number(totalAssets) / 1e6 : 0,
    isLoadingAssets,
    refetchAssets,
    withdraw: handleWithdraw,
    isWithdrawPending: isWithdrawPending || isWithdrawConfirming,
    isWithdrawSuccess,
    withdrawError,
    withdrawHash,
  };
}
