import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEns } from '../hooks/useEns';

export function CustomConnectButton() {
  const { address } = useAccount();
  const { displayName, ensAvatar } = useEns(address);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button 
                    onClick={openConnectModal} 
                    type="button"
                    style={styles.connectButton}
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button 
                    onClick={openChainModal} 
                    type="button"
                    style={styles.wrongNetworkButton}
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={openChainModal}
                    style={styles.chainButton}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button 
                    onClick={openAccountModal} 
                    type="button"
                    style={styles.accountButton}
                  >
                    {ensAvatar && (
                      <img 
                        src={ensAvatar} 
                        alt="ENS Avatar" 
                        style={styles.avatar}
                      />
                    )}
                    {displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

const styles = {
  connectButton: {
    background: '#00d4ff',
    color: '#1a1a1a',
    fontWeight: 'bold',
    borderRadius: '12px',
    padding: '10px 20px',
    border: '3px solid var(--ink-black)',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'Fredoka, sans-serif',
    transition: 'all 0.2s ease',
    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
  },
  wrongNetworkButton: {
    background: '#ff6b6b',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: '12px',
    padding: '10px 20px',
    border: '3px solid var(--ink-black)',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'Fredoka, sans-serif',
    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
  },
  chainButton: {
    background: 'white',
    color: '#1a1a1a',
    fontWeight: 'bold',
    borderRadius: '12px',
    padding: '10px 16px',
    border: '3px solid var(--ink-black)',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'Fredoka, sans-serif',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
  },
  accountButton: {
    background: 'white',
    color: '#1a1a1a',
    fontWeight: 'bold',
    borderRadius: '12px',
    padding: '8px 16px',
    border: '3px solid var(--ink-black)',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'Fredoka, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
    minHeight: '44px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '3px solid var(--marker-cyan)',
    objectFit: 'cover',
    flexShrink: 0,
  }
};
