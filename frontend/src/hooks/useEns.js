import { useEnsName, useEnsAvatar, useChainId } from 'wagmi';
import { normalize } from 'viem/ens';
import { sepolia } from 'wagmi/chains';

/**
 * Custom hook to fetch ENS name and avatar for an address
 * ENS configured for Sepolia testnet
 */
export function useEns(address) {
  const chainId = useChainId();
  const isSepolia = chainId === sepolia.id;
  
  // Enable ENS lookups on Sepolia testnet
  const { data: ensName, isLoading: isLoadingName } = useEnsName({
    address,
    chainId: sepolia.id,
    enabled: !!address && isSepolia, // Query ENS on Sepolia
  });

  // Fetch ENS avatar (NFT or uploaded image)
  const { data: ensAvatar, isLoading: isLoadingAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: sepolia.id,
    enabled: !!ensName && isSepolia, // Query ENS on Sepolia
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
