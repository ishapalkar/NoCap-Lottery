import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLotteryPoolUSDC } from '../hooks/useLotteryPoolUSDC';
import { useUSDCVault } from '../hooks/useUSDCVault';
import { useCountdown } from '../hooks/useCountdown';
import { AlertTriangle, TrendingDown, Shield, Clock, DollarSign, Ticket, ArrowLeft } from 'lucide-react';

export const Withdraw = () => {
  const navigate = useNavigate();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    userDeposits,
    currentRound,
    prizeDrawTime,
    depositWindowEnd,
    withdraw,
    depositWindowOpen,
    drawPhaseActive
  } = useLotteryPoolUSDC();
  
  const { totalAssets } = useUSDCVault();
  const timeLeft = useCountdown(prizeDrawTime * 1000); // Convert to ms

  // Calculate user's expected prize value (proportional to deposits)
  const weeklyYield = totalAssets > 0 ? ((totalAssets * 0.08) / 52) : 0;
  const estimatedPrize = userDeposits && totalAssets 
    ? (userDeposits / totalAssets) * weeklyYield
    : 0;

  // Calculate user's tickets (1 ticket per $10)
  const userTickets = userDeposits ? Math.floor(userDeposits / 10) : 0;

  // Calculate win chance
  const totalTickets = totalAssets ? Math.floor(totalAssets / 10) : 0;
  const winChance = totalTickets > 0 ? ((userTickets / totalTickets) * 100).toFixed(4) : '0.00';

  // Check if in deposit phase
  const isDepositPhase = depositWindowOpen;
  
  // Check if in draw phase
  const isYieldPhase = !depositWindowOpen && !drawPhaseActive;

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    
    setIsProcessing(true);
    try {
      await withdraw(withdrawAmount);
      setWithdrawAmount('');
      setShowConfirmation(false);
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMaxClick = () => {
    if (userDeposits) {
      setWithdrawAmount(userDeposits.toString());
    }
  };

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={styles.header}
      >
        <button 
          onClick={() => navigate('/pools')}
          style={styles.backButton}
          className="btn-bounce"
        >
          <ArrowLeft size={20} style={{marginRight: '8px'}} />
          Back to Pools
        </button>
        
        <h1 style={styles.title}>💸 Withdraw Funds</h1>
        <p style={styles.subtitle}>Review your withdrawal carefully</p>
      </motion.div>

      <div style={styles.content}>
        {/* Warning Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={styles.warningCard}
        >
          <AlertTriangle size={48} color="#ff4d6d" style={{ marginBottom: '16px' }} />
          <h2 style={styles.warningTitle}>⚠️ Early Withdrawal Warning</h2>
          <p style={styles.warningText}>
            Withdrawing before the draw will <strong>forfeit your chance to win</strong> the prize for this round!
          </p>
          <div style={styles.warningDivider} />
          <div style={styles.warningDetails}>
            <div style={styles.warningItem}>
              <Shield size={24} color="#06d6a0" />
              <div>
                <h3 style={styles.warningItemTitle}>Your Principal is Safe</h3>
                <p style={styles.warningItemText}>You'll get back exactly what you deposited</p>
              </div>
            </div>
            <div style={styles.warningItem}>
              <TrendingDown size={24} color="#ff4d6d" />
              <div>
                <h3 style={styles.warningItemTitle}>No Yield for You</h3>
                <p style={styles.warningItemText}>Generated yield goes to the prize pool</p>
              </div>
            </div>
            <div style={styles.warningItem}>
              <Ticket size={24} color="#ffd23f" />
              <div>
                <h3 style={styles.warningItemTitle}>Tickets Cancelled</h3>
                <p style={styles.warningItemText}>Your {userTickets} tickets will be removed from the draw</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Current Position Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={styles.positionCard}
        >
          <h2 style={styles.sectionTitle}>📊 Your Current Position</h2>
          
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <DollarSign size={32} color="#00d4ff" />
              <p style={styles.statLabel}>Deposited Amount</p>
              <p style={styles.statValue}>${userDeposits || '0.00'}</p>
            </div>
            
            <div style={styles.statBox}>
              <Ticket size={32} color="#ffd23f" />
              <p style={styles.statLabel}>Active Tickets</p>
              <p style={styles.statValue}>{userTickets}</p>
            </div>
            
            <div style={styles.statBox}>
              <TrendingDown size={32} color="#ff4d6d" />
              <p style={styles.statLabel}>Win Chance</p>
              <p style={styles.statValue}>{winChance}%</p>
            </div>
            
            <div style={styles.statBox}>
              <DollarSign size={32} color="#06d6a0" />
              <p style={styles.statLabel}>Potential Prize</p>
              <p style={styles.statValue}>${estimatedPrize.toFixed(2)}</p>
            </div>
          </div>

          {/* Countdown */}
          <div style={styles.countdownBox}>
            <Clock size={24} color="#1a1a1a" />
            <div>
              <p style={styles.countdownLabel}>
                {isDepositPhase ? '⏰ Deposit Phase Ends In' : isYieldPhase ? '🌱 Yield Phase Ends In' : '🎯 Draw Time'}
              </p>
              <p style={styles.countdownValue}>
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </p>
            </div>
          </div>
        </motion.div>

        {/* Withdrawal Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          style={styles.formCard}
        >
          <h2 style={styles.sectionTitle}>💰 Withdrawal Amount</h2>
          
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Amount to Withdraw (USDC)</label>
            <div style={styles.inputWrapper}>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                style={styles.input}
                max={userDeposits}
                min="0"
                step="0.01"
              />
              <button 
                onClick={handleMaxClick}
                style={styles.maxButton}
                className="btn-bounce"
              >
                MAX
              </button>
            </div>
            <p style={styles.balanceText}>
              Available: <strong>${userDeposits || '0.00'} USDC</strong>
            </p>
          </div>

          {/* Withdrawal Summary */}
          {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={styles.summaryBox}
            >
              <h3 style={styles.summaryTitle}>Withdrawal Summary</h3>
              <div style={styles.summaryRow}>
                <span>Withdrawal Amount:</span>
                <strong>${parseFloat(withdrawAmount).toFixed(2)} USDC</strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Tickets Forfeited:</span>
                <strong style={{color: '#ff4d6d'}}>
                  {Math.floor(parseFloat(withdrawAmount) / 10)} tickets
                </strong>
              </div>
              <div style={styles.summaryRow}>
                <span>Potential Prize Lost:</span>
                <strong style={{color: '#ff4d6d'}}>
                  ${((parseFloat(withdrawAmount) / (userDeposits || 1)) * estimatedPrize).toFixed(2)}
                </strong>
              </div>
              <div style={{...styles.summaryRow, borderTop: '3px solid var(--ink-black)', paddingTop: '12px', marginTop: '12px'}}>
                <span style={{fontSize: '18px', fontWeight: 700}}>You will Receive:</span>
                <strong style={{fontSize: '24px', color: '#06d6a0'}}>
                  ${parseFloat(withdrawAmount).toFixed(2)} USDC
                </strong>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            {!showConfirmation ? (
              <>
                <button
                  onClick={() => navigate('/pools')}
                  style={styles.cancelButton}
                  className="btn-bounce"
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={() => setShowConfirmation(true)}
                  style={{
                    ...styles.withdrawButton,
                    opacity: !withdrawAmount || parseFloat(withdrawAmount) <= 0 ? 0.5 : 1,
                    cursor: !withdrawAmount || parseFloat(withdrawAmount) <= 0 ? 'not-allowed' : 'pointer'
                  }}
                  className="btn-bounce"
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                >
                  💸 Review Withdrawal
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowConfirmation(false)}
                  style={styles.cancelButton}
                  className="btn-bounce"
                  disabled={isProcessing}
                >
                  ⬅️ Go Back
                </button>
                <button
                  onClick={handleWithdraw}
                  style={{
                    ...styles.confirmButton,
                    opacity: isProcessing ? 0.6 : 1
                  }}
                  className="btn-bounce"
                  disabled={isProcessing}
                >
                  {isProcessing ? '⏳ Processing...' : '✅ Confirm Withdrawal'}
                </button>
              </>
            )}
          </div>

          {showConfirmation && (
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              style={styles.finalWarning}
            >
              <AlertTriangle size={20} color="#ff4d6d" style={{marginRight: '8px'}} />
              <p style={{margin: 0}}>
                <strong>Final Warning:</strong> This action cannot be undone. You will forfeit your tickets and prize chance.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Safe Alternative */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          style={styles.alternativeCard}
        >
          <h2 style={styles.alternativeTitle}>💡 Consider Waiting!</h2>
          <p style={styles.alternativeText}>
            If you wait until after the draw, you can:
          </p>
          <ul style={styles.benefitsList}>
            <li>✅ Keep your chance to win the ${estimatedPrize.toFixed(2)} prize</li>
            <li>✅ Still get your full principal back</li>
            <li>✅ Withdraw anytime after the draw with no penalty</li>
            <li>✅ Stay in the game for the next round if you win!</li>
          </ul>
          <button
            onClick={() => navigate('/dashboard')}
            style={styles.stayButton}
            className="btn-bounce"
          >
            🏆 Stay in the Game
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  backButton: {
    background: 'white',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    padding: '10px 20px',
    fontSize: '16px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '3px 3px 0 var(--ink-black)',
    display: 'inline-flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '56px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    margin: '0 0 12px 0',
    textShadow: '4px 4px 0 rgba(0,0,0,0.1)',
  },
  subtitle: {
    fontSize: '20px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  warningCard: {
    background: '#fff5f5',
    border: '5px solid #ff4d6d',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
    boxShadow: '6px 6px 0 var(--ink-black)',
  },
  warningTitle: {
    fontSize: '32px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: '#ff4d6d',
    margin: '0 0 16px 0',
  },
  warningText: {
    fontSize: '18px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: '0 0 24px 0',
    lineHeight: 1.6,
  },
  warningDivider: {
    height: '3px',
    background: '#ff4d6d',
    margin: '24px 0',
    borderRadius: '2px',
  },
  warningDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },
  warningItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  warningItemTitle: {
    fontSize: '18px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    margin: '0 0 4px 0',
  },
  warningItemText: {
    fontSize: '14px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: 0,
    opacity: 0.8,
  },
  positionCard: {
    background: 'white',
    border: '5px solid var(--ink-black)',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '6px 6px 0 var(--ink-black)',
  },
  sectionTitle: {
    fontSize: '28px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    margin: '0 0 24px 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statBox: {
    background: '#f8f9fa',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '14px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: '8px 0 4px 0',
    opacity: 0.7,
  },
  statValue: {
    fontSize: '24px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    margin: 0,
  },
  countdownBox: {
    background: '#ffd23f',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  countdownLabel: {
    fontSize: '16px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: '0 0 4px 0',
  },
  countdownValue: {
    fontSize: '24px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    margin: 0,
  },
  formCard: {
    background: 'white',
    border: '5px solid var(--ink-black)',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '6px 6px 0 var(--ink-black)',
  },
  inputGroup: {
    marginBottom: '24px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '16px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    marginBottom: '8px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    gap: '12px',
  },
  input: {
    flex: 1,
    padding: '16px',
    fontSize: '20px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 700,
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    outline: 'none',
  },
  maxButton: {
    padding: '16px 24px',
    fontSize: '16px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    background: 'var(--marker-cyan)',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '3px 3px 0 var(--ink-black)',
  },
  balanceText: {
    fontSize: '14px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    marginTop: '8px',
    opacity: 0.7,
  },
  summaryBox: {
    background: '#f8f9fa',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  summaryTitle: {
    fontSize: '18px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    margin: '0 0 16px 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '16px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    marginBottom: '8px',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  cancelButton: {
    padding: '16px 32px',
    fontSize: '18px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    background: 'white',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 var(--ink-black)',
  },
  withdrawButton: {
    padding: '16px 32px',
    fontSize: '18px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    background: '#ffd23f',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 var(--ink-black)',
  },
  confirmButton: {
    padding: '16px 32px',
    fontSize: '18px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    background: '#ff4d6d',
    color: 'white',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 var(--ink-black)',
  },
  finalWarning: {
    background: '#fff5f5',
    border: '3px solid #ff4d6d',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '16px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
  },
  alternativeCard: {
    background: '#e6f9f5',
    border: '5px solid #06d6a0',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '6px 6px 0 var(--ink-black)',
  },
  alternativeTitle: {
    fontSize: '28px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: '#06d6a0',
    margin: '0 0 16px 0',
  },
  alternativeText: {
    fontSize: '18px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: '0 0 16px 0',
  },
  benefitsList: {
    fontSize: '16px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    marginBottom: '24px',
    lineHeight: 1.8,
  },
  stayButton: {
    width: '100%',
    padding: '16px 32px',
    fontSize: '20px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    background: '#06d6a0',
    color: 'white',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 var(--ink-black)',
  },
};
