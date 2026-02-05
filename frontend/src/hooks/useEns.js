import { useEnsName, useEnsAvatar } from 'wagmi';
import { normalize } from 'viem/ens';
import { mainnet } from 'wagmi/chains';

/**
 * Custom hook to fetch ENS name and avatar for an address
 * Qualifies for ENS bounty - uses wagmi ENS hooks with proper normalization
 */
export function useEns(address) {
  // Fetch ENS name (e.g., "vitalik.eth" for 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)
  const { data: ensName, isLoading: isLoadingName } = useEnsName({
    address,
    chainId: mainnet.id,
    enabled: !!address,
  });

  // Fetch ENS avatar (NFT or uploaded image)
  const { data: ensAvatar, isLoading: isLoadingAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: mainnet.id,
    enabled: !!ensName,
  });

  // Format address for display (0x1234...5678)
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Get display name (ENS name or formatted address)
  const displayName = ensName || formatAddress(address);

  return {
    ensName,
    ensAvatar,
    displayName,
    hasEnsName: !!ensName,
    isLoading: isLoadingName || isLoadingAvatar,
    formattedAddress: formatAddress(address),
  };
}

/**
 * Hook to check if current user has ENS name
 */
export function useUserEns(address) {
  const ens = useEns(address);
  
  return {
    ...ens,
    hasEns: !!ens.ensName,
    // Bonus: ENS holders get special badge in UI
    isPremiumUser: !!ens.ensName,
  };
}
