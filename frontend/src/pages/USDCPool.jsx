import { useState, useEffect } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  TrendingUp, 
  Users, 
  Trophy, 
  Lock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Zap
} from 'lucide-react';
import { useLotteryPoolUSDC } from '../hooks/useLotteryPoolUSDC';
import { useUSDCVault } from '../hooks/useUSDCVault';
import { useUSDCBalance, useUSDCAllowance, useUSDCApproval } from '../hooks/useUSDCApproval';
import { useCountdown } from '../hooks/useCountdown';
import { useDemoMode } from '../hooks/useDemoMode';

const SEPOLIA_CHAIN_ID = 11155111;
const LOTTERY_POOL_ADDRESS = import.meta.env.VITE_USDC_LOTTERY;

export function USDCPool() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [depositAmount, setDepositAmount] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Hooks
  const lottery = useLotteryPoolUSDC(address);
  const vault = useUSDCVault();
  const { balance: usdcBalance, refetch: refetchBalance } = useUSDCBalance(address);
  const { allowance, refetch: refetchAllowance } = useUSDCAllowance(address, LOTTERY_POOL_ADDRESS);
  const approval = useUSDCApproval(LOTTERY_POOL_ADDRESS);

  // Countdown timers
  const depositCountdown = useCountdown(lottery.depositWindowEnd);
  const prizeCountdown = useCountdown(lottery.prizeDrawTime);

  // Demo mode detection
  const demoMode = useDemoMode(lottery.depositWindowEnd, lottery.prizeDrawTime);

  // Check if user is on correct network
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;

  // Calculate time remaining (kept for compatibility, but prefer useCountdown)
  const getTimeRemaining = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = timestamp - now;
    
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  // Show toast notification
  const showNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  // Handle approval
  const handleApprove = async () => {
    try {
      await approval.approve(depositAmount);
    } catch (error) {
      showNotification('Approval failed', 'error');
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < lottery.minDeposit) {
      showNotification(`Minimum deposit is ${lottery.minDeposit} USDC`, 'error');
      return;
    }

    try {
      await lottery.deposit(depositAmount);
    } catch (error) {
      showNotification('Deposit failed', 'error');
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (lottery.userDeposits === 0) {
      showNotification('No deposits to withdraw', 'error');
      return;
    }

    try {
      await vault.withdraw(lottery.userDeposits, address, address);
    } catch (error) {
      showNotification('Withdrawal failed', 'error');
    }
  };

  // Handle start draw
  const handleStartDraw = async () => {
    try {
      await lottery.startDraw();
    } catch (error) {
      showNotification('Draw failed', 'error');
    }
  };

  // Effects for success notifications
  useEffect(() => {
    if (approval.isSuccess) {
      showNotification('✅ USDC Approved! Now you can deposit.');
      refetchAllowance();
    }
  }, [approval.isSuccess]);

  useEffect(() => {
    if (lottery.isDepositSuccess) {
      showNotification('🎉 Deposit successful! Depositing into Aave...');
      // Refetch will happen automatically from the hook
      refetchBalance();
      setDepositAmount('');
      
      // Reset transaction state after showing notification
      setTimeout(() => {
        lottery.resetDeposit?.();
      }, 3000);
    }
  }, [lottery.isDepositSuccess]);

  useEffect(() => {
    if (lottery.isWithdrawSuccess) {
      showNotification('💰 Withdrawal successful!');
      refetchBalance();
      
      setTimeout(() => {
        lottery.resetWithdraw?.();
      }, 3000);
    }
  }, [lottery.isWithdrawSuccess]);

  useEffect(() => {
    if (lottery.isDrawSuccess) {
      showNotification('🎲 Draw started! Waiting for Chainlink VRF...');
      
      setTimeout(() => {
        lottery.resetDraw?.();
      }, 3000);
    }
  }, [lottery.isDrawSuccess]);

  // Switch to Sepolia if needed
  const handleSwitchNetwork = () => {
    switchChain({ chainId: SEPOLIA_CHAIN_ID });
  };

  // Determine pool state
  const getPoolState = () => {
    if (lottery.depositWindowOpen) return 'deposit';
    if (lottery.drawPhaseActive) return 'draw';
    return 'locked';
  };

  const poolState = getPoolState();
  const needsApproval = parseFloat(depositAmount) > allowance;
  const canWithdraw = lottery.depositWindowOpen || poolState === 'deposit';

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {showToast && (
        <div
          style={{
            ...styles.toast,
            background: toastType === 'success' ? 'rgba(0, 255, 157, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            borderColor: toastType === 'success' ? 'var(--primary)' : 'rgba(239, 68, 68, 0.4)',
            color: toastType === 'success' ? 'var(--primary)' : 'rgb(248, 113, 113)',
          }}
          className="glass"
        >
          {toastType === 'success' ? <CheckCircle style={styles.toastIcon} /> : <AlertCircle style={styles.toastIcon} />}
          <span style={styles.toastText}>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.backButton} className="animate-fade-in-up">
        <button onClick={() => navigate('/pools')} style={styles.backButtonInner}>
          <ArrowLeft style={styles.backIcon} />
          <span style={styles.backText}>BACK TO POOLS</span>
        </button>
      </div>

      {/* Wrong Network Warning */}
      {isConnected && !isCorrectNetwork && (
        <div style={styles.warningBox} className="glass animate-fade-in-up stagger-2">
          <AlertCircle style={styles.warningIcon} />
          <div style={styles.warningContent}>
            <h3 style={styles.warningTitle}>WRONG NETWORK</h3>
            <p style={styles.warningText}>Please switch to Ethereum Sepolia to interact with the USDC Pool.</p>
            <button onClick={handleSwitchNetwork} style={styles.switchButton}>
              SWITCH TO SEPOLIA
            </button>
          </div>
        </div>
      )}

      {/* Pool Header */}
      <div style={styles.poolHeader} className="glass animate-fade-in-up stagger-2">
        <div style={styles.poolHeaderContent}>
          <div>
            <p style={styles.poolSubtitle}>NO-LOSS LOTTERY</p>
            <h1 style={styles.poolTitle}>
              <span className="text-gradient">USDC Pool</span>
            </h1>
            <p style={styles.poolDescription}>Powered by Aave V3 on Ethereum Sepolia</p>
          </div>
          <div style={styles.roundBadge} className="glass">
            <div style={styles.roundLabel}>ROUND</div>
            <div style={styles.roundNumber}>#{lottery.currentRound}</div>
          </div>
        </div>

        {/* Demo Mode Badge */}
        {demoMode.isDemoMode && (
          <div style={styles.demoBadge} className="glass">
            <Zap style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
            <span style={styles.demoText}>
              ⚡ DEMO MODE (Fast Rounds on Testnet) - Deposit: {demoMode.depositWindowFormatted} | Round: {demoMode.roundDurationFormatted}
            </span>
          </div>
        )}

        {/* Pool State Badge */}
        <div style={styles.stateBadges}>
          <span
            style={{
              ...styles.stateBadge,
              background: poolState === 'deposit' ? 'rgba(0, 255, 157, 0.2)' :
                         poolState === 'draw' ? 'rgba(168, 85, 247, 0.2)' :
                         'rgba(251, 146, 60, 0.2)',
              color: poolState === 'deposit' ? 'var(--primary)' :
                     poolState === 'draw' ? 'rgb(192, 132, 252)' :
                     'rgb(251, 146, 60)',
              borderColor: poolState === 'deposit' ? 'var(--primary)' :
                          poolState === 'draw' ? 'rgba(168, 85, 247, 0.4)' :
                          'rgba(251, 146, 60, 0.4)',
            }}
          >
            {poolState === 'deposit' && <span style={styles.statusPulse} />}
            {poolState === 'deposit' && 'DEPOSIT WINDOW OPEN'}
            {poolState === 'draw' && 'DRAW PHASE ACTIVE'}
            {poolState === 'locked' && 'PRIZE PERIOD (LOCKED)'}
          </span>
          <span style={styles.timeRemaining} className="font-mono">
            <Clock style={styles.timeIcon} />
            {poolState === 'deposit' && `CLOSES IN: ${depositCountdown.formatted}`}
            {poolState === 'locked' && `DRAW IN: ${prizeCountdown.formatted}`}
            {poolState === 'draw' && 'READY FOR DRAW'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid} className="animate-fade-in-up stagger-3">
        <div style={styles.statCard} className="glass hover-lift">
          <div style={styles.statHeader}>
            <TrendingUp style={styles.statIcon} />
            <span style={styles.statLabel}>TOTAL POOL VALUE</span>
          </div>
          <div style={styles.statValue}>${vault.totalAssets.toLocaleString()}</div>
          <div style={styles.statSubtext}>USDC IN AAVE V3</div>
        </div>

        <div style={styles.statCard} className="glass hover-lift">
          <div style={styles.statHeader}>
            <Users style={styles.statIcon} />
            <span style={styles.statLabel}>YOUR DEPOSITS</span>
          </div>
          <div style={styles.statValue}>${lottery.userDeposits.toLocaleString()}</div>
          <div style={styles.statSubtext}>USDC DEPOSITED</div>
        </div>

        <div style={styles.statCard} className="glass hover-lift">
          <div style={styles.statHeader}>
            <Trophy style={styles.statIcon} />
            <span style={styles.statLabel}>MIN DEPOSIT</span>
          </div>
          <div style={styles.statValue}>${lottery.minDeposit}</div>
          <div style={styles.statSubtext}>USDC MINIMUM</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={styles.mainGrid} className="animate-fade-in-up stagger-4">
        {/* Deposit Section */}
        <div style={styles.actionCard} className="glass">
          <h2 style={styles.actionTitle}>
            <span className="text-gradient">Deposit USDC</span>
          </h2>

          {!isConnected ? (
            <div style={styles.emptyState}>
              <Lock style={styles.emptyIcon} />
              <p style={styles.emptyText}>Connect wallet to deposit</p>
            </div>
          ) : !isCorrectNetwork ? (
            <div style={styles.emptyState}>
              <Lock style={styles.emptyIcon} />
              <p style={styles.emptyText}>Switch to Sepolia network</p>
            </div>
          ) : !lottery.depositWindowOpen ? (
            <div style={styles.emptyState}>
              <Lock style={styles.emptyIcon} />
              <p style={styles.emptyText}>Deposits are currently closed</p>
              <p style={styles.emptySubtext}>
                {poolState === 'locked' && `Opens after draw in ${getTimeRemaining(lottery.prizeDrawTime)}`}
                {poolState === 'draw' && 'Waiting for draw to complete'}
              </p>
            </div>
          ) : (
            <>
              <div style={styles.inputGroup}>
                <div style={styles.inputHeader}>
                  <label style={styles.inputLabel}>AMOUNT (USDC)</label>
                  <span style={styles.balanceText}>BALANCE: {usdcBalance.toFixed(2)}</span>
                </div>
                <div style={styles.inputWrapper} className="glass">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={`MIN: ${lottery.minDeposit}`}
                    style={styles.input}
                  />
                </div>
                <button onClick={() => setDepositAmount(usdcBalance.toString())} style={styles.maxButton}>
                  USE MAX
                </button>
              </div>

              {/* Step Indicator */}
              <div style={styles.stepIndicator} className="font-mono">
                <div style={styles.stepItem}>
                  <span style={{
                    ...styles.stepNumber,
                    background: needsApproval ? 'var(--primary)' : 'rgba(0, 255, 157, 0.3)',
                    color: needsApproval ? '#000' : 'var(--primary)',
                  }}>1</span>
                  <span style={{ color: needsApproval ? 'var(--primary)' : 'rgba(255, 255, 255, 0.5)' }}>
                    {needsApproval ? 'Approve USDC' : '✓ Approved'}
                  </span>
                </div>
                <div style={styles.stepArrow}>→</div>
                <div style={styles.stepItem}>
                  <span style={{
                    ...styles.stepNumber,
                    background: !needsApproval ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                    color: !needsApproval ? '#000' : 'rgba(255, 255, 255, 0.3)',
                  }}>2</span>
                  <span style={{ color: !needsApproval ? 'var(--primary)' : 'rgba(255, 255, 255, 0.3)' }}>
                    Deposit to Pool
                  </span>
                </div>
              </div>

              {needsApproval ? (
                <button
                  onClick={handleApprove}
                  disabled={approval.isPending || !depositAmount}
                  style={{
                    ...styles.primaryButton,
                    borderColor: 'rgb(168, 85, 247)',
                    color: 'rgb(168, 85, 247)',
                    opacity: (approval.isPending || !depositAmount) ? 0.5 : 1,
                    cursor: (approval.isPending || !depositAmount) ? 'not-allowed' : 'pointer',
                  }}
                  className="group font-mono"
                >
                  <span style={{ position: 'relative', zIndex: 10 }}>
                    {approval.isPending ? (
                      <>
                        <Loader2 style={styles.buttonSpinner} />
                        STEP 1: APPROVING...
                      </>
                    ) : (
                      `STEP 1: APPROVE ${depositAmount || '0'} USDC`
                    )}
                  </span>
                  {!approval.isPending && <span style={styles.buttonBg} />}
                </button>
              ) : (
                <>
                  <div style={styles.approvalSuccess} className="font-mono">
                    ✓ Approval Complete! Now click DEPOSIT to send USDC to the pool
                  </div>
                  <button
                    onClick={handleDeposit}
                    disabled={lottery.isDepositPending || !depositAmount || parseFloat(depositAmount) < lottery.minDeposit}
                    style={{
                      ...styles.primaryButton,
                      opacity: (lottery.isDepositPending || !depositAmount || parseFloat(depositAmount) < lottery.minDeposit) ? 0.5 : 1,
                      cursor: (lottery.isDepositPending || !depositAmount || parseFloat(depositAmount) < lottery.minDeposit) ? 'not-allowed' : 'pointer',
                    }}
                    className="group font-mono"
                  >
                    <span style={{ position: 'relative', zIndex: 10 }}>
                      {lottery.isDepositPending ? (
                        <>
                          <Loader2 style={styles.buttonSpinner} />
                          STEP 2: DEPOSITING INTO AAVE...
                        </>
                      ) : (
                        `STEP 2: DEPOSIT ${depositAmount || '0'} USDC`
                      )}
                    </span>
                    {!lottery.isDepositPending && <span style={styles.buttonBg} />}
                  </button>
                </>
              )}

              {/* Status Messages */}
              {approval.isPending && (
                <div style={styles.statusMessage} className="font-mono">
                  ⏳ Confirm approval in MetaMask...
                </div>
              )}
              {lottery.isDepositPending && (
                <div style={styles.statusMessage} className="font-mono">
                  📥 Depositing into Aave V3... Your USDC is being supplied to earn yield!
                </div>
              )}

              {approval.hash && (
                <div style={styles.txLink}>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${approval.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    VIEW APPROVAL TX →
                  </a>
                </div>
              )}

              {lottery.depositHash && (
                <div style={styles.txLink}>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${lottery.depositHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    VIEW DEPOSIT TX →
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Withdraw Section */}
        <div style={styles.actionCard} className="glass">
          <h2 style={styles.actionTitle}>
            <span className="text-gradient">Withdraw Principal</span>
          </h2>

          {!isConnected ? (
            <div style={styles.emptyState}>
              <Lock style={styles.emptyIcon} />
              <p style={styles.emptyText}>Connect wallet to withdraw</p>
            </div>
          ) : !isCorrectNetwork ? (
            <div style={styles.emptyState}>
              <Lock style={styles.emptyIcon} />
              <p style={styles.emptyText}>Switch to Sepolia network</p>
            </div>
          ) : !canWithdraw ? (
            <div style={styles.emptyState}>
              <Lock style={styles.emptyIcon} />
              <p style={styles.emptyText}>Withdrawals locked during prize period</p>
              <p style={styles.emptySubtext}>Available after draw completes</p>
            </div>
          ) : (
            <>
              <div style={styles.withdrawAmount} className="glass">
                <div style={styles.withdrawLabel}>AVAILABLE TO WITHDRAW</div>
                <div style={styles.withdrawValue}>${lottery.userDeposits.toLocaleString()}</div>
                <div style={styles.withdrawUnit}>USDC</div>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={vault.isWithdrawPending || lottery.userDeposits === 0}
                style={{
                  ...styles.primaryButton,
                  borderColor: 'rgb(251, 146, 60)',
                  color: 'rgb(251, 146, 60)',
                  opacity: (vault.isWithdrawPending || lottery.userDeposits === 0) ? 0.5 : 1,
                  cursor: (vault.isWithdrawPending || lottery.userDeposits === 0) ? 'not-allowed' : 'pointer',
                }}
                className="group"
              >
                <span style={{ position: 'relative', zIndex: 10 }}>
                  {vault.isWithdrawPending ? (
                    <>
                      <Loader2 style={styles.buttonSpinner} />
                      WITHDRAWING...
                    </>
                  ) : (
                    'WITHDRAW ALL'
                  )}
                </span>
                {!vault.isWithdrawPending && <span style={styles.buttonBg} />}
              </button>

              {vault.withdrawHash && (
                <div style={styles.txLink}>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${vault.withdrawHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                  >
                    VIEW WITHDRAWAL TX →
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Draw Section */}
      {poolState === 'draw' && (
        <div style={styles.drawSection} className="glass animate-fade-in-up stagger-5">
          <Trophy style={styles.drawIcon} />
          <h2 style={styles.drawTitle}>
            <span className="text-gradient">Ready for Draw!</span>
          </h2>
          <p style={styles.drawText}>
            The prize period has ended. Anyone can trigger the draw using Chainlink VRF.
          </p>
          <button
            onClick={handleStartDraw}
            disabled={lottery.isDrawPending}
            style={{
              ...styles.drawButton,
              opacity: lottery.isDrawPending ? 0.5 : 1,
              cursor: lottery.isDrawPending ? 'not-allowed' : 'pointer',
            }}
            className="group"
          >
            <span style={{ position: 'relative', zIndex: 10 }}>
              {lottery.isDrawPending ? (
                <>
                  <Loader2 style={styles.buttonSpinner} />
                  STARTING DRAW...
                </>
              ) : (
                'START DRAW'
              )}
            </span>
            {!lottery.isDrawPending && <span style={styles.buttonBg} />}
          </button>
          {lottery.drawHash && (
            <div style={styles.txLink}>
              <a
                href={`https://sepolia.etherscan.io/tx/${lottery.drawHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                VIEW DRAW TX →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Winner Display */}
      {lottery.roundWinner && lottery.roundWinner !== '0x0000000000000000000000000000000000000000' && (
        <div style={styles.winnerSection} className="glass animate-fade-in-up stagger-6">
          <Trophy style={styles.winnerIcon} />
          <h2 style={styles.winnerTitle}>
            <span className="text-gradient">Last Round Winner</span>
          </h2>
          <div style={styles.winnerDetails} className="glass">
            <div style={styles.winnerField}>
              <div style={styles.winnerLabel}>WINNER ADDRESS</div>
              <div style={styles.winnerAddress}>{lottery.roundWinner}</div>
            </div>
            <div style={styles.winnerField}>
              <div style={styles.winnerLabel}>PRIZE AMOUNT</div>
              <div style={styles.winnerPrize}>${lottery.roundPrize.toLocaleString()}</div>
              <div style={styles.winnerUnit}>USDC</div>
            </div>
          </div>
          <div style={styles.winnerRound}>ROUND #{lottery.currentRound - 1}</div>
        </div>
      )}

      {/* Info Terminal */}
      <div style={styles.infoTerminal} className="glass animate-fade-in-up stagger-7">
        <div style={styles.terminalHeader}>
          <div style={styles.terminalDots}>
            <div style={{ ...styles.dot, background: '#ff5f56' }} />
            <div style={{ ...styles.dot, background: '#ffbd2e' }} />
            <div style={{ ...styles.dot, background: '#27c93f' }} />
          </div>
          <div style={styles.terminalTitle}>
            <AlertCircle style={styles.terminalTitleIcon} />
            IMPORTANT INFORMATION
          </div>
        </div>
        <pre style={styles.infoContent}>
{`┌────────────────────────────────────────────────────┐
│                                                    │
│  → Principal is always safe and withdrawable       │
│    (when not locked during prize period)           │
│                                                    │
│  → Only Aave V3 yield is used for prizes          │
│                                                    │
│  → Deposits locked during 7-day prize period       │
│                                                    │
│  → Winners selected via Chainlink VRF              │
│                                                    │
│  → Minimum deposit: $${String(lottery.minDeposit).padEnd(26)}│
│                                                    │
└────────────────────────────────────────────────────┘`}
        </pre>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '6rem 1.5rem 4rem',
    width: '100%',
  },
  toast: {
    position: 'fixed',
    top: '6rem',
    right: '1rem',
    zIndex: 50,
    padding: '1rem 1.5rem',
    borderRadius: 'var(--radius)',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
  },
  toastIcon: {
    width: '1.25rem',
    height: '1.25rem',
    flexShrink: 0,
  },
  toastText: {
    fontFamily: 'monospace',
  },
  backButton: {
    marginBottom: '2rem',
  },
  backButtonInner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'color 0.3s',
    padding: 0,
  },
  backIcon: {
    width: '1.25rem',
    height: '1.25rem',
  },
  backText: {
    letterSpacing: '0.05em',
  },
  warningBox: {
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(251, 146, 60, 0.4)',
    background: 'rgba(251, 146, 60, 0.1)',
    padding: '1.5rem',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  warningIcon: {
    width: '1.5rem',
    height: '1.5rem',
    color: 'rgb(251, 146, 60)',
    flexShrink: 0,
    marginTop: '0.25rem',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'rgb(251, 146, 60)',
    marginBottom: '0.5rem',
    letterSpacing: '0.05em',
  },
  warningText: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '1rem',
  },
  switchButton: {
    padding: '0.5rem 1.5rem',
    background: 'rgb(251, 146, 60)',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#000000',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  poolHeader: {
    position: 'relative',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--primary)',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '2rem',
    marginBottom: '2rem',
  },
  poolHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  poolSubtitle: {
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    color: 'var(--primary)',
    marginBottom: '0.5rem',
  },
  poolTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    fontFamily: 'monospace',
  },
  poolDescription: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  roundBadge: {
    textAlign: 'center',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--primary)',
    background: 'rgba(0, 255, 157, 0.1)',
    padding: '1rem',
    minWidth: '100px',
  },
  roundLabel: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '0.25rem',
    letterSpacing: '0.1em',
  },
  roundNumber: {
    fontFamily: 'monospace',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'var(--primary)',
  },
  stateBadges: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  stateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  statusPulse: {
    height: '0.5rem',
    width: '0.5rem',
    borderRadius: '50%',
    background: 'var(--primary)',
    animation: 'pulse 2s infinite',
  },
  timeRemaining: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  timeIcon: {
    width: '1rem',
    height: '1rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    position: 'relative',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '1.5rem',
    transition: 'all 0.3s',
  },
  statHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  statIcon: {
    width: '1.25rem',
    height: '1.25rem',
    color: 'var(--primary)',
  },
  statLabel: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontFamily: 'monospace',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '0.25rem',
  },
  statSubtext: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.05em',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  actionCard: {
    position: 'relative',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '2rem',
  },
  actionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    fontFamily: 'monospace',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 0',
  },
  emptyIcon: {
    width: '3rem',
    height: '3rem',
    color: 'rgba(255, 255, 255, 0.2)',
    margin: '0 auto 1rem',
  },
  emptyText: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '0.5rem',
  },
  emptySubtext: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.3)',
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  inputHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  inputLabel: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '0.05em',
  },
  balanceText: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  inputWrapper: {
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '0.75rem',
  },
  input: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: 'monospace',
    fontSize: '1rem',
    color: '#ffffff',
  },
  maxButton: {
    marginTop: '0.5rem',
    background: 'transparent',
    border: 'none',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'var(--primary)',
    cursor: 'pointer',
    padding: 0,
    transition: 'color 0.3s',
  },
  primaryButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--primary)',
    background: 'transparent',
    padding: '1rem 1.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--primary)',
    letterSpacing: '0.05em',
    transition: 'all 0.3s',
  },
  buttonBg: {
    position: 'absolute',
    inset: 0,
    background: 'var(--primary)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s',
    zIndex: 0,
  },
  buttonSpinner: {
    width: '1.25rem',
    height: '1.25rem',
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
  },
  txLink: {
    marginTop: '1rem',
  },
  link: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'var(--primary)',
    textDecoration: 'none',
    transition: 'opacity 0.3s',
  },
  withdrawAmount: {
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  withdrawLabel: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '0.5rem',
    letterSpacing: '0.05em',
  },
  withdrawValue: {
    fontFamily: 'monospace',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'var(--primary)',
    marginBottom: '0.25rem',
  },
  withdrawUnit: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  drawSection: {
    position: 'relative',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(168, 85, 247, 0.4)',
    background: 'rgba(168, 85, 247, 0.1)',
    padding: '3rem 2rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  drawIcon: {
    width: '4rem',
    height: '4rem',
    color: 'rgb(192, 132, 252)',
    margin: '0 auto 1rem',
  },
  drawTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    fontFamily: 'monospace',
  },
  drawText: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '1.5rem',
    maxWidth: '500px',
    margin: '0 auto 1.5rem',
  },
  drawButton: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    border: '1px solid rgb(168, 85, 247)',
    background: 'transparent',
    padding: '1rem 2rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'rgb(168, 85, 247)',
    letterSpacing: '0.05em',
    transition: 'all 0.3s',
  },
  winnerSection: {
    position: 'relative',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(234, 179, 8, 0.4)',
    background: 'rgba(234, 179, 8, 0.1)',
    padding: '3rem 2rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  winnerIcon: {
    width: '4rem',
    height: '4rem',
    color: 'rgb(250, 204, 21)',
    margin: '0 auto 1rem',
  },
  winnerTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    fontFamily: 'monospace',
  },
  winnerDetails: {
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '1.5rem',
    marginBottom: '1rem',
    maxWidth: '600px',
    margin: '0 auto 1rem',
  },
  winnerField: {
    marginBottom: '1.5rem',
  },
  winnerLabel: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: '0.5rem',
    letterSpacing: '0.05em',
  },
  winnerAddress: {
    fontFamily: 'monospace',
    fontSize: '1rem',
    color: 'var(--primary)',
    wordBreak: 'break-all',
  },
  winnerPrize: {
    fontFamily: 'monospace',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'rgb(250, 204, 21)',
    marginBottom: '0.25rem',
  },
  winnerUnit: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  winnerRound: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  infoTerminal: {
    position: 'relative',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '2rem 1.5rem 1.5rem',
  },
  terminalHeader: {
    position: 'relative',
    marginBottom: '1rem',
  },
  terminalDots: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  dot: {
    height: '0.5rem',
    width: '0.5rem',
    borderRadius: '50%',
  },
  terminalTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--primary)',
    letterSpacing: '0.05em',
  },
  terminalTitleIcon: {
    width: '1rem',
    height: '1rem',
  },
  infoContent: {
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    lineHeight: '1.5',
    color: 'var(--primary)',
    whiteSpace: 'pre',
    margin: 0,
    overflow: 'auto',
  },
  demoBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    marginTop: '1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(251, 191, 36, 0.4)',
    background: 'rgba(251, 191, 36, 0.1)',
  },
  demoText: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'rgb(252, 211, 77)',
    letterSpacing: '0.05em',
    fontWeight: '600',
  },
  statusMessage: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius)',
    background: 'rgba(0, 255, 157, 0.1)',
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    borderRadius: 'var(--radius)',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  stepNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    transition: 'all 0.3s',
  },
  stepArrow: {
    fontSize: '1.5rem',
    color: 'rgba(255, 255, 255, 0.3)',
  },
  approvalSuccess: {
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    borderRadius: 'var(--radius)',
    background: 'rgba(0, 255, 157, 0.15)',
    border: '1px solid var(--primary)',
    color: 'var(--primary)',
    fontSize: '0.875rem',
    textAlign: 'center',
    animation: 'pulse 2s ease-in-out infinite',
  },
    border: '1px solid rgba(0, 255, 157, 0.2)',
    color: 'var(--primary)',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
};