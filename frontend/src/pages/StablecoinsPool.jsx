import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  Trophy,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useLotteryPoolUSDC } from '../hooks/useLotteryPoolUSDC';
import { useUSDCVault } from '../hooks/useUSDCVault';
import { useUSDCBalance, useUSDCAllowance, useUSDCApproval } from '../hooks/useUSDCApproval';
import { useCountdown } from '../hooks/useCountdown';
import { YellowDepositModal } from '../components/YellowDepositModal';
import { useYellowNetwork } from '../hooks/useYellowNetwork';

const SEPOLIA_CHAIN_ID = 11155111;
const LOTTERY_POOL_ADDRESS = import.meta.env.VITE_USDC_LOTTERY;

export function StablecoinsPool() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [depositAmount, setDepositAmount] = useState('');
  const [activeTab, setActiveTab] = useState('RULES');
  const [showYellowModal, setShowYellowModal] = useState(false);
  const [mode, setMode] = useState('deposit'); // 'deposit' or 'withdraw'

  // Hooks
  const lottery = useLotteryPoolUSDC(address);
  const vault = useUSDCVault();
  const { balance: usdcBalance, refetch: refetchBalance } = useUSDCBalance(address);
  const { allowance, refetch: refetchAllowance } = useUSDCAllowance(address, LOTTERY_POOL_ADDRESS);
  const approval = useUSDCApproval(LOTTERY_POOL_ADDRESS);
  const { hasActiveSession } = useYellowNetwork();

  // Countdown timer
  const depositCountdown = useCountdown(lottery.depositWindowEnd * 1000);

  // Check if deposit window is open (24 hours from week start)
  const isDepositWindowOpen = () => {
    if (!lottery.depositWindowEnd) return false;
    const now = Date.now();
    const windowEnd = lottery.depositWindowEnd * 1000;
    return now < windowEnd;
  };

  // Calculate user's principal and yield
  const userPrincipal = lottery.userDeposits || 0;
  const userShares = vault.userShares || 0;
  const shareValue = vault.sharePrice || 1;
  const userTotalValue = userShares * shareValue;
  const userYield = Math.max(0, userTotalValue - userPrincipal);

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
      alert('✅ USDC approved! You can now deposit.');
    } catch (error) {
      console.error('Approval failed:', error);
      alert('❌ Approval failed. Please try again.');
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < lottery.minDeposit) {
      alert(`Minimum deposit is ${lottery.minDeposit} USDC`);
      return;
    }

    if (!isDepositWindowOpen()) {
      alert('❌ Deposit window is closed. Please wait for the next round.');
      return;
    }

    try {
      await lottery.deposit(depositAmount);
      alert('✅ Deposit successful! You are entered into this week\'s draw.');
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('❌ Deposit failed. ' + error.message);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter an amount to withdraw');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount > userPrincipal) {
      alert(`You can only withdraw up to your principal: ${userPrincipal.toFixed(2)} USDC`);
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Early Withdrawal Warning:\n\n` +
      `You are withdrawing ${amount} USDC\n` +
      `Your accrued yield (${userYield.toFixed(2)} USDC) will go to the prize pool\n` +
      `You will be ineligible for this week's draw\n\n` +
      `Continue with withdrawal?`
    );

    if (!confirmed) return;

    try {
      await lottery.withdraw(depositAmount);
      alert(`✅ Withdrawal successful!\n\nPrincipal returned: ${amount} USDC\nYield forfeited: ${userYield.toFixed(2)} USDC (goes to prize pool)`);
      setDepositAmount('');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('❌ Withdrawal failed. ' + error.message);
    }
  };

  // Effects for success notifications
  useEffect(() => {
    if (approval.isSuccess) {
      refetchAllowance();
    }
  }, [approval.isSuccess, refetchAllowance]);

  useEffect(() => {
    if (lottery.isDepositSuccess) {
      refetchBalance();
      setDepositAmount('');
    }
  }, [lottery.isDepositSuccess, refetchBalance]);

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
          <div style={styles.iconCircle}>💰</div>
          <h1 style={styles.title}>Stablecoins Pool</h1>
          <p style={styles.subtitle}>USDC, USDT, DAI - All Stablecoins Welcome</p>
          <div style={styles.badges}>
            <span style={styles.badgeCyan}>NO LOSS</span>
            <span style={styles.badgeGrey}>WEEKLY DRAW</span>
            <span style={styles.badgeYellow}>AAVE YIELD</span>
          </div>
        </motion.div>

        {/* Deposit Window Warning */}
        {!isDepositWindowOpen() && (
          <motion.div
            style={styles.warningBanner}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={20} />
            <span>⏰ Deposit window closed. Opens {depositCountdown.formatted}</span>
          </motion.div>
        )}

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
              <h2 style={styles.prizeLabel}>CURRENT PRIZE POOL</h2>
              <div style={styles.prizeAmount}>$50,000</div>
              <div style={styles.yieldNote}>💡 Prize = Yield Only (Principal Safe)</div>
            </div>

            <div style={styles.prizeDetails}>
              <div style={styles.detailRow}>
                <div style={styles.detailItem}>
                  <Clock size={20} style={{ color: '#1a1a1a' }} />
                  <div>
                    <div style={styles.detailLabel}>DRAW IN</div>
                    <div style={styles.detailValue}>{depositCountdown.formatted || '2d 14h 30m'}</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <Trophy size={20} style={{ color: '#1a1a1a' }} />
                  <div>
                    <div style={styles.detailLabel}>YOUR ODDS</div>
                    <div style={styles.detailValue}>
                      {userPrincipal > 0 ? `1 in ${Math.floor(vault.totalAssets / userPrincipal)}` : 'Not Entered'}
                    </div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <TrendingUp size={20} style={{ color: '#06d6a0' }} />
                  <div>
                    <div style={styles.detailLabel}>YOUR YIELD</div>
                    <div style={styles.detailValue}>${userYield.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Balance Card */}
            {userPrincipal > 0 && (
              <div style={styles.userBalanceCard}>
                <h3 style={styles.balanceTitle}>YOUR POSITION</h3>
                <div style={styles.balanceGrid}>
                  <div>
                    <div style={styles.balanceLabel}>Principal (Safe)</div>
                    <div style={styles.balanceValue}>${userPrincipal.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={styles.balanceLabel}>Yield (For Prizes)</div>
                    <div style={styles.balanceValue}>${userYield.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={styles.balanceLabel}>Total Value</div>
                    <div style={styles.balanceValue}>${userTotalValue.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

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

          {/* Right Card - Deposit/Withdraw */}
          <motion.div
            style={styles.depositCard}
            className="card-squishy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {/* Mode Toggle */}
            <div style={styles.modeToggle}>
              <button
                onClick={() => setMode('deposit')}
                style={{
                  ...styles.modeButton,
                  ...(mode === 'deposit' ? styles.modeButtonActive : {})
                }}
              >
                DEPOSIT
              </button>
              <button
                onClick={() => setMode('withdraw')}
                style={{
                  ...styles.modeButton,
                  ...(mode === 'withdraw' ? styles.modeButtonActive : {})
                }}
              >
                WITHDRAW
              </button>
            </div>

            <h2 style={styles.depositTitle}>
              {mode === 'deposit' ? 'DEPOSIT STABLECOINS' : 'WITHDRAW PRINCIPAL'}
            </h2>
            <p style={styles.depositSubtitle}>
              {mode === 'deposit' 
                ? 'Get tickets for the next draw. Your principal is always safe.' 
                : 'Withdraw your principal anytime. Forfeits yield to prize pool.'}
            </p>

            <div style={styles.depositForm}>
              <div style={styles.inputSection}>
                <div style={styles.inputHeader}>
                  <span style={styles.inputLabel}>AMOUNT (USDC)</span>
                  <span style={styles.balanceText}>
                    {mode === 'deposit' 
                      ? `BAL: ${usdcBalance.toFixed(2)}` 
                      : `MAX: ${userPrincipal.toFixed(2)}`}
                  </span>
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
                    onClick={() => setDepositAmount(
                      mode === 'deposit' ? usdcBalance.toString() : userPrincipal.toString()
                    )}
                    style={styles.maxButton}
                  >
                    MAX
                  </button>
                </div>
              </div>

              {mode === 'deposit' && (
                <div style={styles.receiveSection}>
                  <div style={styles.receiveRow}>
                    <span style={styles.receiveLabel}>You receive:</span>
                    <span style={styles.receiveValue}>{userTickets} Tickets</span>
                  </div>
                  <div style={styles.receiveRow}>
                    <span style={styles.receiveLabel}>Win chance boost:</span>
                    <span style={styles.receiveValue}>+{winningChance}%</span>
                  </div>
                </div>
              )}

              {mode === 'withdraw' && userYield > 0 && (
                <div style={styles.warningBox}>
                  <AlertCircle size={18} />
                  <div>
                    <div style={styles.warningTitle}>Early Withdrawal</div>
                    <div style={styles.warningText}>
                      Your ${userYield.toFixed(2)} yield goes to prize pool. Principal returned.
                    </div>
                  </div>
                </div>
              )}

              {mode === 'deposit' ? (
                <>
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
                    <>
                      <motion.button
                        onClick={handleDeposit}
                        disabled={lottery.isPending || !depositAmount || !isDepositWindowOpen()}
                        className="btn-bounce"
                        style={{
                          ...styles.depositButton,
                          opacity: (lottery.isPending || !depositAmount || !isDepositWindowOpen()) ? 0.5 : 1,
                          cursor: (lottery.isPending || !depositAmount || !isDepositWindowOpen()) ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {lottery.isPending ? 'DEPOSITING...' : 'DEPOSIT & PLAY'}
                      </motion.button>

                      {/* Yellow Network Instant Deposit */}
                      {isDepositWindowOpen() && (
                        <motion.button
                          onClick={() => setShowYellowModal(true)}
                          className="btn-bounce"
                          style={styles.yellowButton}
                          initial={{ scale: 0.95 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          ⚡ {hasActiveSession ? 'INSTANT DEPOSIT' : 'YELLOW SESSION'}
                        </motion.button>
                      )}
                    </>
                  )}
                </>
              ) : (
                <motion.button
                  onClick={handleWithdraw}
                  disabled={lottery.isPending || !depositAmount || userPrincipal === 0}
                  className="btn-bounce"
                  style={{
                    ...styles.withdrawButton,
                    opacity: (lottery.isPending || !depositAmount || userPrincipal === 0) ? 0.5 : 1,
                    cursor: (lottery.isPending || !depositAmount || userPrincipal === 0) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {lottery.isPending ? 'WITHDRAWING...' : 'WITHDRAW PRINCIPAL'}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Yellow Deposit Modal */}
        <YellowDepositModal
          isOpen={showYellowModal}
          onClose={() => setShowYellowModal(false)}
          poolAddress={LOTTERY_POOL_ADDRESS}
          poolName="Stablecoins Pool"
          onSuccess={() => {
            refetchBalance();
            vault.refetch?.();
          }}
        />

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
              <div style={styles.rulesGrid}>
                <div style={styles.ruleCard}>
                  <div style={styles.ruleNumber}>1</div>
                  <div style={styles.ruleText}>
                    <strong>Deposit during the 24-hour window</strong> at the start of each week
                  </div>
                </div>
                <div style={styles.ruleCard}>
                  <div style={styles.ruleNumber}>2</div>
                  <div style={styles.ruleText}>
                    <strong>Your deposit goes to Aave</strong> to earn yield (8% APY)
                  </div>
                </div>
                <div style={styles.ruleCard}>
                  <div style={styles.ruleNumber}>3</div>
                  <div style={styles.ruleText}>
                    <strong>1 USDC = 1 Ticket</strong> - More deposits = higher win chance
                  </div>
                </div>
                <div style={styles.ruleCard}>
                  <div style={styles.ruleNumber}>4</div>
                  <div style={styles.ruleText}>
                    <strong>Weekly draw via Chainlink VRF</strong> - provably random winner
                  </div>
                </div>
                <div style={styles.ruleCard}>
                  <div style={styles.ruleNumber}>5</div>
                  <div style={styles.ruleText}>
                    <strong>Winner gets ALL yield</strong> - your principal is always safe
                  </div>
                </div>
                <div style={styles.ruleCard}>
                  <div style={styles.ruleNumber}>6</div>
                  <div style={styles.ruleText}>
                    <strong>Withdraw anytime</strong> - get principal back, forfeit yield
                  </div>
                </div>
              </div>
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
    background: '#06d6a0',
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
    margin: '0 0 12px',
    textTransform: 'uppercase',
    letterSpacing: '-1px',
  },
  subtitle: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '18px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '20px',
  },
  badges: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
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
  badgeYellow: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    background: '#ffd23f',
    padding: '8px 20px',
    borderRadius: '20px',
    border: '3px solid #1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  warningBanner: {
    background: '#fff3cd',
    border: '4px solid #ffc107',
    borderRadius: '16px',
    padding: '16px 24px',
    marginBottom: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '16px',
    fontWeight: '700',
    color: '#856404',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 450px',
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
    color: '#06d6a0',
    margin: '0 0 8px',
    lineHeight: '1',
  },
  yieldNote: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    fontStyle: 'italic',
  },
  prizeDetails: {
    marginBottom: '30px',
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
  userBalanceCard: {
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    border: '4px solid #1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '30px',
  },
  balanceTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '18px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '0 0 16px',
    textTransform: 'uppercase',
  },
  balanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  balanceLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '4px',
  },
  balanceValue: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '20px',
    fontWeight: '900',
    color: '#1a1a1a',
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
    background: '#06d6a0',
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
  modeToggle: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '24px',
  },
  modeButton: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '16px',
    fontWeight: '700',
    color: '#666',
    background: '#f5f5f5',
    border: '3px solid #1a1a1a',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modeButtonActive: {
    background: '#00d4ff',
    color: '#1a1a1a',
    fontWeight: '900',
    boxShadow: '4px 4px 0 #1a1a1a',
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
    lineHeight: '1.5',
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
  warningBox: {
    background: '#fff3cd',
    border: '3px solid #ffc107',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  warningTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '14px',
    fontWeight: '900',
    color: '#856404',
    marginBottom: '4px',
  },
  warningText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '13px',
    fontWeight: '600',
    color: '#856404',
    lineHeight: '1.5',
  },
  depositButton: {
    width: '100%',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '18px',
    fontWeight: '900',
    color: '#1a1a1a',
    background: '#06d6a0',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '6px 6px 0 #1a1a1a',
    transition: 'all 0.15s',
  },
  yellowButton: {
    width: '100%',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '16px',
    fontWeight: '900',
    color: '#1a1a1a',
    background: 'linear-gradient(135deg, #ffd23f 0%, #ffed4e 100%)',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    padding: '14px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '6px 6px 0 #1a1a1a',
    transition: 'all 0.15s',
    marginTop: '8px',
  },
  withdrawButton: {
    width: '100%',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '18px',
    fontWeight: '900',
    color: '#ffffff',
    background: '#dc3545',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '6px 6px 0 #1a1a1a',
    transition: 'all 0.15s',
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
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
  },
  ruleCard: {
    background: '#f8f9fa',
    border: '3px solid #1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  ruleNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#06d6a0',
    border: '3px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '20px',
    fontWeight: '900',
    color: '#1a1a1a',
    flexShrink: 0,
  },
  ruleText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: '1.6',
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

export default StablecoinsPool;
