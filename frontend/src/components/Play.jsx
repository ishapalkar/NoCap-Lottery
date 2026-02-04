import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Zap, Clock, Loader2, CheckCircle, XCircle, Coins, TrendingUp } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { useLiFi, ASSET_POOLS } from '../hooks/useLiFi';
import { parseUnits } from 'viem';

const chains = [
  // Mainnets (fully supported by LI.FI)
  { id: 1, name: 'Ethereum', icon: '⟠', chainId: 1 },
  { id: 42161, name: 'Arbitrum', icon: '🔷', chainId: 42161 },
  { id: 10, name: 'Optimism', icon: '🔴', chainId: 10 },
  { id: 8453, name: 'Base', icon: '🔵', chainId: 8453 },
  { id: 137, name: 'Polygon', icon: '💜', chainId: 137 },
];

// Asset type configurations
const ASSET_TYPES = {
  STABLECOIN: {
    id: 'STABLECOIN',
    name: 'Stablecoins',
    icon: '💵',
    tokens: ['USDC', 'USDT', 'DAI'],
    defaultToken: 'USDC',
    decimals: 6,
    color: '#22c55e',
    description: 'Deposit stable value • No volatility risk',
  },
  ETH: {
    id: 'ETH',
    name: 'Ethereum',
    icon: '⟠',
    tokens: ['ETH', 'WETH'],
    defaultToken: 'ETH',
    decimals: 18,
    color: '#627eea',
    description: 'Keep ETH exposure • No selling',
  },
  BTC: {
    id: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    tokens: ['WBTC'],
    defaultToken: 'WBTC',
    decimals: 8,
    color: '#f7931a',
    description: 'Bitcoin exposure via WBTC',
    disabled: true,
    comingSoon: true,
  },
};

export function Play() {
  const { address, isConnected, chain: connectedChain } = useAccount();
  const { depositFromAnyChain, isLoading, error, txStatus, assetPools } = useLiFi();
  
  const [selectedChain, setSelectedChain] = useState(10); // Default to Optimism mainnet
  const [selectedAssetType, setSelectedAssetType] = useState('STABLECOIN'); // Asset pool selection
  const [selectedToken, setSelectedToken] = useState('USDC'); // Specific token within pool
  const [principalAmount] = useState('100'); // Fixed amount
  const [activeTab, setActiveTab] = useState('deposit');
  const [depositSuccess, setDepositSuccess] = useState(false);

  const handleDeposit = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    const assetType = ASSET_TYPES[selectedAssetType];
    if (assetType.disabled) {
      alert(`${assetType.name} pool coming soon!`);
      return;
    }

    try {
      setDepositSuccess(false);
      
      // Calculate amount based on selected asset's decimals
      const amount = parseUnits('0.01', assetType.decimals).toString(); // Small amount for testing
      
      // Execute same-asset cross-chain deposit via LI.FI
      await depositFromAnyChain(
        selectedChain.toString(),
        selectedToken, // User's selected token (USDC, ETH, WBTC, etc.)
        amount,
        selectedAssetType // Pool type (STABLECOIN, ETH, BTC)
      );
      
      setDepositSuccess(true);
      setTimeout(() => setDepositSuccess(false), 5000);
    } catch (err) {
      console.error('Deposit failed:', err);
      // Error is already handled in useLiFi hook
    }
  };

  const handleWithdraw = () => {
    console.log('Withdraw with prize');
    alert('Withdrawing principal + prize!');
  };

  const handleInstantWithdraw = () => {
    console.log('Instant withdraw (no prize)');
    alert('Instant withdrawal: Principal returned, no prize.');
  };

  const handleSimulateWeek = () => {
    console.log('Simulating 1 week');
    alert('⚡ Fast-forwarding 1 week for hackathon demo...');
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '9rem 1.5rem 4rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3rem',
      paddingBottom: '6rem'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        maxWidth: '900px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          marginBottom: '1.5rem',
          color: 'var(--foreground)',
          fontFamily: 'monospace',
          lineHeight: '1.3'
        }}>
          cross-chain. <span style={{ color: 'var(--primary)' }}>no-loss.</span> prize savings.
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: '1.8',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          Deposit stablecoins from any chain. Your principal goes into an Aave yield vault on Base Sepolia. 
          Only the <span style={{ color: 'var(--primary)', fontWeight: '600' }}>yield is distributed as prizes</span> — 
          your original deposit is always safe and withdrawable.
        </p>
      </div>

      {/* Main Play Interface */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid var(--primary)',
        borderRadius: '12px',
        padding: '2rem',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(0, 255, 157, 0.2)',
          paddingBottom: '1rem'
        }}>
          <button
            onClick={() => setActiveTab('deposit')}
            style={{
              background: activeTab === 'deposit' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'deposit' ? '#000' : 'var(--foreground)',
              border: 'none',
              padding: '0.5rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s ease'
            }}
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            style={{
              background: activeTab === 'withdraw' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'withdraw' ? '#000' : 'var(--foreground)',
              border: 'none',
              padding: '0.5rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'all 0.3s ease'
            }}
          >
            Withdraw
          </button>
        </div>

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Asset Pool Selection */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <Coins size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Select Asset Pool
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem'
              }}>
                {Object.values(ASSET_TYPES).map(assetType => (
                  <button
                    key={assetType.id}
                    onClick={() => {
                      if (!assetType.disabled) {
                        setSelectedAssetType(assetType.id);
                        setSelectedToken(assetType.defaultToken);
                      }
                    }}
                    disabled={assetType.disabled}
                    style={{
                      background: selectedAssetType === assetType.id ? `${assetType.color}33` : 'rgba(255, 255, 255, 0.05)',
                      border: selectedAssetType === assetType.id ? `2px solid ${assetType.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '1rem',
                      borderRadius: '8px',
                      cursor: assetType.disabled ? 'not-allowed' : 'pointer',
                      opacity: assetType.disabled ? 0.5 : 1,
                      transition: 'all 0.3s ease',
                      fontFamily: 'monospace',
                      color: 'var(--foreground)',
                      fontSize: '0.875rem',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{assetType.icon}</div>
                    <div style={{ fontWeight: '600' }}>{assetType.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.25rem' }}>
                      {assetType.description}
                    </div>
                    {assetType.comingSoon && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'var(--primary)',
                        color: '#000',
                        fontSize: '0.5rem',
                        padding: '0.15rem 0.35rem',
                        borderRadius: '3px',
                        fontWeight: '700'
                      }}>
                        SOON
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.6)',
                marginTop: '0.5rem',
                fontFamily: 'monospace'
              }}>
                <TrendingUp size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Each pool preserves your asset exposure • No forced conversions
              </p>
            </div>

            {/* Token Selection within Pool */}
            {!ASSET_TYPES[selectedAssetType].disabled && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  color: 'var(--primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Select Token ({ASSET_TYPES[selectedAssetType].name})
                </label>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {ASSET_TYPES[selectedAssetType].tokens.map(token => (
                    <button
                      key={token}
                      onClick={() => setSelectedToken(token)}
                      style={{
                        background: selectedToken === token ? 'rgba(0, 255, 157, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: selectedToken === token ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontFamily: 'monospace',
                        color: 'var(--foreground)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {token}
                    </button>
                  ))}
                </div>
                <p style={{
                  fontSize: '0.7rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginTop: '0.5rem',
                  fontFamily: 'monospace'
                }}>
                  ✓ Same-asset routing via LI.FI • Normalized to {assetPools[selectedAssetType]?.vaultAsset || 'vault asset'}
                </p>
              </div>
            )}

            {/* Chain Selection */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Select Source Chain
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem'
              }}>
                {chains.map(chain => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedChain(chain.id)}
                    style={{
                      background: selectedChain === chain.id ? 'rgba(0, 255, 157, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: selectedChain === chain.id ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                      padding: '1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      transition: 'all 0.3s ease',
                      fontFamily: 'monospace',
                      color: 'var(--foreground)',
                      fontSize: '1rem'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{chain.icon}</span>
                    <span>{chain.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Principal Amount Display */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Principal Amount (Protected in Aave Vault)
              </label>
              <div style={{
                background: 'rgba(0, 255, 157, 0.05)',
                border: '1px solid var(--primary)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'monospace'
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--foreground)' }}>
                  {principalAmount}
                </span>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>USDC</span>
              </div>
              <p style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: '0.5rem',
                fontFamily: 'monospace'
              }}>
                🔒 Earning yield via Aave ERC-4626 • Principal always withdrawable
              </p>
            </div>

            {/* Deposit Button */}
            <button
              onClick={handleDeposit}
              disabled={isLoading || !isConnected}
              style={{
                background: isLoading ? 'rgba(0, 255, 157, 0.5)' : 'var(--primary)',
                color: '#000',
                border: 'none',
                padding: '1rem',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
                marginTop: '0.5rem',
                opacity: isLoading || !isConnected ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!isLoading && isConnected) {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 0 20px rgba(0, 255, 157, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Processing...
                </>
              ) : !isConnected ? (
                'Connect Wallet to Deposit'
              ) : (
                <>
                  <ArrowDownCircle size={20} />
                  Deposit Now via LI.FI
                </>
              )}
            </button>

            {/* Transaction Status */}
            {txStatus && (
              <div style={{
                background: 'rgba(0, 255, 157, 0.1)',
                border: '1px solid var(--primary)',
                borderRadius: '8px',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                {txStatus}
              </div>
            )}

            {/* Success Message */}
            {depositSuccess && (
              <div style={{
                background: 'rgba(0, 255, 157, 0.2)',
                border: '1px solid var(--primary)',
                borderRadius: '8px',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle size={16} />
                Deposit successful! You're now in the lottery pool 🎉
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.5)',
                borderRadius: '8px',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: '#ff6b6b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <XCircle size={16} />
                {error}
              </div>
            )}

            {/* Connection Info */}
            {isConnected && connectedChain && (
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.5)',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}>
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)} on {connectedChain.name}
              </div>
            )}
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Your Balance */}
            <div style={{
              background: 'rgba(0, 255, 157, 0.1)',
              border: '1px solid var(--primary)',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Your Vault Balance
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                fontFamily: 'monospace',
                color: 'var(--primary)'
              }}>
                125.50 <span style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>USDC</span>
              </div>
              <div style={{
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                color: 'rgba(255, 255, 255, 0.6)',
                marginTop: '0.5rem'
              }}>
                Principal: 100 USDC | Yield Earned: +25.50 USDC
              </div>
              <div style={{
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: 'rgba(0, 255, 157, 0.8)',
                marginTop: '0.75rem',
                padding: '0.5rem',
                background: 'rgba(0, 255, 157, 0.05)',
                borderRadius: '4px'
              }}>
                💰 Yield enters prize pool • Principal guaranteed safe
              </div>
            </div>

            {/* Withdraw Options */}
            <button
              onClick={handleWithdraw}
              style={{
                background: 'var(--primary)',
                color: '#000',
                border: 'none',
                padding: '1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 0 20px rgba(0, 255, 157, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <ArrowUpCircle size={20} />
              Withdraw with Prize
            </button>

            <button
              onClick={handleInstantWithdraw}
              style={{
                background: 'transparent',
                color: 'var(--foreground)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '1rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'var(--primary)';
                e.target.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.color = 'var(--foreground)';
              }}
            >
              <Zap size={20} />
              Instant Withdraw (Principal Only)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
