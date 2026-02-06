import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, DollarSign, ArrowLeftRight, Info } from 'lucide-react';
import { useChainId } from 'wagmi';

export function DepositOptionsModal({ 
  isOpen, 
  onClose, 
  onDirectDeposit, 
  onYellowDeposit, 
  onBridgeDeposit,
  poolName = 'Pool',
  targetChainId = 11155111, // Default to Sepolia
  supportedAssets = ['USDC']
}) {
  const currentChainId = useChainId();
  const isDifferentChain = currentChainId !== targetChainId;

  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (option) => {
    if (option === 'direct') {
      onDirectDeposit();
      onClose();
    } else if (option === 'yellow') {
      onYellowDeposit();
      onClose();
    } else if (option === 'bridge') {
      onBridgeDeposit();
      onClose();
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

          {/* Header */}
          <div style={styles.header}>
            <h2 style={styles.title}>Choose Deposit Method</h2>
            <p style={styles.subtitle}>Select the best option for your {poolName} deposit</p>
          </div>

          {/* Option Cards */}
          <div style={styles.optionsContainer}>
            {/* Direct Deposit Option */}
            <motion.div
              style={styles.optionCard}
              className="card-squishy"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOptionClick('direct')}
            >
              <div style={styles.optionIcon}>
                <DollarSign size={32} strokeWidth={3} />
              </div>
              <h3 style={styles.optionTitle}>Direct Deposit</h3>
              <p style={styles.optionDescription}>
                Standard on-chain transaction
              </p>
              <div style={styles.optionFeatures}>
                <div style={styles.feature}>✓ Immediate confirmation</div>
                <div style={styles.feature}>✓ Single transaction</div>
                <div style={styles.featureWarn}>⚠ Standard gas fees</div>
              </div>
              <div style={styles.optionBadge}>Best for 1 deposit</div>
            </motion.div>

            {/* Yellow Network Option */}
            <motion.div
              style={{...styles.optionCard, ...styles.optionCardHighlight}}
              className="card-squishy"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOptionClick('yellow')}
            >
              <div style={{...styles.optionIcon, ...styles.optionIconYellow}}>
                <Zap size={32} strokeWidth={3} style={{ fill: '#1a1a1a' }} />
              </div>
              <div style={styles.recommendedBadge}>⚡ RECOMMENDED</div>
              <h3 style={styles.optionTitle}>Yellow Network</h3>
              <p style={styles.optionDescription}>
                Gas-free instant deposits via Layer 2
              </p>
              <div style={styles.optionFeatures}>
                <div style={styles.featureGood}>✓ ZERO gas per deposit</div>
                <div style={styles.featureGood}>✓ Instant confirmation</div>
                <div style={styles.featureGood}>✓ Multiple deposits</div>
                <div style={styles.feature}>• Settle once at end</div>
              </div>
              <div style={styles.optionBadgeYellow}>
                💡 Best for multiple transactions
              </div>
              <div style={styles.infoBox}>
                <Info size={14} />
                <span style={styles.infoText}>
                  Create session once, deposit multiple times with no gas fees
                </span>
              </div>
            </motion.div>

            {/* Bridge Option (if on different chain) */}
            {isDifferentChain && (
              <motion.div
                style={styles.optionCard}
                className="card-squishy"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOptionClick('bridge')}
              >
                <div style={styles.optionIcon}>
                  <ArrowLeftRight size={32} strokeWidth={3} />
                </div>
                <h3 style={styles.optionTitle}>Bridge from Another Chain</h3>
                <p style={styles.optionDescription}>
                  Cross-chain deposit via LI.FI
                </p>
                <div style={styles.optionFeatures}>
                  <div style={styles.feature}>✓ Any chain supported</div>
                  <div style={styles.feature}>✓ Automatic bridging</div>
                  <div style={styles.featureWarn}>⚠ Bridge fees apply</div>
                </div>
                <div style={styles.optionBadge}>Best for cross-chain</div>
              </motion.div>
            )}
          </div>

          {/* Bottom Note */}
          <div style={styles.bottomNote}>
            <Info size={16} />
            <span>
              {isDifferentChain 
                ? 'You are on a different network. Consider bridging or switching networks first.'
                : 'All deposits are secure and non-custodial. Your funds remain under your control.'}
            </span>
          </div>
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
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modal: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '24px',
    boxShadow: '16px 16px 0 #1a1a1a',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    padding: '40px',
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    transition: 'all 0.2s',
    color: '#1a1a1a',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '36px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '0 0 12px',
    textTransform: 'uppercase',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    margin: '0',
  },
  optionsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  optionCard: {
    background: '#ffffff',
    border: '4px solid #1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '8px 8px 0 #1a1a1a',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  optionCardHighlight: {
    background: 'linear-gradient(135deg, #fff9e6 0%, #fffef0 100%)',
    border: '4px solid #ffd23f',
    boxShadow: '8px 8px 0 #ffd23f',
  },
  optionIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#f0f0f0',
    border: '3px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a1a1a',
    margin: '0 auto',
  },
  optionIconYellow: {
    background: '#ffd23f',
  },
  recommendedBadge: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#ffd23f',
    border: '3px solid #1a1a1a',
    borderRadius: '20px',
    padding: '6px 16px',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '12px',
    fontWeight: '900',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  optionTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '20px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '0',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  optionDescription: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    margin: '0',
    textAlign: 'center',
  },
  optionFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
  feature: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  featureGood: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '13px',
    fontWeight: '700',
    color: '#00b300',
  },
  featureWarn: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ff6b00',
  },
  optionBadge: {
    background: '#e0e0e0',
    border: '2px solid #1a1a1a',
    borderRadius: '12px',
    padding: '8px 12px',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 'auto',
  },
  optionBadgeYellow: {
    background: '#ffd23f',
    border: '2px solid #1a1a1a',
    borderRadius: '12px',
    padding: '8px 12px',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginTop: 'auto',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    background: '#fff9e6',
    border: '2px solid #ffd23f',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '8px',
  },
  infoText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '12px',
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: '1.4',
  },
  bottomNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#f5f5f5',
    border: '3px solid #1a1a1a',
    borderRadius: '12px',
    padding: '16px',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
};

export default DepositOptionsModal;
