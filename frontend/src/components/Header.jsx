import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { CustomConnectButton } from './CustomConnectButton';
import { useYellowNetwork } from '../contexts/YellowNetworkContext';
import { Trophy, Zap, DollarSign, X } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected } = useAccount();
  const { 
    hasActiveSession, 
    isConnecting, 
    connectYellow, 
    createSession,
    sessionBalance,
    closeSession 
  } = useYellowNetwork();

  const [showYellowModal, setShowYellowModal] = useState(false);
  const [allowanceAmount, setAllowanceAmount] = useState('100');

  const isActive = (path) => location.pathname === path;

  const handleYellowConnect = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      await connectYellow();
      // Yellow client connected, now create session
      setShowYellowModal(true);
    } catch (error) {
      console.error('Yellow connection failed:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      await createSession(allowanceAmount);
      setShowYellowModal(false);
      alert(`✅ Yellow Session created with $${allowanceAmount} allowance!`);
    } catch (error) {
      console.error('Session creation failed:', error);
      alert(`❌ Failed to create session: ${error.message}`);
    }
  };

  const handleCloseSession = () => {
    if (window.confirm('Close Yellow Session? Any unsettled transactions will be lost.')) {
      closeSession();
    }
  };

  return (
    <header style={styles.headerWrapper}>
      <div style={styles.container}>
        <div style={styles.logo} onClick={() => navigate('/')} className="cursor-pointer">
          <div style={styles.logoIcon}>
            <Trophy style={{width: '24px', height: '24px', color: 'var(--ink-black)'}} />
          </div>
          <span style={styles.logoText}>
            NoCap<span style={{color: 'var(--marker-pink)'}}>!</span>
          </span>
        </div>

        <nav style={styles.nav}>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              ...styles.navLink,
              ...(isActive('/') && styles.navLinkActive)
            }}
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/pools')} 
            style={{ 
              ...styles.navLink,
              ...((isActive('/pools') || location.pathname.startsWith('/pools/')) && styles.navLinkActive)
            }}
          >
            Play Game
          </button>
          <button 
            onClick={() => navigate('/winners')} 
            style={{ 
              ...styles.navLink,
              ...(isActive('/winners') && styles.navLinkActive)
            }}
          >
            Winners
          </button>
          <button 
            onClick={() => navigate('/profile')} 
            style={{ 
              ...styles.navLink,
              ...(isActive('/profile') && styles.navLinkActive)
            }}
          >
            Profile
          </button>
          <button 
            onClick={() => navigate('/demo')} 
            style={{ 
              ...styles.navLink,
              ...(isActive('/demo') && styles.navLinkActive)
            }}
          >
            Demo
          </button>
        </nav>

        <div style={styles.walletSection}>
          {/* Yellow Wallet Button */}
          {!hasActiveSession ? (
            <button
              onClick={handleYellowConnect}
              disabled={!isConnected || isConnecting}
              style={{
                ...styles.yellowButton,
                ...((!isConnected || isConnecting) && styles.yellowButtonDisabled)
              }}
            >
              <Zap size={16} style={{ fill: 'currentColor' }} />
              <span>{isConnecting ? 'Connecting...' : 'Yellow Wallet'}</span>
            </button>
          ) : (
            <div style={styles.yellowActiveButton} onClick={handleCloseSession}>
              <Zap size={16} style={{ fill: '#1a1a1a' }} />
              <div style={styles.yellowActiveContent}>
                <span style={styles.yellowActiveLabel}>Yellow Active</span>
                <span style={styles.yellowActiveBalance}>${sessionBalance.toFixed(2)}</span>
              </div>
              <X size={14} />
            </div>
          )}
          
          {/* Regular Wallet */}
          <CustomConnectButton />
        </div>
      </div>

      {/* Yellow Session Creation Modal */}
      {showYellowModal && (
        <div style={styles.modalOverlay} onClick={() => setShowYellowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                <Zap size={24} style={{ fill: '#ffd23f' }} />
                <h3>Create Yellow Session</h3>
              </div>
              <button onClick={() => setShowYellowModal(false)} style={styles.modalClose}>
                <X size={24} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <p style={styles.modalDescription}>
                Create a Yellow Network session to make instant off-chain deposits with minimal gas fees. 
                Your deposits will be batched and settled on-chain later.
              </p>
              
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>
                  <DollarSign size={16} />
                  Session Allowance (USDC)
                </label>
                <input
                  type="number"
                  value={allowanceAmount}
                  onChange={(e) => setAllowanceAmount(e.target.value)}
                  placeholder="100"
                  style={styles.input}
                  min="1"
                />
                <small style={styles.inputHint}>
                  This is the maximum amount you can spend in this session
                </small>
              </div>
              
              <button onClick={handleCreateSession} style={styles.modalButton}>
                <Zap size={18} style={{ fill: '#1a1a1a' }} />
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const styles = {
  headerWrapper: {
    position: 'sticky',
    top: '1rem',
    zIndex: 50,
    width: '100%',
    padding: '0 1rem',
    marginBottom: '2rem',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(150px, auto) 1fr minmax(300px, auto)',
    height: '5rem',
    alignItems: 'center',
    gap: '1rem',
    padding: '0 1.5rem',
    background: 'white',
    borderWidth: '3px',
    borderStyle: 'solid',
    borderColor: 'var(--ink-black)',
    borderRadius: '15px 5px 15px 5px / 5px 15px 5px 15px',
    boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    justifySelf: 'start',
  },
  logoIcon: {
    width: '2.5rem',
    height: '2.5rem',
    background: '#ffd23f',
    borderWidth: '3px',
    borderStyle: 'solid',
    borderColor: 'var(--ink-black)',
    borderRadius: '15px 5px 15px 5px / 5px 15px 5px 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(-3deg)',
    transition: 'transform 0.2s ease',
  },
  logoText: {
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 900,
    fontSize: '1.5rem',
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    width: '100%',
  },
  navLink: {
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    transition: 'all 0.2s ease',
    color: 'var(--ink-black)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Fredoka, sans-serif',
    position: 'relative',
    whiteSpace: 'nowrap',
  },
  navLinkActive: {
    color: 'var(--marker-pink)',
    background: 'linear-gradient(120deg, rgba(255,255,0,0.3) 0%, rgba(255,255,0,0.6) 100%)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  walletSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  yellowButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: '#ffd23f',
    color: '#1a1a1a',
    border: '3px solid #1a1a1a',
    borderRadius: '8px',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 700,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
  },
  yellowButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  yellowActiveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: '#ffd23f',
    color: '#1a1a1a',
    border: '3px solid #1a1a1a',
    borderRadius: '8px',
    fontFamily: 'Fredoka, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)',
  },
  yellowActiveContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.125rem',
  },
  yellowActiveLabel: {
    fontSize: '0.625rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  yellowActiveBalance: {
    fontSize: '0.875rem',
    fontWeight: 800,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    background: 'white',
    border: '3px solid #1a1a1a',
    borderRadius: '15px 5px 15px 5px / 5px 15px 5px 15px',
    boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)',
    maxWidth: '500px',
    width: '100%',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem',
    borderBottom: '3px solid #1a1a1a',
  },
  modalTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 800,
  },
  modalClose: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a1a1a',
    transition: 'transform 0.2s ease',
  },
  modalBody: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  modalDescription: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    color: '#1a1a1a',
    opacity: 0.8,
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  inputLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '3px solid #1a1a1a',
    borderRadius: '8px',
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1rem',
    fontWeight: 600,
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  inputHint: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '0.75rem',
    opacity: 0.6,
  },
  modalButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.5rem',
    background: '#ffd23f',
    color: '#1a1a1a',
    border: '3px solid #1a1a1a',
    borderRadius: '8px',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 800,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
    textTransform: 'uppercase',
  },
};
