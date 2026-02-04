import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Trophy
} from 'lucide-react';
import { useLotteryPoolUSDC } from '../hooks/useLotteryPoolUSDC';
import { useUSDCVault } from '../hooks/useUSDCVault';
import { useUSDCBalance, useUSDCAllowance, useUSDCApproval } from '../hooks/useUSDCApproval';
import { useCountdown } from '../hooks/useCountdown';

const SEPOLIA_CHAIN_ID = 11155111;
const LOTTERY_POOL_ADDRESS = import.meta.env.VITE_USDC_LOTTERY;

export function USDCPool() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [depositAmount, setDepositAmount] = useState('');
  const [activeTab, setActiveTab] = useState('RULES');

  // Hooks
  const lottery = useLotteryPoolUSDC(address);
  const vault = useUSDCVault();
  const { balance: usdcBalance, refetch: refetchBalance } = useUSDCBalance(address);
  const { allowance, refetch: refetchAllowance } = useUSDCAllowance(address, LOTTERY_POOL_ADDRESS);
  const approval = useUSDCApproval(LOTTERY_POOL_ADDRESS);

  // Countdown timer
  const depositCountdown = useCountdown(lottery.depositWindowEnd);

  // Calculate progress percentage
  const progressPercentage = Math.min((vault.totalAssets / 2500000) * 100, 100);

  // Calculate user tickets and winning chance
  const userTickets = Math.floor(parseFloat(depositAmount) || 0);
  const totalTickets = vault.totalAssets + userTickets;
  const winningChance = totalTickets > 0 ? ((userTickets / totalTickets) * 100).toFixed(1) : 0;

  // Check if needs approval
  const needsApproval = parseFloat(depositAmount) > allowance;

  // Handle approve
  const handleApprove = async () => {
    try {
      await approval.approve(depositAmount);
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < lottery.minDeposit) {
      return;
    }

    try {
      await lottery.deposit(depositAmount);
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  // Effects for success notifications
  useEffect(() => {
    if (approval.isSuccess) {
      refetchAllowance();
    }
  }, [approval.isSuccess]);

  useEffect(() => {
    if (lottery.isDepositSuccess) {
      refetchBalance();
      setDepositAmount('');
    }
  }, [lottery.isDepositSuccess]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/pools')}
          style={styles.backButton}
          className="btn-bounce"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft size={16} />
          <span>BACK TO POOLS</span>
        </motion.button>

        {/* Pool Title */}
        <motion.div
          style={styles.titleSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div style={styles.iconCircle}>$</div>
          <h1 style={styles.title}>Cosmic USDC Vault</h1>
          <div style={styles.badges}>
            <span style={styles.badgeCyan}>NO LOSS</span>
            <span style={styles.badgeGrey}>WEEKLY DRAW</span>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div style={styles.mainGrid}>
          {/* Left Card - Prize Info */}
          <motion.div
            style={styles.prizeCard}
            className="card-squishy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div style={styles.prizeHeader}>
              <h2 style={styles.prizeLabel}>CURRENT PRIZE</h2>
              <div style={styles.prizeAmount}>$50,000</div>
            </div>

            <div style={styles.prizeDetails}>
              <div style={styles.detailRow}>
                <div style={styles.detailItem}>
                  <Clock size={20} style={{ color: '#1a1a1a' }} />
                  <div>
                    <div style={styles.detailLabel}>TIME LEFT</div>
                    <div style={styles.detailValue}>{depositCountdown.formatted || '2d 14h 30m'}</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <Trophy size={20} style={{ color: '#1a1a1a' }} />
                  <div>
                    <div style={styles.detailLabel}>ODDS</div>
                    <div style={styles.detailValue}>1 in 1240</div>
                  </div>
                </div>
              </div>

              <div style={styles.trophyIcon}>🏆</div>
            </div>

            {/* Pool Progress */}
            <div style={styles.progressSection}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Pool Progress</span>
                <span style={styles.progressAmount}>${vault.totalAssets.toLocaleString()} deposited</span>
              </div>
              <div style={styles.progressBarContainer}>
                <motion.div
                  style={styles.progressBarFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>

          {/* Right Card - Deposit */}
          <motion.div
            style={styles.depositCard}
            className="card-squishy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h2 style={styles.depositTitle}>DEPOSIT USDC</h2>
            <p style={styles.depositSubtitle}>Get tickets for the next draw. Withdraw anytime.</p>

            <div style={styles.depositForm}>
              <div style={styles.inputSection}>
                <div style={styles.inputHeader}>
                  <span style={styles.inputLabel}>AMOUNT</span>
                  <span style={styles.balanceText}>BAL: {usdcBalance.toFixed(2)}</span>
                </div>
                <div style={styles.inputWrapper}>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    style={styles.input}
                  />
                  <button
                    onClick={() => setDepositAmount(usdcBalance.toString())}
                    style={styles.maxButton}
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div style={styles.receiveSection}>
                <div style={styles.receiveRow}>
                  <span style={styles.receiveLabel}>You receive:</span>
                  <span style={styles.receiveValue}>{userTickets} Tickets</span>
                </div>
                <div style={styles.receiveRow}>
                  <span style={styles.receiveLabel}>Winning chance:</span>
                  <span style={styles.receiveValue}>{winningChance}%</span>
                </div>
              </div>

              {needsApproval ? (
                <motion.button
                  onClick={handleApprove}
                  disabled={approval.isPending || !depositAmount}
                  className="btn-bounce"
                  style={{
                    ...styles.depositButton,
                    opacity: (approval.isPending || !depositAmount) ? 0.5 : 1,
                    cursor: (approval.isPending || !depositAmount) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {approval.isPending ? 'APPROVING...' : 'APPROVE USDC'}
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleDeposit}
                  disabled={lottery.isPending || !depositAmount}
                  className="btn-bounce"
                  style={{
                    ...styles.depositButton,
                    opacity: (lottery.isPending || !depositAmount) ? 0.5 : 1,
                    cursor: (lottery.isPending || !depositAmount) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {lottery.isPending ? 'DEPOSITING...' : 'DEPOSIT & PLAY'}
                </motion.button>
              )}

              <button style={styles.switchLink}>Switch to Withdraw</button>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          style={styles.tabSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div style={styles.tabs}>
            {['RULES', 'WINNERS', 'ACTIVITY'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  ...styles.tab,
                  borderBottom: activeTab === tab ? '5px solid #1a1a1a' : 'none',
                  fontWeight: activeTab === tab ? '900' : '600',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'RULES' && (
            <motion.div
              style={styles.tabContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <ol style={styles.rulesList}>
                <li style={styles.ruleItem}>
                  <strong>Deposit USDC into the pool to get tickets.</strong>
                </li>
                <li style={styles.ruleItem}>
                  <strong>1 USDC = 1 Ticket. More tickets = higher chance to win.</strong>
                </li>
              </ol>
            </motion.div>
          )}

          {activeTab === 'WINNERS' && (
            <motion.div
              style={styles.tabContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <p style={styles.comingSoon}>🏆 Winners history coming soon...</p>
            </motion.div>
          )}

          {activeTab === 'ACTIVITY' && (
            <motion.div
              style={styles.tabContent}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <p style={styles.comingSoon}>📊 Activity feed coming soon...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '100px 40px 40px',
    position: 'relative',
    zIndex: 1,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'transparent',
    border: 'none',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    cursor: 'pointer',
    padding: '0',
    marginBottom: '30px',
    transition: 'all 0.2s',
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  iconCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#ffd23f',
    border: '5px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '0 auto 20px',
    boxShadow: '8px 8px 0 #1a1a1a',
  },
  title: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '48px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '0 0 20px',
    textTransform: 'uppercase',
    letterSpacing: '-1px',
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  badgeCyan: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    background: '#00d4ff',
    padding: '8px 20px',
    borderRadius: '20px',
    border: '3px solid #1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  badgeGrey: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    background: '#e0e0e0',
    padding: '8px 20px',
    borderRadius: '20px',
    border: '3px solid #1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '30px',
    marginBottom: '40px',
  },
  prizeCard: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '12px 12px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  prizeHeader: {
    marginBottom: '30px',
  },
  prizeLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '16px',
    fontWeight: '700',
    color: '#666',
    margin: '0 0 10px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  prizeAmount: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '72px',
    fontWeight: '900',
    color: '#00d4ff',
    margin: '0',
    lineHeight: '1',
  },
  prizeDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    position: 'relative',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  detailLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '24px',
    fontWeight: '900',
    color: '#1a1a1a',
  },
  trophyIcon: {
    fontSize: '120px',
    opacity: '0.3',
    filter: 'grayscale(100%)',
  },
  progressSection: {
    marginTop: '30px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  progressLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  progressAmount: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
  progressBarContainer: {
    width: '100%',
    height: '32px',
    background: '#f0f0f0',
    border: '4px solid #1a1a1a',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    background: '#00d4ff',
    transition: 'width 1s ease-out',
  },
  depositCard: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '12px 12px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  depositTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '24px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '0 0 8px',
    textTransform: 'uppercase',
  },
  depositSubtitle: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    margin: '0 0 30px',
  },
  depositForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  inputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  balanceText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#f5f5f5',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    padding: '12px 16px',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  maxButton: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '700',
    color: '#00d4ff',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    textTransform: 'uppercase',
    transition: 'all 0.2s',
  },
  receiveSection: {
    background: '#f5f5f5',
    border: '3px solid #1a1a1a',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  receiveRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiveLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
  receiveValue: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '16px',
    fontWeight: '900',
    color: '#1a1a1a',
  },
  depositButton: {
    width: '100%',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '18px',
    fontWeight: '900',
    color: '#1a1a1a',
    background: '#00d4ff',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '6px 6px 0 #1a1a1a',
    transition: 'all 0.15s',
  },
  switchLink: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '0',
    transition: 'all 0.2s',
  },
  tabSection: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '12px 12px 0 #1a1a1a',
  },
  tabs: {
    display: 'flex',
    borderBottom: '5px solid #1a1a1a',
  },
  tab: {
    flex: 1,
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    background: 'transparent',
    border: 'none',
    padding: '20px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
    borderBottom: '5px solid transparent',
  },
  tabContent: {
    padding: '40px',
  },
  rulesList: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: '1.8',
    paddingLeft: '20px',
  },
  ruleItem: {
    marginBottom: '16px',
  },
  comingSoon: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '18px',
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    margin: '40px 0',
  },
};

export default USDCPool;
