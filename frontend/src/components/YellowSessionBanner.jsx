import { motion } from 'framer-motion';
import { Zap, Clock, DollarSign, X, CheckCircle } from 'lucide-react';
import { useYellowNetwork } from '../contexts/YellowNetworkContext';
import { useState } from 'react';

export function YellowSessionBanner() {
  const { 
    hasActiveSession, 
    sessionBalance, 
    settleSession, 
    closeSession,
    getPendingTransactions 
  } = useYellowNetwork();
  
  const [isSettling, setIsSettling] = useState(false);

  if (!hasActiveSession) return null;

  const pendingTxs = getPendingTransactions();

  const handleSettle = async () => {
    if (pendingTxs.length === 0) {
      alert('No transactions to settle yet. Make some deposits first!');
      return;
    }

    const confirmed = window.confirm(
      `Settle ${pendingTxs.length} transaction(s) on-chain? This will finalize all your deposits.`
    );
    
    if (!confirmed) return;

    try {
      setIsSettling(true);
      const result = await settleSession();
      alert(`✅ Successfully settled ${result.settledTxs} transactions!\nTx: ${result.txHash}`);
    } catch (error) {
      console.error('Settlement failed:', error);
      alert(`❌ Settlement failed: ${error.message}`);
    } finally {
      setIsSettling(false);
    }
  };

  const handleClose = () => {
    if (pendingTxs.length > 0) {
      const confirmed = window.confirm(
        `⚠️ You have ${pendingTxs.length} unsettled transaction(s). Closing without settling will lose these deposits. Are you sure?`
      );
      if (!confirmed) return;
    }
    closeSession();
  };

  return (
    <motion.div
      style={styles.bannerWrapper}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
    >
      <div style={styles.banner}>
        <div style={styles.leftSection}>
          {/* Yellow Badge */}
          <div style={styles.yellowBadge}>
            <Zap size={16} style={{ fill: '#1a1a1a' }} />
            <span>YELLOW SESSION ACTIVE</span>
          </div>
          
          {/* Stats */}
          <div style={styles.stats}>
            <div style={styles.stat}>
              <DollarSign size={20} color="#06d6a0" />
              <div>
                <div style={styles.statLabel}>Session Balance</div>
                <div style={styles.statValue}>${sessionBalance.toFixed(2)}</div>
              </div>
            </div>
            
            <div style={styles.stat}>
              <CheckCircle size={20} color="#00d4ff" />
              <div>
                <div style={styles.statLabel}>Pending Txs</div>
                <div style={styles.statValue}>{pendingTxs.length}</div>
              </div>
            </div>
            
            <div style={styles.stat}>
              <Clock size={20} color="#ffd23f" />
              <div>
                <div style={styles.statLabel}>Status</div>
                <div style={styles.statValue}>⚡ Instant Mode</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button 
            onClick={handleSettle} 
            style={styles.settleBtn}
            disabled={isSettling || pendingTxs.length === 0}
            className="btn-bounce"
          >
            {isSettling ? '⏳ Settling...' : `📦 Settle (${pendingTxs.length})`}
          </button>
          
          <button 
            onClick={handleClose} 
            style={styles.closeBtn}
            title="Close session"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const styles = {
  bannerWrapper: {
    position: 'fixed',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 999,
    width: 'calc(100% - 40px)',
    maxWidth: '1400px',
    padding: '0 20px',
  },
  banner: {
    background: 'linear-gradient(135deg, #ffd23f 0%, #ffed4e 100%)',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '20px 30px',
    boxShadow: '8px 8px 0 #1a1a1a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },
  yellowBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    background: '#ffffff',
    padding: '10px 18px',
    borderRadius: '25px',
    border: '3px solid #1a1a1a',
    boxShadow: '4px 4px 0 #1a1a1a',
  },
  stats: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '12px',
    fontWeight: '600',
    color: '#1a1a1a',
    opacity: 0.7,
  },
  statValue: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '18px',
    fontWeight: '900',
    color: '#1a1a1a',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  settleBtn: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '16px',
    fontWeight: '900',
    color: '#ffffff',
    background: '#1a1a1a',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    padding: '12px 24px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s',
  },
  closeBtn: {
    background: '#ffffff',
    border: '3px solid #1a1a1a',
    borderRadius: '10px',
    width: '42px',
    height: '42px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a1a1a',
    boxShadow: '3px 3px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
};
