import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeftRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useLiFi } from '../hooks/useLiFi';

export function LiFiBridgeModal({ 
  isOpen, 
  onClose, 
  poolName = 'Pool',
  poolAddress,
  targetAsset = 'USDC',
  targetChainId = 8453, // Base mainnet (LI.FI doesn't support testnets)
  onSuccess
}) {
  const { address, chain } = useAccount();
  const currentChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { getQuote, executeDeposit, isLoading, error, txStatus } = useLiFi();

  const [amount, setAmount] = useState('');
  const [selectedChain, setSelectedChain] = useState(null);
  const [quote, setQuote] = useState(null);
  const [step, setStep] = useState('input'); // input, quote, executing, success

  // Chain name mapping
  const getChainName = (chainId) => {
    const chains = {
      1: 'Ethereum',
      10: 'Optimism', 
      42161: 'Arbitrum',
      8453: 'Base',
      137: 'Polygon',
      56: 'BNB Chain',
      43114: 'Avalanche'
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  // Supported chains for LI.FI
  const supportedChains = [
    { id: 1, name: 'Ethereum', symbol: 'ETH' },
    { id: 10, name: 'Optimism', symbol: 'OP' },
    { id: 42161, name: 'Arbitrum', symbol: 'ARB' },
    { id: 8453, name: 'Base', symbol: 'BASE' },
    { id: 137, name: 'Polygon', symbol: 'MATIC' },
  ];

  const handleGetQuote = async () => {
    if (!amount || !selectedChain) {
      alert('Please enter an amount and select a chain');
      return;
    }

    try {
      setStep('quote');
      const amountInSmallestUnit = (parseFloat(amount) * 1e6).toString(); // Assuming 6 decimals for USDC
      const quoteResult = await getQuote(
        selectedChain.id.toString(),
        targetAsset,
        amountInSmallestUnit,
        targetAsset === 'WETH' ? 'ETH' : 'STABLECOIN',
        targetChainId
      );
      setQuote(quoteResult);
    } catch (err) {
      console.error('Quote error:', err);
      setStep('input');
    }
  };

  const handleExecute = async () => {
    if (!quote) return;

    try {
      setStep('executing');
      await executeDeposit(quote);
      setStep('success');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Execute error:', err);
      setStep('quote');
    }
  };

  const handleClose = () => {
    setAmount('');
    setSelectedChain(null);
    setQuote(null);
    setStep('input');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={styles.overlay} onClick={handleClose}>
        <motion.div
          style={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', duration: 0.4 }}
        >
          {/* Close Button */}
          <button onClick={handleClose} style={styles.closeBtn}>
            <X size={24} />
          </button>

          {/* Header */}
          <div style={styles.header}>
            <div style={styles.iconWrapper}>
              <ArrowLeftRight size={48} strokeWidth={3} />
            </div>
            <h2 style={styles.title}>Bridge to {poolName}</h2>
            <p style={styles.subtitle}>Deposit {targetAsset} from any chain via LI.FI</p>
          </div>

          {/* Step: Input */}
          {step === 'input' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Chain Selection */}
              <div style={styles.section}>
                <label style={styles.label}>Select Source Chain</label>
                <div style={styles.chainGrid}>
                  {supportedChains.map((chainOption) => (
                    <motion.button
                      key={chainOption.id}
                      style={{
                        ...styles.chainButton,
                        ...(selectedChain?.id === chainOption.id ? styles.chainButtonActive : {})
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedChain(chainOption)}
                    >
                      {chainOption.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div style={styles.section}>
                <label style={styles.label}>Amount ({targetAsset})</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  style={styles.input}
                />
              </div>

              {/* Error Display */}
              {error && (
                <div style={styles.errorBox}>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* Get Quote Button */}
              <motion.button
                style={{
                  ...styles.actionButton,
                  ...((!amount || !selectedChain) ? styles.buttonDisabled : {})
                }}
                whileHover={amount && selectedChain ? { scale: 1.02 } : {}}
                whileTap={amount && selectedChain ? { scale: 0.98 } : {}}
                onClick={handleGetQuote}
                disabled={!amount || !selectedChain || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="spin" />
                    Getting Quote...
                  </>
                ) : (
                  'Get Bridge Quote'
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Step: Quote Display */}
          {step === 'quote' && quote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div style={styles.quoteCard}>
                <h3 style={styles.quoteTitle}>Bridge Quote</h3>
                <div style={styles.quoteDetails}>
                  <div style={styles.quoteRow}>
                    <span>From:</span>
                    <span>{selectedChain?.name}</span>
                  </div>
                  <div style={styles.quoteRow}>
                    <span>To:</span>
                    <span>{getChainName(targetChainId)}</span>
                  </div>
                  <div style={styles.quoteRow}>
                    <span>Amount:</span>
                    <span>{amount} {targetAsset}</span>
                  </div>
                  <div style={styles.quoteRow}>
                    <span>Estimated Fee:</span>
                    <span>{quote.gasCosts?.[0]?.amountUSD ? `$${parseFloat(quote.gasCosts[0].amountUSD).toFixed(2)}` : 'N/A'}</span>
                  </div>
                  <div style={styles.quoteRow}>
                    <span>You'll Receive:</span>
                    <span style={{ fontWeight: '900', color: '#06d6a0' }}>
                      ~{(parseFloat(amount) * 0.997).toFixed(2)} {targetAsset}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <motion.button
                  style={styles.backButton}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('input')}
                >
                  ← Back
                </motion.button>
                <motion.button
                  style={styles.actionButton}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExecute}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="spin" />
                      Executing...
                    </>
                  ) : (
                    'Execute Bridge'
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step: Executing */}
          {step === 'executing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.statusContainer}
            >
              <Loader2 size={64} strokeWidth={3} className="spin" style={{ color: '#00d4ff' }} />
              <h3 style={styles.statusTitle}>Bridging in Progress...</h3>
              <p style={styles.statusText}>{txStatus || 'Please confirm in your wallet'}</p>
            </motion.div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={styles.statusContainer}
            >
              <CheckCircle2 size={64} strokeWidth={3} style={{ color: '#06d6a0' }} />
              <h3 style={styles.statusTitle}>Bridge Successful! 🎉</h3>
              <p style={styles.statusText}>Your funds have been bridged to {getChainName(targetChainId)}</p>
            </motion.div>
          )}

          {/* Info Box */}
          {step === 'input' && (
            <div style={styles.infoBox}>
              <AlertCircle size={16} />
              <span style={styles.infoText}>
                LI.FI will automatically bridge your assets from the selected chain to {getChainName(targetChainId)}. Note: LI.FI supports mainnet chains only. Funds will arrive on {getChainName(targetChainId)}.
              </span>
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
    maxWidth: '600px',
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
    marginBottom: '32px',
  },
  iconWrapper: {
    width: '80px',
    height: '80px',
    background: '#00d4ff',
    border: '4px solid #1a1a1a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    color: '#1a1a1a',
  },
  title: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '32px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '0 0 8px',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    margin: '0',
  },
  section: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  chainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  chainButton: {
    background: '#ffffff',
    border: '3px solid #1a1a1a',
    borderRadius: '12px',
    padding: '12px',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '4px 4px 0 #1a1a1a',
  },
  chainButtonActive: {
    background: '#00d4ff',
    border: '3px solid #1a1a1a',
    boxShadow: '6px 6px 0 #1a1a1a',
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    background: '#ffffff',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    boxShadow: '6px 6px 0 #1a1a1a',
    outline: 'none',
    boxSizing: 'border-box',
  },
  actionButton: {
    flex: 1,
    background: '#00d4ff',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    padding: '16px 32px',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '18px',
    fontWeight: '900',
    color: '#1a1a1a',
    cursor: 'pointer',
    boxShadow: '6px 6px 0 #1a1a1a',
    transition: 'all 0.2s',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '24px',
  },
  backButton: {
    flex: 0.5,
    background: '#e0e0e0',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    padding: '16px 32px',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '18px',
    fontWeight: '900',
    color: '#1a1a1a',
    cursor: 'pointer',
    boxShadow: '6px 6px 0 #1a1a1a',
    transition: 'all 0.2s',
    textTransform: 'uppercase',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  quoteCard: {
    background: '#f8f9fa',
    border: '4px solid #1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '8px 8px 0 #1a1a1a',
  },
  quoteTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '20px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '0 0 16px',
    textTransform: 'uppercase',
  },
  quoteDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  quoteRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  statusContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
  },
  statusTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '24px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '16px 0 8px',
    textTransform: 'uppercase',
  },
  statusText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    margin: '0',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#ffe6e6',
    border: '3px solid #ff4d6d',
    borderRadius: '12px',
    padding: '16px',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    background: '#e6f9ff',
    border: '3px solid #00d4ff',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '24px',
  },
  infoText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: '1.4',
  },
};

export default LiFiBridgeModal;
