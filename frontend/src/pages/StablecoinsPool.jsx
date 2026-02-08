import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Trophy, Wallet, CheckCircle } from 'lucide-react';
import { parseUnits, formatUnits } from 'viem';
import { DepositOptionsModal } from '../components/DepositOptionsModal';
import { YellowDepositModal } from '../components/YellowDepositModal';
import { LiFiBridgeModal } from '../components/LiFiBridgeModal';
import { useYellowNetwork } from '../hooks/useYellowNetwork';
import { useLotteryPoolUSDC } from '../hooks/useLotteryPoolUSDC';
import { useUSDCBalance, useUSDCAllowance, useUSDCApproval } from '../hooks/useUSDCApproval';
import LotteryPoolUSBCABI from '../abis/LotteryPoolUSDC.json';

const SEPOLIA_CHAIN_ID = 11155111;
const LOTTERY_POOL_ADDRESS = import.meta.env.VITE_USDC_LOTTERY;
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;

export function StablecoinsPool() {
  const navigate = useNavigate();
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  
  const [activeTab, setActiveTab] = useState('RULES');
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showYellowModal, setShowYellowModal] = useState(false);
  const [showBridgeModal, setShowBridgeModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  
  const { hasActiveSession } = useYellowNetwork();
  
  // Contract hooks
  const lotteryData = useLotteryPoolUSDC(address);
  const { balance: usdcBalance, refetch: refetchBalance } = useUSDCBalance(address);
  const { allowance, refetch: refetchAllowance } = useUSDCAllowance(address, LOTTERY_POOL_ADDRESS);
  const { approve, isPending: isApprovePending, isSuccess: isApproveSuccess, reset: resetApprove } = useUSDCApproval(LOTTERY_POOL_ADDRESS);
  
  // Deposit transaction
  const { data: depositHash, writeContract, isPending: isDepositPending, error: depositError } = useWriteContract();
  const { isLoading: isDepositConfirming, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });
  
  // Reset approval state after success
  useEffect(() => {
    if (isApproveSuccess) {
      refetchAllowance();
      setTimeout(() => resetApprove(), 2000);
    }
  }, [isApproveSuccess, refetchAllowance, resetApprove]);
  
  // Refetch balances after successful deposit
  useEffect(() => {
    if (isDepositSuccess) {
      refetchBalance();
      lotteryData.refetchUserDeposits();
      lotteryData.refetchPlayers();
      setDepositAmount('');
    }
  }, [isDepositSuccess]);
  
  const isWrongNetwork = chain?.id !== SEPOLIA_CHAIN_ID;
  
  // Calculate time remaining until deposit window ends
  const getTimeRemaining = () => {
    if (!lotteryData.depositWindowEnd) return 'Loading...';
    const now = Math.floor(Date.now() / 1000);
    const end = Number(lotteryData.depositWindowEnd);
    const diff = end - now;
    
    if (diff <= 0) return 'Draw Ready';
    
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    
    return `${days}d ${hours}h ${mins}m`;
  };
  
  // Format user deposit amount
  const userDepositAmount = lotteryData.userDeposits 
    ? Number(formatUnits(lotteryData.userDeposits, 6)).toFixed(2)
    : '0.00';
    
  // Format total pool size (number of players * their deposits)
  const totalPoolSize = lotteryData.playersData?.length || 0;
  
  // Calculate current prize (set to $0)
  const currentPrize = '$0';
    
  // Calculate odds (1 in total players)
  const odds = totalPoolSize > 0 ? `1 in ${totalPoolSize}` : '1 in 1';
  
  const handleApprove = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    setIsApproving(true);
    try {
      await approve(depositAmount);
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setIsApproving(false);
    }
  };
  
  const handleDeposit = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (isWrongNetwork) {
      switchChain({ chainId: SEPOLIA_CHAIN_ID });
      return;
    }
    
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }
    
    const amount = parseFloat(depositAmount);
    
    if (amount > usdcBalance) {
      alert(`Insufficient USDC balance. You have ${usdcBalance.toFixed(2)} USDC`);
      return;
    }
    
    // Check if deposit is open
    if (!lotteryData.depositWindowOpen) {
      alert('Deposit window is currently closed. Please wait for the next round.');
      return;
    }
    
    // Check allowance
    if (allowance < amount) {
      alert('Please approve USDC spending first by clicking the APPROVE button');
      return;
    }
    
    try {
      const amountInWei = parseUnits(depositAmount, 6);
      
      writeContract({
        address: LOTTERY_POOL_ADDRESS,
        abi: LotteryPoolUSBCABI,
        functionName: 'deposit',
        args: [amountInWei],
      });
    } catch (err) {
      console.error('Deposit failed:', err);
      alert(`Deposit failed: ${err.message}`);
    }
  };
  
  const needsApproval = depositAmount && parseFloat(depositAmount) > allowance;

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
              <div style={styles.prizeAmount}>{currentPrize}</div>
            </div>

            <div style={styles.prizeDetails}>
              <div style={styles.detailRow}>
                <div style={styles.detailItem}>
                  <Clock size={20} style={{ color: '#1a1a1a' }} />
                  <div>
                    <div style={styles.detailLabel}>TIME LEFT</div>
                    <div style={styles.detailValue}>{getTimeRemaining()}</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <Trophy size={20} style={{ color: '#1a1a1a' }} />
                  <div>
                    <div style={styles.detailLabel}>ODDS</div>
                    <div style={styles.detailValue}>{odds}</div>
                  </div>
                </div>
              </div>
              <div style={styles.trophyIcon}>🏆</div>
            </div>

            {/* Pool Progress */}
            <div style={styles.progressSection}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Pool Progress</span>
                <span style={styles.progressAmount}>{totalPoolSize} players</span>
              </div>
              <div style={styles.progressBarContainer}>
                <motion.div
                  style={styles.progressBarFill}
                  initial={{ width: 0 }}
                  animate={{ width: totalPoolSize > 0 ? `${Math.min((totalPoolSize / 100) * 100, 100)}%` : '0%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
            
            {/* User Stats */}
            {isConnected && (
              <div style={styles.statsGrid}>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Your Deposit</div>
                  <div style={styles.statValue}>${userDepositAmount}</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Your Balance</div>
                  <div style={styles.statValue}>{usdcBalance.toFixed(2)} USDC</div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Card - Deposit */}
          <motion.div
            style={styles.depositCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h2 style={styles.depositTitle}>DIRECT DEPOSIT</h2>
            <p style={styles.depositSubtitle}>
              {!isConnected ? 'Connect wallet to deposit' : 
               isWrongNetwork ? 'Switch to Sepolia network' :
               !lotteryData.depositWindowOpen ? 'Deposit window closed' :
               'Enter amount to deposit'}
            </p>
            
            <div style={styles.depositForm}>
              {isConnected && !isWrongNetwork ? (
                <>
                  <div style={styles.inputGroup}>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      style={styles.input}
                      disabled={!lotteryData.depositWindowOpen}
                    />
                    <span style={styles.inputLabel}>USDC</span>
                  </div>
                  
                  <div style={styles.inputInfo}>
                    <span style={styles.inputInfoText}>
                      Balance: {usdcBalance.toFixed(2)} USDC
                    </span>
                    <button
                      onClick={() => setDepositAmount(usdcBalance.toFixed(2))}
                      style={styles.maxButton}
                      disabled={!lotteryData.depositWindowOpen}
                    >
                      MAX
                    </button>
                  </div>
                  
                  {needsApproval ? (
                    <button
                      onClick={handleApprove}
                      disabled={isApprovePending || isApproving || !lotteryData.depositWindowOpen}
                      style={{
                        ...styles.depositButton,
                        background: isApproveSuccess ? '#06d6a0' : '#ffd23f',
                        opacity: (!lotteryData.depositWindowOpen || isApprovePending) ? 0.6 : 1,
                      }}
                      className="btn-bounce"
                    >
                      {isApprovePending || isApproving ? '⏳ APPROVING...' : 
                       isApproveSuccess ? '✅ APPROVED!' :
                       '🔓 APPROVE USDC'}
                    </button>
                  ) : (
                    <button
                      onClick={handleDeposit}
                      disabled={isDepositPending || isDepositConfirming || !depositAmount || !lotteryData.depositWindowOpen}
                      style={{
                        ...styles.depositButton,
                        background: isDepositSuccess ? '#06d6a0' : '#00d4ff',
                        opacity: (!lotteryData.depositWindowOpen || isDepositPending || isDepositConfirming || !depositAmount) ? 0.6 : 1,
                      }}
                      className="btn-bounce"
                    >
                      {isDepositPending || isDepositConfirming ? '⏳ DEPOSITING...' :
                       isDepositSuccess ? '✅ DEPOSITED!' :
                       '💸 DEPOSIT NOW'}
                    </button>
                  )}
                  
                  {depositError && (
                    <div style={styles.errorBox}>
                      ❌ {depositError.message}
                    </div>
                  )}
                  
                  <div style={styles.divider}>OR</div>
                  
                  <button 
                    onClick={() => setShowBridgeModal(true)}
                    style={styles.bridgeButton}
                    className="btn-bounce"
                  >
                    🌉 BRIDGE FROM ANY CHAIN
                  </button>
                  
                  <div style={styles.divider}>DEMO</div>
                  
                  <button 
                    onClick={() => navigate('/demo')}
                    style={styles.demoButton}
                    className="btn-bounce"
                  >
                    ⏩ SIMULATE 1 WEEK
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    if (!isConnected) {
                      alert('Please connect your wallet from the top menu');
                    } else if (isWrongNetwork) {
                      switchChain({ chainId: SEPOLIA_CHAIN_ID });
                    }
                  }}
                  style={styles.depositButton}
                  className="btn-bounce"
                >
                  {!isConnected ? '🔗 CONNECT WALLET' : '🔄 SWITCH TO SEPOLIA'}
                </button>
              )}
            </div>
            
            <div style={styles.infoBox}>
              <span style={styles.infoEmoji}>ℹ️</span>
              <p style={styles.infoText}>
                {lotteryData.depositWindowOpen 
                  ? 'Your deposit earns yield on Aave. Withdraw anytime with no loss!'
                  : 'Deposit window is closed. Please wait for the next round to start.'}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Deposit Options Modal */}
        <DepositOptionsModal
          isOpen={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          poolName="Stablecoins Pool"
          targetChainId={SEPOLIA_CHAIN_ID}
          supportedAssets={['USDC', 'USDT', 'DAI']}
          onDirectDeposit={() => {
            alert('🚀 Direct Deposit Feature\n\nThis will allow you to deposit stablecoins directly from your wallet.');
            setShowOptionsModal(false);
          }}
          onYellowDeposit={() => {
            setShowYellowModal(true);
          }}
          onBridgeDeposit={() => {
            setShowBridgeModal(true);
            setShowOptionsModal(false);
          }}
        />

        {/* Yellow Deposit Modal */}
        <YellowDepositModal
          isOpen={showYellowModal}
          onClose={() => setShowYellowModal(false)}
          poolAddress={LOTTERY_POOL_ADDRESS}
          poolName="Stablecoins Pool"
          onSuccess={() => {
            setShowOptionsModal(false);
          }}
        />

        {/* LI.FI Bridge Modal */}
        <LiFiBridgeModal
          isOpen={showBridgeModal}
          onClose={() => setShowBridgeModal(false)}
          poolName="Stablecoins Pool"
          poolAddress={LOTTERY_POOL_ADDRESS}
          targetAsset="USDC"
          targetChainId={8453}
          onSuccess={() => {
            setShowOptionsModal(false);
            setShowBridgeModal(false);
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
            <motion.div style={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <ol style={styles.rulesList}>
                <li style={styles.ruleItem}><strong>Deposit stablecoins into the pool to get tickets.</strong></li>
                <li style={styles.ruleItem}><strong>1 USDC = 1 Ticket. More tickets = higher chance to win.</strong></li>
              </ol>
            </motion.div>
          )}
          {activeTab === 'WINNERS' && (
            <motion.div style={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <p style={styles.comingSoon}>🏆 Winners history coming soon...</p>
            </motion.div>
          )}
          {activeTab === 'ACTIVITY' && (
            <motion.div style={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <p style={styles.comingSoon}>📊 Activity feed coming soon...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#ffffff', position: 'relative', overflow: 'hidden' },
  content: { maxWidth: '1400px', margin: '0 auto', padding: '100px 40px 40px', position: 'relative', zIndex: 1 },
  backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', cursor: 'pointer', padding: '0', marginBottom: '30px', transition: 'all 0.2s' },
  titleSection: { textAlign: 'center', marginBottom: '40px' },
  iconCircle: { width: '80px', height: '80px', borderRadius: '50%', background: '#06d6a0', border: '5px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: '900', color: '#1a1a1a', margin: '0 auto 20px', boxShadow: '8px 8px 0 #1a1a1a' },
  title: { fontFamily: '"Fredoka", sans-serif', fontSize: '48px', fontWeight: '900', color: '#1a1a1a', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '-1px' },
  badges: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' },
  badgeCyan: { fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '700', color: '#1a1a1a', background: '#00d4ff', padding: '8px 20px', borderRadius: '20px', border: '3px solid #1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  badgeGrey: { fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '700', color: '#1a1a1a', background: '#e0e0e0', padding: '8px 20px', borderRadius: '20px', border: '3px solid #1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px', marginBottom: '40px' },
  prizeCard: { background: '#ffffff', border: '5px solid #1a1a1a', borderRadius: '20px', padding: '40px', boxShadow: '12px 12px 0 #1a1a1a', transition: 'all 0.2s' },
  prizeHeader: { marginBottom: '30px' },
  prizeLabel: { fontFamily: '"Comic Neue", cursive', fontSize: '16px', fontWeight: '700', color: '#666', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1px' },
  prizeAmount: { fontFamily: '"Fredoka", sans-serif', fontSize: '72px', fontWeight: '900', color: '#06d6a0', margin: '0', lineHeight: '1' },
  prizeDetails: { background: '#f8f9fa', border: '4px solid #1a1a1a', borderRadius: '16px', padding: '24px', marginBottom: '30px', position: 'relative' },
  detailRow: { display: 'flex', gap: '30px', marginBottom: '10px' },
  detailItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  detailLabel: { fontFamily: '"Comic Neue", cursive', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { fontFamily: '"Fredoka", sans-serif', fontSize: '20px', fontWeight: '900', color: '#1a1a1a' },
  trophyIcon: { position: 'absolute', right: '20px', top: '20px', fontSize: '48px', opacity: 0.15 },
  progressSection: { marginBottom: '30px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  progressLabel: { fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '600', color: '#666' },
  progressAmount: { fontFamily: '"Fredoka", sans-serif', fontSize: '14px', fontWeight: '900', color: '#1a1a1a' },
  progressBarContainer: { height: '12px', background: '#e0e0e0', borderRadius: '6px', border: '3px solid #1a1a1a', overflow: 'hidden' },
  progressBarFill: { height: '100%', background: 'linear-gradient(90deg, #06d6a0 0%, #00d4ff 100%)', borderRadius: '4px' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' },
  statBox: { background: '#f8f9fa', border: '3px solid #1a1a1a', borderRadius: '12px', padding: '15px', textAlign: 'center' },
  statLabel: { fontFamily: '"Comic Neue", cursive', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '5px', textTransform: 'uppercase' },
  statValue: { fontFamily: '"Fredoka", sans-serif', fontSize: '24px', fontWeight: '900', color: '#1a1a1a' },
  depositCard: { background: '#ffffff', border: '5px solid #1a1a1a', borderRadius: '20px', padding: '40px', boxShadow: '12px 12px 0 #1a1a1a', transition: 'all 0.2s' },
  depositTitle: { fontFamily: '"Fredoka", sans-serif', fontSize: '24px', fontWeight: '900', color: '#1a1a1a', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '-0.5px' },
  depositSubtitle: { fontFamily: '"Comic Neue", cursive', fontSize: '16px', fontWeight: '600', color: '#666', marginBottom: '30px' },
  depositForm: { marginBottom: '20px' },
  inputGroup: { position: 'relative', marginBottom: '10px' },
  input: { width: '100%', fontFamily: '"Fredoka", sans-serif', fontSize: '32px', fontWeight: '900', color: '#1a1a1a', background: '#f8f9fa', border: '4px solid #1a1a1a', borderRadius: '12px', padding: '20px', paddingRight: '80px', outline: 'none', transition: 'all 0.2s' },
  inputLabel: { position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontFamily: '"Fredoka", sans-serif', fontSize: '20px', fontWeight: '900', color: '#666' },
  inputInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingLeft: '5px' },
  inputInfoText: { fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '600', color: '#666' },
  maxButton: { fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '700', color: '#00d4ff', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' },
  depositButton: { width: '100%', fontFamily: '"Fredoka", sans-serif', fontSize: '18px', fontWeight: '900', color: '#1a1a1a', background: '#00d4ff', border: '4px solid #1a1a1a', borderRadius: '12px', padding: '16px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '6px 6px 0 #1a1a1a', transition: 'all 0.2s', marginBottom: '15px' },
  alternativeButton: { width: '100%', fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '700', color: '#1a1a1a', background: '#f8f9fa', border: '3px solid #1a1a1a', borderRadius: '12px', padding: '12px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s' },
  bridgeButton: { width: '100%', fontFamily: '"Fredoka", sans-serif', fontSize: '16px', fontWeight: '900', color: '#1a1a1a', background: '#00d4ff', border: '4px solid #1a1a1a', borderRadius: '12px', padding: '14px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s', boxShadow: '6px 6px 0 #1a1a1a', marginBottom: '15px' },
  divider: { textAlign: 'center', fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '700', color: '#999', margin: '15px 0', position: 'relative' },
  demoButton: { width: '100%', fontFamily: '"Fredoka", sans-serif', fontSize: '16px', fontWeight: '900', color: '#1a1a1a', background: '#ffd23f', border: '4px solid #1a1a1a', borderRadius: '12px', padding: '14px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '6px 6px 0 #1a1a1a', transition: 'all 0.2s', marginBottom: '15px' },
  errorBox: { background: '#fff0f0', border: '3px solid #ff4d6d', borderRadius: '8px', padding: '12px', fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '600', color: '#ff4d6d', marginBottom: '15px' },
  infoBox: { background: '#f0f9ff', border: '3px solid #00d4ff', borderRadius: '12px', padding: '15px', display: 'flex', gap: '10px', alignItems: 'flex-start' },
  infoEmoji: { fontSize: '20px', flexShrink: 0 },
  infoText: { fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', lineHeight: '1.5', margin: 0 },
  tabSection: { background: '#ffffff', border: '5px solid #1a1a1a', borderRadius: '20px', overflow: 'hidden', boxShadow: '12px 12px 0 #1a1a1a' },
  tabs: { display: 'flex', borderBottom: '5px solid #1a1a1a' },
  tab: { flex: 1, fontFamily: '"Fredoka", sans-serif', fontSize: '18px', color: '#1a1a1a', background: 'transparent', border: 'none', padding: '20px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s', borderBottom: '5px solid transparent' },
  tabContent: { padding: '40px' },
  rulesList: { fontFamily: '"Comic Neue", cursive', fontSize: '16px', fontWeight: '600', color: '#1a1a1a', lineHeight: '1.8', paddingLeft: '20px' },
  ruleItem: { marginBottom: '16px' },
  comingSoon: { fontFamily: '"Comic Neue", cursive', fontSize: '18px', fontWeight: '600', color: '#666', textAlign: 'center', margin: '40px 0' },
};

export default StablecoinsPool;
