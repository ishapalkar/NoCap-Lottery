import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useEnsName, useEnsAvatar } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { sepolia } from 'wagmi/chains';
import { ArrowLeft, ExternalLink, Users, Plus } from 'lucide-react';
import { useDemoPrizePool } from '../hooks/useDemoPrizePool';
import { useLotteryPoolUSDC } from '../hooks/useLotteryPoolUSDC';
import { useUSDCBalance } from '../hooks/useUSDCApproval';
import { useUSDCApproval, useUSDCAllowance } from '../hooks/useUSDCApproval';
import { formatUnits } from 'viem';

const DEMO_PRIZE_POOL_ADDRESS = import.meta.env.VITE_USDC_DEMO;
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;

// List of 1000 wallet addresses with ENS domains for Sepolia testnet
const MOCK_PARTICIPANTS = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901',
  '0x3456789012345678901234567890123456789012',
  // ... (shortened for brevity - we'll use first 3 for demo)
];

function DemoPrize() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  
  // Smart contract hooks
  const {
    prizePool,
    bonusPool,
    participantCount,
    isLoading: contractLoading,
    fundDemoPrize,
    fundDemoBonus,
    drawDemoWinner,
    lastWinner,
    refetchAll,
    isFundPrizeSuccess,
    isFundBonusSuccess
  } = useDemoPrizePool();

  const lotteryData = useLotteryPoolUSDC(address);
  const { balance: usdcBalance, refetch: refetchUSDCBalance } = useUSDCBalance(address);

  // Component state
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showWinner, setShowWinner] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [isLeverPulled, setIsLeverPulled] = useState(false);
  const [fundPrizeAmount, setFundPrizeAmount] = useState('');
  const [fundBonusAmount, setFundBonusAmount] = useState('');
  const [mockParticipantCount, setMockParticipantCount] = useState(10);
  const [showBonusInfo, setShowBonusInfo] = useState(false);
  const [mockParticipants, setMockParticipants] = useState([]); // Demo mock participants
  
  // Approval and deposit hooks
  const { approve: approvePrize, isPending: approvingPrize, isSuccess: approvePrizeSuccess } = useUSDCApproval(DEMO_PRIZE_POOL_ADDRESS);
  const { approve: approveBonus, isPending: approvingBonus, isSuccess: approveBonusSuccess } = useUSDCApproval(DEMO_PRIZE_POOL_ADDRESS);
  const { allowance: prizeAllowance, refetch: refetchPrizeAllowance } = useUSDCAllowance(address, DEMO_PRIZE_POOL_ADDRESS);
  const { allowance: bonusAllowance, refetch: refetchBonusAllowance } = useUSDCAllowance(address, DEMO_PRIZE_POOL_ADDRESS);

  // Calculate real values from contracts
  const prizeAmount = prizePool ? Number(formatUnits(prizePool, 6)) : 0;
  const bonusAmount = bonusPool ? Number(formatUnits(bonusPool, 6)) : 0;
  const totalPrize = prizeAmount + bonusAmount;
  const totalParticipants = mockParticipants.length; // Use demo mock participants

  // Check if approvals are needed
  const needsPrizeApproval = fundPrizeAmount && parseFloat(fundPrizeAmount) > 0 && prizeAllowance < parseFloat(fundPrizeAmount);
  const needsBonusApproval = fundBonusAmount && parseFloat(fundBonusAmount) > 0 && bonusAllowance < parseFloat(fundBonusAmount);

  // Generate confetti particles
  const generateConfetti = () => {
    const newConfetti = [];
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 360,
        color: ['#00d4ff', '#ff4d6d', '#ffd23f', '#06d6a0'][Math.floor(Math.random() * 4)]
      });
    }
    setConfetti(newConfetti);
  };

  const handleDrawWinner = async () => {
    if (isSpinning || totalParticipants === 0) {
      alert('⚠️ No participants! Add mock participants first.');
      return;
    }
    
    setIsSpinning(true);
    setIsLeverPulled(true);
    setShowWinner(false);
    setWinner(null);

    // Simulate draw - randomly select from mock participants
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * mockParticipants.length);
      setWinner(mockParticipants[randomIndex]);
      completeAnimation();
    }, 3000);
  };

  const completeAnimation = () => {
    setIsSpinning(false);
    setTimeout(() => {
      setShowWinner(true);
      generateConfetti();
      setTimeout(() => setIsLeverPulled(false), 1000);
    }, 500);
  };

  const handleFundPrize = async () => {
    if (!fundPrizeAmount || parseFloat(fundPrizeAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(fundPrizeAmount) > usdcBalance) {
      alert('⚠️ Insufficient USDC balance');
      return;
    }
    
    try {
      if (needsPrizeApproval) {
        await approvePrize(fundPrizeAmount);
        await refetchPrizeAllowance();
        // Deposit will be triggered automatically by useEffect after approval
        return;
      }
      
      await fundDemoPrize(fundPrizeAmount);
      setFundPrizeAmount('');
      // Success state will trigger refetch via useEffect
    } catch (error) {
      console.error('Fund prize failed:', error);
      alert(`❌ Failed: ${error.message}`);
    }
  };

  const handleFundBonus = async () => {
    if (!fundBonusAmount || parseFloat(fundBonusAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(fundBonusAmount) > usdcBalance) {
      alert('⚠️ Insufficient USDC balance');
      return;
    }
    
    try {
      if (needsBonusApproval) {
        await approveBonus(fundBonusAmount);
        await refetchBonusAllowance();
        // Deposit will be triggered automatically by useEffect after approval
        return;
      }
      
      await fundDemoBonus(fundBonusAmount);
      setFundBonusAmount('');
      // Success state will trigger refetch via useEffect
    } catch (error) {
      console.error('Fund bonus failed:', error);
      alert(`❌ Failed: ${error.message}`);
    }
  };

  const handleAddMockParticipants = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    // Generate mock participant addresses
    const generateMockAddress = (index) => {
      const randomHex = Math.floor(Math.random() * 0xFFFFFFFFFFFF).toString(16).padStart(12, '0');
      return `0x${index.toString().padStart(4, '0')}${randomHex}${'0'.repeat(24)}`;
    };
    
    const newParticipants = [];
    for (let i = 0; i < mockParticipantCount; i++) {
      newParticipants.push(generateMockAddress(mockParticipants.length + i + 1));
    }
    
    setMockParticipants(prev => [...prev, ...newParticipants]);
    alert(`✅ Added ${mockParticipantCount} mock participants! Total: ${mockParticipants.length + newParticipants.length}`);
  };

  // Auto-deposit after prize approval succeeds
  useEffect(() => {
    if (approvePrizeSuccess && fundPrizeAmount && parseFloat(fundPrizeAmount) > 0) {
      const timer = setTimeout(async () => {
        try {
          await fundDemoPrize(fundPrizeAmount);
          setFundPrizeAmount('');
        } catch (error) {
          console.error('Auto-deposit prize failed:', error);
          alert(`❌ Deposit failed: ${error.message}`);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [approvePrizeSuccess]);

  // Auto-deposit after bonus approval succeeds
  useEffect(() => {
    if (approveBonusSuccess && fundBonusAmount && parseFloat(fundBonusAmount) > 0) {
      const timer = setTimeout(async () => {
        try {
          await fundDemoBonus(fundBonusAmount);
          setFundBonusAmount('');
        } catch (error) {
          console.error('Auto-deposit bonus failed:', error);
          alert(`❌ Deposit failed: ${error.message}`);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [approveBonusSuccess]);

  // Refetch all data when fund transactions succeed
  useEffect(() => {
    if (isFundPrizeSuccess || isFundBonusSuccess) {
      const timer = setTimeout(async () => {
        await Promise.all([
          refetchAll(),
          refetchUSDCBalance(),
          lotteryData.refetchAll(),
        ]);
        console.log('✅ All data refetched after funding');
        if (isFundPrizeSuccess) alert('✅ Prize pool funded successfully!');
        if (isFundBonusSuccess) alert('✅ Bonus pool funded successfully!');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isFundPrizeSuccess, isFundBonusSuccess]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          style={styles.backButton}
          className="btn-bounce"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft size={16} />
          <span>BACK</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.header}
        >
          <h1 style={styles.title}>🎰 Lottery Draw Simulation</h1>
          <p style={styles.subtitle}>
            Fund the prize pool, add mock participants, and simulate a week ahead to see the draw!
          </p>
        </motion.div>

        {/* Wallet Balance Display */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={styles.walletCard}
            className="card-squishy"
          >
            <div style={styles.walletHeader}>
              <div style={styles.walletInfo}>
                <div style={styles.walletLabel}>💰 Your USDC Balance</div>
                <div style={styles.walletBalance}>{usdcBalance?.toFixed(2) || '0.00'} USDC</div>
              </div>
              <div style={styles.walletInfo}>
                <div style={styles.walletLabel}>🏆 Total Prize Pool Balance</div>
                <div style={styles.walletBalance}>
                  {totalPrize?.toFixed(2) || '0.00'} USDC
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pool Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={styles.statusCard}
          className="card-squishy"
        >
          <h2 style={styles.cardTitle}>📊 Current Pool Status</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Prize Pool (Yield)</div>
              <div style={styles.statValue}>${prizeAmount.toFixed(2)}</div>
              <div style={styles.statDesc}>From Aave yield</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>
                Bonus Pool
                <button 
                  onClick={() => setShowBonusInfo(!showBonusInfo)}
                  style={styles.infoButton}
                  title="Learn about bonus pool"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
              <div style={styles.statValue}>${bonusAmount.toFixed(2)}</div>
              <div style={styles.statDesc}>Retention rewards</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Total Prize</div>
              <div style={{...styles.statValue, color: '#06d6a0'}}>${totalPrize.toFixed(2)}</div>
              <div style={styles.statDesc}>Winner takes all</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Participants</div>
              <div style={styles.statValue}>{totalParticipants}</div>
              <div style={styles.statDesc}>
                {lotteryData.depositWindowOpen ? 'Deposits open' : 'Window closed'}
              </div>
            </div>
          </div>
          
          {/* Bonus Pool Info Inline */}
          {showBonusInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={styles.bonusInfo}
            >
              <p style={styles.bonusText}>
                The bonus pool is a <strong>customer retention mechanism</strong> that rewards consistent participants. 
                <span 
                  onClick={() => setShowBonusInfo(true)}
                  style={styles.bonusLink}
                >
                  {' '}Learn more
                </span>
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Fund Pools */}
        {isConnected && (
          <div style={styles.fundingGrid}>
            {/* Fund Prize Pool */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={styles.fundCard}
              className="card-squishy"
            >
              <h3 style={styles.cardTitle}>💰 Fund Prize Pool (Yield)</h3>
              <p style={styles.fundDesc}>Simulate Aave yield earnings</p>
              
              <div style={styles.inputGroup}>
                <input
                  type="number"
                  value={fundPrizeAmount}
                  onChange={(e) => setFundPrizeAmount(e.target.value)}
                  placeholder="0.00"
                  style={styles.input}
                />
                <span style={styles.inputLabel}>USDC</span>
              </div>
              
              <button
                onClick={handleFundPrize}
                disabled={!fundPrizeAmount || parseFloat(fundPrizeAmount) <= 0 || approvingPrize || parseFloat(fundPrizeAmount) > usdcBalance}
                style={{
                  ...styles.actionButton,
                  ...((!fundPrizeAmount || approvingPrize || parseFloat(fundPrizeAmount) > usdcBalance) && styles.disabledButton),
                  background: needsPrizeApproval ? '#ffd23f' : '#06d6a0',
                }}
                className="btn-bounce"
              >
                {parseFloat(fundPrizeAmount) > usdcBalance ? '⚠️ INSUFFICIENT BALANCE' :
                 approvingPrize ? '⏳ APPROVING...' : 
                 needsPrizeApproval ? '🔓 APPROVE USDC' :
                 '💸 FUND PRIZE'}
              </button>
              {fundPrizeAmount && parseFloat(fundPrizeAmount) > 0 && needsPrizeApproval && (
                <p style={styles.approvalNote}>After approval, funds will be deposited automatically</p>
              )}
            </motion.div>

            {/* Fund Bonus Pool */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              style={{...styles.fundCard, borderColor: '#ff4d6d'}}
              className="card-squishy"
            >
              <h3 style={styles.cardTitle}>💎 Fund Bonus Pool</h3>
              <p style={styles.fundDesc}>Add retention rewards</p>
              
              <div style={styles.inputGroup}>
                <input
                  type="number"
                  value={fundBonusAmount}
                  onChange={(e) => setFundBonusAmount(e.target.value)}
                  placeholder="0.00"
                  style={styles.input}
                />
                <span style={styles.inputLabel}>USDC</span>
              </div>
              
              <button
                onClick={handleFundBonus}
                disabled={!fundBonusAmount || parseFloat(fundBonusAmount) <= 0 || approvingBonus || parseFloat(fundBonusAmount) > usdcBalance}
                style={{
                  ...styles.actionButton,
                  ...((!fundBonusAmount || approvingBonus || parseFloat(fundBonusAmount) > usdcBalance) && styles.disabledButton),
                  background: needsBonusApproval ? '#ffd23f' : '#ff4d6d',
                }}
                className="btn-bounce"
              >
                {parseFloat(fundBonusAmount) > usdcBalance ? '⚠️ INSUFFICIENT BALANCE' :
                 approvingBonus ? '⏳ APPROVING...' : 
                 needsBonusApproval ? '🔓 APPROVE USDC' :
                 '💎 FUND BONUS'}
              </button>
              {fundBonusAmount && parseFloat(fundBonusAmount) > 0 && needsBonusApproval && (
                <p style={styles.approvalNote}>After approval, funds will be deposited automatically</p>
              )}
            </motion.div>
          </div>
        )}

        {/* Mock Participants */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={styles.mockCard}
            className="card-squishy"
          >
            <div style={styles.mockHeader}>
              <Users size={24} style={{ color: '#00d4ff' }} />
              <h3 style={styles.cardTitle}>Add Mock Participants</h3>
            </div>
            <p style={styles.fundDesc}>
              Add {mockParticipantCount} simulated participants for the demo draw (no USDC required)
            </p>
            
            <div style={styles.sliderGroup}>
              <label style={styles.sliderLabel}>
                Number of mock participants: <strong>{mockParticipantCount}</strong>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={mockParticipantCount}
                onChange={(e) => setMockParticipantCount(parseInt(e.target.value))}
                style={styles.slider}
              />
              <p style={styles.participantCount}>
                Current participants: <strong>{mockParticipants.length}</strong>
              </p>
            </div>
            
            <div style={styles.buttonGroup}>
              <button
                onClick={handleAddMockParticipants}
                disabled={!isConnected}
                style={{
                  ...styles.actionButton,
                  ...(!isConnected && styles.disabledButton),
                  background: '#00d4ff',
                  flex: mockParticipants.length > 0 ? 1 : 'auto',
                }}
                className="btn-bounce"
              >
                <Plus size={18} /> ADD {mockParticipantCount}
              </button>
              {mockParticipants.length > 0 && (
                <button
                  onClick={() => setMockParticipants([])}
                  style={{
                    ...styles.actionButton,
                    background: '#ff4d6d',
                    flex: 1,
                  }}
                  className="btn-bounce"
                >
                  CLEAR ALL
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Arcade Machine */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          style={styles.arcadeCard}
          className="card-squishy"
        >
          {/* Confetti */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ y: -20, opacity: 1, x: `${particle.x}%`, rotate: 0 }}
              animate={{ 
                y: 600, 
                opacity: 0, 
                x: `${particle.x + (Math.random() * 20 - 10)}%`,
                rotate: particle.rotation
              }}
              transition={{ duration: particle.duration, delay: particle.delay }}
              style={styles.confetti(particle.color)}
            />
          ))}

          <h2 style={styles.arcadeTitle}>🎰 DRAW WINNER</h2>

          {/* Prize Display */}
          <div style={styles.prizeDisplay}>
            <motion.div
              animate={isSpinning ? {
                y: [0, -10, 0, -10, 0],
                scale: [1, 1.05, 1, 1.05, 1],
              } : {}}
              transition={{ duration: 0.3, repeat: isSpinning ? Infinity : 0 }}
              style={styles.prizeAmount2}
            >
              {isSpinning ? '???' : `$${totalPrize.toFixed(2)}`}
            </motion.div>
            <p style={styles.prizeLabel2}>
              {isSpinning ? 'DRAWING...' : 'TOTAL PRIZE'}
            </p>
          </div>

          {/* Lever */}
          <div style={styles.leverContainer}>
            <motion.div
              animate={{ rotate: isLeverPulled ? 45 : 0 }}
              transition={{ duration: 0.3 }}
              style={styles.leverStick}
            />
            <motion.button
              whileHover={{ scale: totalParticipants > 0 ? 1.05 : 1 }}
              whileTap={{ scale: totalParticipants > 0 ? 0.95 : 1 }}
              onClick={handleDrawWinner}
              disabled={isSpinning || totalParticipants === 0}
              style={{
                ...styles.leverButton,
                background: isSpinning || totalParticipants === 0 ? '#e0e0e0' : '#ffd23f',
                cursor: isSpinning || totalParticipants === 0 ? 'not-allowed' : 'pointer',
              }}
              className="btn-bounce"
            >
              🎯
            </motion.button>
            <p style={styles.leverText}>
              {isSpinning ? 'Drawing...' : 
               totalParticipants === 0 ? 'Add participants first!' :
               'PULL LEVER!'}
            </p>
          </div>

          {/* Winner Display */}
          {showWinner && winner && (
            <WinnerDisplay 
              address={winner} 
              prize={totalPrize}
            />
          )}
        </motion.div>

        {/* Instructions */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            style={styles.connectCard}
          >
            <p style={styles.connectText}>
              🔗 Connect your wallet to fund pools and simulate the lottery draw
            </p>
          </motion.div>
        )}
      </div>

      {/* Bonus Pool Info Modal */}
      <AnimatePresence>
        <BonusPoolInfoModal 
          isOpen={showBonusInfo} 
          onClose={() => setShowBonusInfo(false)} 
        />
      </AnimatePresence>
    </div>
  );
}

// Winner Display Component
function WinnerDisplay({ address, prize }) {
  const { data: ensName } = useEnsName({ address, chainId: 11155111 });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName, chainId: 11155111 });

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', duration: 0.6 }}
      style={styles.winnerCard}
    >
      <h3 style={styles.winnerTitle}>🎉 WINNER! 🎉</h3>
      <div style={styles.winnerInfo}>
        {ensAvatar && (
          <img 
            src={ensAvatar} 
            alt="Winner avatar"
            style={styles.winnerAvatar}
          />
        )}
        <div>
          <p style={styles.winnerName}>
            {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
          </p>
          <p style={styles.winnerPrize}>Won ${prize.toFixed(2)} USDC!</p>
        </div>
      </div>
    </motion.div>
  );
}

// Bonus Pool Info Modal
function BonusPoolInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={styles.modalOverlay}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={styles.modalContent}
      >
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>💰 What is the Bonus Pool?</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>
        
        <div style={styles.modalBody}>
          <p style={styles.modalText}>
            The <strong>Bonus Pool</strong> is a customer retention mechanism designed to reward 
            consistent participants in our lottery system.
          </p>
          
          <h3 style={styles.modalSubtitle}>🎯 How It Works:</h3>
          <ul style={styles.modalList}>
            <li style={styles.modalListItem}>
              <strong>Accumulation:</strong> A portion of yield from deposits is automatically 
              allocated to the bonus pool each round
            </li>
            <li style={styles.modalListItem}>
              <strong>Distribution:</strong> Bonus pool funds are awarded to players who 
              participate consistently across multiple rounds
            </li>
            <li style={styles.modalListItem}>
              <strong>Retention Reward:</strong> The more rounds you participate in, the higher 
              your bonus pool eligibility becomes
            </li>
            <li style={styles.modalListItem}>
              <strong>Separate from Main Prize:</strong> Bonus pool doesn't affect the main 
              prize pool - it's additional rewards on top!
            </li>
          </ul>

          <div style={styles.modalHighlight}>
            <p style={styles.modalHighlightText}>
              💡 <strong>Pro Tip:</strong> Regular participation increases your bonus pool share, 
              creating more value beyond just winning the main lottery!
            </p>
          </div>
        </div>

        <button onClick={onClose} style={styles.modalCloseBtn} className="btn-bounce">
          Got it!
        </button>
      </motion.div>
    </motion.div>
  );
}

// Styles Object - Neobrutalism Theme
const styles = {
  container: {
    minHeight: '100vh',
    background: '#ffffff',
    padding: '0',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '100px 40px 40px',
    position: 'relative',
    zIndex: 1,
  },
  innerContainer: {
    maxWidth: '1100px',
    margin: '0 auto',
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
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '56px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    color: '#1a1a1a',
    margin: '0 0 12px',
    textTransform: 'uppercase',
    letterSpacing: '-1px',
  },
  subtitle: {
    color: '#666',
    fontSize: '18px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
  },
  statusCard: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '30px',
    boxShadow: '12px 12px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#1a1a1a',
    marginBottom: '24px',
    fontFamily: '"Fredoka", sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '-0.5px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '20px',
    marginBottom: '0',
  },
  statBox: {
    background: '#f8f9fa',
    border: '3px solid #1a1a1a',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
  },
  statLabel: {
    color: '#666',
    fontSize: '12px',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
  },
  statValue: {
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    marginBottom: '0',
  },
  statDesc: {
    color: '#999',
    fontSize: '11px',
    marginTop: '4px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
  },
  infoButton: {
    background: 'transparent',
    border: 'none',
    color: '#ff4d6d',
    cursor: 'pointer',
    padding: '0',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  statItem: {
    textAlign: 'center',
  },
  bonusInfo: {
    background: '#fff0f5',
    border: '3px solid #ff4d6d',
    borderRadius: '12px',
    padding: '16px',
    marginTop: '20px',
  },
  bonusText: {
    color: '#1a1a1a',
    fontSize: '14px',
    lineHeight: '1.6',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
    margin: 0,
  },
  bonusLink: {
    color: '#ff4d6d',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontWeight: 700,
  },
  fundingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginBottom: '30px',
  },
  fundCard: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '12px 12px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  fundHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  fundTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#ffffff',
    fontFamily: '"Fredoka", sans-serif',
  },
  fundDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  fundDesc: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '20px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: '20px',
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '20px',
    paddingRight: '80px',
    background: '#f8f9fa',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    color: '#1a1a1a',
    fontSize: '28px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    outline: 'none',
    transition: 'all 0.2s',
  },
  inputLabel: {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
    fontSize: '18px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
  },
  actionButton: {
    width: '100%',
    padding: '16px',
    background: '#00d4ff',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: 900,
    cursor: 'pointer',
    fontFamily: '"Fredoka", sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '6px 6px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  disabledButton: {
    background: '#e0e0e0',
    color: '#999',
    cursor: 'not-allowed',
    boxShadow: '6px 6px 0 #1a1a1a',
  },
  mockCard: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '30px',
    boxShadow: '12px 12px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  mockHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  mockTitle: {
    fontSize: '24px',
    fontWeight: 900,
    color: '#1a1a1a',
    fontFamily: '"Fredoka", sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '-0.5px',
  },
  sliderGroup: {
    marginBottom: '20px',
  },
  sliderContainer: {
    marginBottom: '20px',
  },
  sliderLabel: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '12px',
    display: 'block',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  slider: {
    width: '100%',
    height: '12px',
    borderRadius: '6px',
    background: '#e0e0e0',
    border: '3px solid #1a1a1a',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  },
  sliderValue: {
    color: '#00d4ff',
    fontSize: '32px',
    fontWeight: 900,
    textAlign: 'center',
    marginTop: '12px',
    fontFamily: '"Fredoka", sans-serif',
  },
  participantCount: {
    color: '#666',
    fontSize: '14px',
    marginTop: '12px',
    textAlign: 'center',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
  arcadeCard: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '40px',
    marginBottom: '30px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '12px 12px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  arcadeTitle: {
    fontSize: '36px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: '30px',
    textTransform: 'uppercase',
    letterSpacing: '-1px',
  },
  confetti: (color) => ({
    position: 'absolute',
    width: '12px',
    height: '12px',
    background: color,
    border: '2px solid #1a1a1a',
    borderRadius: '2px',
    zIndex: 100,
  }),
  prizeDisplay: {
    background: '#f8f9fa',
    border: '4px solid #1a1a1a',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '32px',
    textAlign: 'center',
  },
  prizeAmount2: {
    fontSize: '64px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    color: '#06d6a0',
    margin: 0,
    lineHeight: '1',
  },
  prizeLabel2: {
    color: '#666',
    fontSize: '16px',
    marginTop: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '700',
  },
  leverContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px',
  },
  leverStick: {
    width: '8px',
    height: '100px',
    background: '#1a1a1a',
    marginBottom: '8px',
    borderRadius: '4px',
    transformOrigin: 'top center',
  },
  leverButton: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '5px solid #1a1a1a',
    fontSize: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '8px 8px 0 #1a1a1a',
  },
  leverText: {
    marginTop: '16px',
    fontSize: '20px',
    fontWeight: 900,
    color: '#1a1a1a',
    fontFamily: '"Fredoka", sans-serif',
    textTransform: 'uppercase',
  },
  winnerCard: {
    background: '#06d6a0',
    border: '5px solid #1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    marginTop: '24px',
    boxShadow: '8px 8px 0 #1a1a1a',
  },
  winnerTitle: {
    fontSize: '28px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: '16px',
    textTransform: 'uppercase',
  },
  winnerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    justifyContent: 'center',
    background: '#ffffff',
    border: '3px solid #1a1a1a',
    borderRadius: '12px',
    padding: '16px',
  },
  winnerAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: '4px solid #1a1a1a',
    objectFit: 'cover',
  },
  winnerName: {
    fontSize: '20px',
    fontWeight: 900,
    color: '#1a1a1a',
    marginBottom: '4px',
    fontFamily: '"Fredoka", sans-serif',
  },
  winnerPrize: {
    fontSize: '16px',
    color: '#06d6a0',
    fontWeight: 700,
    fontFamily: '"Comic Neue", cursive',
  },
  connectCard: {
    background: '#fff0f5',
    border: '4px solid #ff4d6d',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '8px 8px 0 #ff4d6d',
  },
  connectText: {
    color: '#1a1a1a',
    fontSize: '16px',
    lineHeight: '1.6',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
    margin: 0,
  },
  walletCard: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '24px 32px',
    marginBottom: '30px',
    boxShadow: '12px 12px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  walletHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  walletInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  walletLabel: {
    color: '#666',
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: '"Comic Neue", cursive',
  },
  walletBalance: {
    color: '#1a1a1a',
    fontSize: '32px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
  },
  approvalNote: {
    marginTop: '12px',
    color: '#666',
    fontSize: '12px',
    textAlign: 'center',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
    padding: '40px',
    boxShadow: '16px 16px 0 #1a1a1a',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  modalTitle: {
    fontSize: '32px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    color: '#1a1a1a',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '-0.5px',
  },
  closeButton: {
    background: '#f8f9fa',
    border: '3px solid #1a1a1a',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a1a1a',
    fontSize: '24px',
    cursor: 'pointer',
    fontWeight: 700,
    transition: 'all 0.2s',
  },
  modalBody: {
    color: '#1a1a1a',
    fontSize: '16px',
    lineHeight: '1.6',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
  },
  modalText: {
    marginBottom: '20px',
  },
  modalSubtitle: {
    fontSize: '20px',
    fontWeight: 900,
    color: '#1a1a1a',
    marginBottom: '16px',
    fontFamily: '"Fredoka", sans-serif',
    textTransform: 'uppercase',
  },
  modalList: {
    listStyle: 'none',
    padding: 0,
    marginBottom: '24px',
  },
  modalListItem: {
    padding: '16px',
    marginBottom: '12px',
    background: '#f8f9fa',
    borderRadius: '12px',
    border: '3px solid #1a1a1a',
    borderLeft: '8px solid #ffd23f',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
  },
  modalHighlight: {
    background: '#fffacd',
    border: '3px solid #ffd23f',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  modalHighlightText: {
    color: '#1a1a1a',
    margin: 0,
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
  },
  modalCloseBtn: {
    width: '100%',
    padding: '16px',
    background: '#ffd23f',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: 900,
    cursor: 'pointer',
    fontFamily: '"Fredoka", sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '6px 6px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
};

export default DemoPrize;

