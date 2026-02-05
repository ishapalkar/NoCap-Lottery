import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, DollarSign, X, Shield, Sparkles } from 'lucide-react';
import { useYellowNetwork } from '../hooks/useYellowNetwork';

export function YellowDepositModal({ isOpen, onClose, poolAddress, poolName = 'Lottery Pool', onSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionAllowance, setSessionAllowance] = useState('1000');
  
  const { 
    hasActiveSession,
    sessionBalance, 
    connectYellow,
    createSession, 
    instantDeposit,
    isConnecting 
  } = useYellowNetwork();

  const handleCreateSession = async () => {
    if (!sessionAllowance || parseFloat(sessionAllowance) <= 0) {
      alert('Please enter a valid allowance amount');
      return;
    }

    try {
      setLoading(true);
      
      // Connect to Yellow Network
      await connectYellow();
      
      // Create session with allowance
      await createSession(sessionAllowance);
      
      alert(`✅ Yellow Session created with $${sessionAllowance} allowance!\n\nYou can now make instant, gas-free deposits!`);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert(`❌ Failed to create session: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > sessionBalance) {
      alert(`Insufficient session balance. Available: $${sessionBalance.toFixed(2)}`);
      return;
    }

    try {
      setLoading(true);
      
      const tx = await instantDeposit(poolAddress, amount);
      
      onSuccess?.(tx);
      setAmount('');
      
      alert(`✅ Instant deposit of $${amount} successful!\n\nNo gas fees paid! Transaction will settle on-chain when you close your session.`);
    } catch (error) {
      console.error('Deposit failed:', error);
      alert(`❌ Deposit failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={styles.overlay} onClick={onClose}>
        <motion.div
          style={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', duration: 0.4 }}
        >
          {/* Close Button */}
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={24} />
          </button>

          {/* Yellow Badge */}
          <motion.div 
            style={styles.yellowBadge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Zap size={18} style={{ fill: '#1a1a1a' }} />
            <span>POWERED BY YELLOW NETWORK</span>
          </motion.div>

          {/* Title */}
          <h2 style={styles.title}>
            {hasActiveSession ? '⚡ INSTANT DEPOSIT' : '🚀 CREATE YELLOW SESSION'}
          </h2>

          {!hasActiveSession ? (
            // CREATE SESSION VIEW
            <div style={styles.content}>
              {/* Benefits Grid */}
              <div style={styles.benefitsGrid}>
                <div style={styles.benefitCard}>
                  <div style={styles.iconWrapper}>
                    <Zap size={32} color="#ffd23f" />
                  </div>
                  <div style={styles.benefitTitle}>Zero Gas Fees</div>
                  <div style={styles.benefitText}>
                    Make unlimited deposits without paying gas
                  </div>
                </div>
                
                <div style={styles.benefitCard}>
                  <div style={styles.iconWrapper}>
                    <Clock size={32} color="#00d4ff" />
                  </div>
                  <div style={styles.benefitTitle}>Instant Speed</div>
                  <div style={styles.benefitText}>
                    Deposits confirmed in milliseconds
                  </div>
                </div>
                
                <div style={styles.benefitCard}>
                  <div style={styles.iconWrapper}>
                    <Shield size={32} color="#06d6a0" />
                  </div>
                  <div style={styles.benefitTitle}>Secure Sessions</div>
                  <div style={styles.benefitText}>
                    Off-chain speed, on-chain security
                  </div>
                </div>
              </div>

              {/* Allowance Input */}
              <div style={styles.inputSection}>
                <label style={styles.inputLabel}>
                  <Sparkles size={16} />
                  Session Allowance (USDC)
                </label>
                <input
                  type="number"
                  value={sessionAllowance}
                  onChange={(e) => setSessionAllowance(e.target.value)}
                  placeholder="1000"
                  style={styles.input}
                />
                <div style={styles.quickAmounts}>
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setSessionAllowance(amt.toString())}
                      style={styles.quickAmountBtn}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateSession}
                disabled={loading || isConnecting}
                style={styles.createBtn}
                className="btn-bounce"
              >
                {loading || isConnecting ? '⚡ Creating...' : '⚡ Create Yellow Session'}
              </button>

              {/* Info Box */}
              <div style={styles.infoBox}>
                <div style={styles.infoTitle}>💡 How it works:</div>
                <ol style={styles.infoList}>
                  <li>Create a session with your desired allowance</li>
                  <li>Make instant, gas-free deposits to any pool</li>
                  <li>Settle all transactions on-chain when you're done</li>
                </ol>
              </div>
            </div>
          ) : (
            // INSTANT DEPOSIT VIEW
            <div style={styles.content}>
              {/* Balance Card */}
              <motion.div 
                style={styles.balanceCard}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <div style={styles.balanceLabel}>Your Session Balance</div>
                <div style={styles.balanceValue}>
                  ${sessionBalance.toFixed(2)}
                </div>
                <div style={styles.balanceSubtext}>Available for instant deposits</div>
              </motion.div>

              {/* Pool Info */}
              <div style={styles.poolInfo}>
                <div style={styles.poolLabel}>Depositing to:</div>
                <div style={styles.poolName}>{poolName}</div>
              </div>

              {/* Amount Input */}
              <div style={styles.inputSection}>
                <label style={styles.inputLabel}>
                  <DollarSign size={16} />
                  Deposit Amount (USDC)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  style={styles.input}
                  max={sessionBalance}
                />
                <div style={styles.quickAmounts}>
                  {[100, 500, 1000].filter(amt => amt <= sessionBalance).map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      style={styles.quickAmountBtn}
                    >
                      ${amt}
                    </button>
                  ))}
                  <button
                    onClick={() => setAmount(sessionBalance.toString())}
                    style={styles.quickAmountBtn}
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Deposit Button */}
              <button
                onClick={handleInstantDeposit}
                disabled={loading || !amount}
                style={styles.depositBtn}
                className="btn-bounce"
              >
                {loading ? '⚡ Processing...' : '⚡ Instant Deposit'}
              </button>

              {/* Info Box */}
              <div style={styles.infoBox}>
                <Zap size={16} color="#ffd23f" />
                <span>
                  This deposit is instant and gas-free! It will be settled on-chain when you close your session.
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: '#ffffff',
    border: '6px solid #1a1a1a',
    borderRadius: '28px',
    padding: '40px',
    maxWidth: '620px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '16px 16px 0 #1a1a1a',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    background: '#f5f5f5',
    border: '3px solid #1a1a1a',
    borderRadius: '12px',
    width: '44px',
    height: '44px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a1a1a',
    boxShadow: '4px 4px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  yellowBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: '#ffd23f',
    color: '#1a1a1a',
    padding: '10px 20px',
    borderRadius: '25px',
    border: '4px solid #1a1a1a',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '24px',
    boxShadow: '4px 4px 0 #1a1a1a',
  },
  title: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '38px',
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: '32px',
    lineHeight: '1.2',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  benefitCard: {
    textAlign: 'center',
    padding: '24px 16px',
    background: '#f8f8f8',
    border: '4px solid #1a1a1a',
    borderRadius: '16px',
    boxShadow: '4px 4px 0 #1a1a1a',
  },
  iconWrapper: {
    marginBottom: '12px',
  },
  benefitTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '15px',
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  benefitText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    lineHeight: '1.5',
  },
  balanceCard: {
    background: 'linear-gradient(135deg, #ffd23f 0%, #ffed4e 100%)',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
    boxShadow: '8px 8px 0 #1a1a1a',
  },
  balanceLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    opacity: 0.8,
    marginBottom: '12px',
  },
  balanceValue: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '56px',
    fontWeight: '900',
    color: '#1a1a1a',
    lineHeight: '1',
    marginBottom: '8px',
  },
  balanceSubtext: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    opacity: 0.7,
  },
  poolInfo: {
    background: '#f8f8f8',
    border: '3px solid #1a1a1a',
    borderRadius: '12px',
    padding: '16px 20px',
    textAlign: 'center',
  },
  poolLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '4px',
  },
  poolName: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '20px',
    fontWeight: '900',
    color: '#1a1a1a',
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  input: {
    width: '100%',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '28px',
    fontWeight: '700',
    padding: '20px',
    border: '5px solid #1a1a1a',
    borderRadius: '14px',
    outline: 'none',
    boxShadow: '4px 4px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  quickAmounts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  quickAmountBtn: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '15px',
    fontWeight: '700',
    padding: '12px',
    border: '3px solid #1a1a1a',
    borderRadius: '10px',
    background: '#f8f8f8',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '3px 3px 0 #1a1a1a',
  },
  createBtn: {
    width: '100%',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '20px',
    fontWeight: '900',
    color: '#1a1a1a',
    background: '#ffd23f',
    border: '5px solid #1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    boxShadow: '8px 8px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  depositBtn: {
    width: '100%',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '20px',
    fontWeight: '900',
    color: '#ffffff',
    background: '#1a1a1a',
    border: '5px solid #1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s',
  },
  infoBox: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    lineHeight: '1.6',
    padding: '20px',
    background: '#f8f8f8',
    border: '3px solid #e0e0e0',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  infoTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '16px',
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: '12px',
  },
  infoList: {
    margin: 0,
    paddingLeft: '20px',
    lineHeight: '1.8',
  },
};
