import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import IERC20ABI from '../abis/IERC20.json';

const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;

export function useUSDCApproval(spenderAddress) {
  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = (amount) => {
    if (!spenderAddress) return;
    
    writeContract({
      address: USDC_ADDRESS,
      abi: IERC20ABI,
      functionName: 'approve',
      args: [spenderAddress, parseUnits(amount.toString(), 6)],
    });
  };

  return {
    approve,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

export function useUSDCBalance(address) {
  const { data: balance, isLoading, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: IERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  return {
    balance: balance ? Number(balance) / 1e6 : 0,
    isLoading,
    refetch,
  };
}

export function useUSDCAllowance(ownerAddress, spenderAddress) {
  const { data: allowance, isLoading, refetch } = useReadContract({
    address: USDC_ADDRESS,
    abi: IERC20ABI,
    functionName: 'allowance',
    args: ownerAddress && spenderAddress ? [ownerAddress, spenderAddress] : undefined,
    enabled: !!(ownerAddress && spenderAddress),
  });

  return {
    allowance: allowance ? Number(allowance) / 1e6 : 0,
    isLoading,
    refetch,
  };
}
