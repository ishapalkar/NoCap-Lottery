import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useEnsName, useEnsAvatar } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { sepolia } from 'wagmi/chains';
import { ArrowLeft, ExternalLink, Users, Plus, Trash2 } from 'lucide-react';
import { useDemoPrizePool } from '../hooks/useDemoPrizePool';
import { useLotteryPoolUSDC } from '../hooks/useLotteryPoolUSDC';
import { useUSDCBalance } from '../hooks/useUSDCApproval';
import { useUSDCApproval, useUSDCAllowance } from '../hooks/useUSDCApproval';
import { formatUnits } from 'viem';

const DEMO_PRIZE_POOL_ADDRESS = import.meta.env.VITE_USDC_DEMO;
const LOTTERY_POOL_ADDRESS = import.meta.env.VITE_USDC_LOTTERY;
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;

// Mock participants with real ENS addresses on Sepolia testnet
const MOCK_PARTICIPANTS = [
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
  '0x225f137127d9067788314bc7fcc1f36746a3c3B5', // lootproject.eth
  '0x983110309620D911731Ac0932219af06091b6744', // brantly.eth
  '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5', // nick.eth
  '0x0904Dac3347eA47d208F3Fd67402D039a3b99859', // fireflies.eth
  '0x866B3c4994e1416B7C738B9818b31dC246b95eee', // coopahtroopa.eth
  '0x54Be3a794282C030b15E43aE2bB182E14c409C5e', // pranksy.eth
];

function DemoPrize() {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  
  // Smart contract hooks
  const {
    prizePool,
    bonusPool,
    fundDemoPrize,
    fundDemoBonus,
    isFundPrizePending,
    isFundPrizeSuccess,
    isFundBonusPending,
    isFundBonusSuccess,
    drawDemoWinner,
    lastWinner,
    refetchAll
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
  const [userTickets, setUserTickets] = useState([]); // User's free tickets (array of wallet addresses)
  const [ticketCount, setTicketCount] = useState(1); // Number of free tickets
  
  // Approval and deposit hooks for demo prize/bonus
  const { approve: approvePrize, isPending: approvingPrize, isSuccess: approvePrizeSuccess } = useUSDCApproval(DEMO_PRIZE_POOL_ADDRESS);
  const { approve: approveBonus, isPending: approvingBonus, isSuccess: approveBonusSuccess } = useUSDCApproval(DEMO_PRIZE_POOL_ADDRESS);
  const { allowance: prizeAllowance, refetch: refetchPrizeAllowance } = useUSDCAllowance(address, DEMO_PRIZE_POOL_ADDRESS);
  const { allowance: bonusAllowance, refetch: refetchBonusAllowance } = useUSDCAllowance(address, DEMO_PRIZE_POOL_ADDRESS);
  
  // Calculate real values from contracts
  const prizeAmount = prizePool ? Number(formatUnits(prizePool, 6)) : 0;
  const bonusAmount = bonusPool ? Number(formatUnits(bonusPool, 6)) : 0;
  const totalPrize = prizeAmount + bonusAmount;
  const allParticipants = [...userTickets, ...mockParticipants]; // All demo participants
  const totalParticipants = allParticipants.length;

  // Check if approvals are needed
  const needsPrizeApproval = fundPrizeAmount && parseFloat(fundPrizeAmount) > 0 && prizeAllowance < parseFloat(fundPrizeAmount);
  const needsBonusApproval = fundBonusAmount && parseFloat(fundBonusAmount) > 0 && bonusAllowance < parseFloat(fundBonusAmount);

  // Auto-calculate yield based on tickets (each ticket = $100 principal, ~7% APY)
  useEffect(() => {
    const totalTickets = userTickets.length + mockParticipants.length;
    if (totalTickets > 0) {
      const principal = totalTickets * 100;
      const monthlyYield = principal * (0.07 / 12); // 7% APY divided by 12 months
      setFundPrizeAmount(monthlyYield.toFixed(2));
    }
  }, [userTickets.length, mockParticipants.length]);

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
    if (isSpinning) return;

    if (!isConnected) {
      alert('⚠️ Connect your wallet to draw a winner!');
      return;
    }

    // Check minimum prize requirement
    const totalPrizeAmount = prizeAmount + (lotteryData.bonusPool || 0);
    if (totalPrizeAmount < 10) {
      alert(`⚠️ Prize pool too small! Need at least $10 USDC to draw.\n\nCurrent total prize: $${totalPrizeAmount.toFixed(2)}\nPlease fund the prize pool with at least $${(10 - totalPrizeAmount).toFixed(2)} more USDC.`);
      return;
    }

    // Check if there are any participants
    if (allParticipants.length === 0) {
      alert('⚠️ No participants!\n\nPlease:\n1. Get free tickets for yourself, OR\n2. Add mock participants for simulation');
      return;
    }

    // Draw winner locally from all participants
    setIsSpinning(true);
    setIsLeverPulled(true);
    setShowWinner(false);
    setWinner(null);

    console.log('🎰 Drawing winner from', allParticipants.length, 'participants');
    
    setTimeout(async () => {
      const randomIndex = Math.floor(Math.random() * allParticipants.length);
      const selectedWinner = allParticipants[randomIndex];
      setWinner(selectedWinner);
      completeAnimation();
      
      // Check if winner is a mock participant
      const isMockParticipant = mockParticipants.includes(selectedWinner);
      
      if (!isMockParticipant) {
        // Real user won - transfer actual USDC via smart contract
        try {
          console.log('💰 Transferring USDC to real winner:', selectedWinner);
          await drawDemoWinner(lotteryData.currentRound);
          setTimeout(() => {
            alert(
              `🎉 WINNER!\n\n` +
              `Winner: ${selectedWinner.slice(0, 6)}...${selectedWinner.slice(-4)}\n` +
              `Prize: $${totalPrizeAmount.toFixed(2)} USDC\n\n` +
              `💸 USDC transferred to winner's wallet!`
            );
          }, 1000);
        } catch (error) {
          console.error('USDC transfer failed:', error);
          alert(`❌ Winner drawn but USDC transfer failed: ${error.message || 'Unknown error'}`);
        }
      } else {
        // Mock participant won - no USDC transfer
        setTimeout(() => {
          alert(
            `🎉 WINNER! (Mock Participant)\n\n` +
            `Winner: ${selectedWinner.slice(0, 6)}...${selectedWinner.slice(-4)}\n` +
            `Prize: $${totalPrizeAmount.toFixed(2)} USDC\n\n` +
            `⚠️ No USDC transferred (mock participant)`
          );
        }, 1000);
      }
    }, 3000);
  };

  // Watch for lastWinner updates from the smart contract event
  useEffect(() => {
    if (lastWinner && lastWinner.round === lotteryData.currentRound) {
      console.log('🏆 Winner determined by smart contract:', lastWinner);
      setWinner(lastWinner.winner);
      completeAnimation();
    }
  }, [lastWinner, lotteryData.currentRound]);

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
        console.log('Approving', fundPrizeAmount, 'USDC for prize pool');
        // Trigger approval - useEffect will auto-fund after
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
      alert(`❌ Failed: ${error.message || error.shortMessage || 'Unknown error'}`);
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
        console.log('Approving', fundBonusAmount, 'USDC for bonus pool');
        // Trigger approval - useEffect will auto-fund after
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
      alert(`❌ Failed: ${error.message || error.shortMessage || 'Unknown error'}`);
    }
  };

  const handleBuyTickets = () => {
    if (!isConnected) {
      alert('⚠️ Please connect your wallet first!');
      return;
    }

    if (ticketCount <= 0) {
      alert('⚠️ Please select at least 1 ticket!');
      return;
    }

    // Add user's wallet address X times (one per ticket) - FREE!
    const newTickets = Array(ticketCount).fill(address);
    setUserTickets(prev => [...prev, ...newTickets]);
    
    alert(
      `✅ Added ${ticketCount} FREE ticket${ticketCount > 1 ? 's' : ''} for you!\n\n` +
      `Your wallet: ${address.slice(0, 6)}...${address.slice(-4)}\n` +
      `Your total entries: ${userTickets.length + ticketCount}\n\n` +
      `💡 Demo Mode: Tickets are completely free!`
    );
    setTicketCount(1); // Reset to 1 ticket
  };

  const handleAddMockParticipants = () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    const newParticipants = [];
    
    // Add user's wallet address first
    if (address && !mockParticipants.includes(address)) {
      newParticipants.push(address);
    }
    
    // Add mock participants from the ENS list
    const remainingCount = mockParticipantCount - 1; // -1 because we added user's address
    for (let i = 0; i < remainingCount && i < MOCK_PARTICIPANTS.length; i++) {
      const mockAddress = MOCK_PARTICIPANTS[i];
      if (!mockParticipants.includes(mockAddress)) {
        newParticipants.push(mockAddress);
      }
    }
    
    setMockParticipants(prev => [...prev, ...newParticipants]);
    alert(`✅ Added ${newParticipants.length} participants (including your wallet)! Total: ${mockParticipants.length + newParticipants.length}`);
  };

  const handleClearMockParticipants = () => {
    setMockParticipants([]);
    alert('🗑️ All mock participants cleared!');
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
          <h1 style={styles.title}>🎰 Demo Lottery Draw</h1>
          <p style={styles.subtitle}>
            1️⃣ Get free tickets → 2️⃣ Add mock participants → 3️⃣ Fund prize pool (yield) → 4️⃣ Draw winner!
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
              <div style={styles.statLabel}>Demo Prize Pool</div>
              <div style={styles.statValue}>${prizeAmount.toFixed(2)}</div>
              <div style={styles.statDesc}>USDC in demo contract</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Lottery Bonus Pool</div>
              <div style={styles.statValue}>${lotteryData.bonusPool?.toFixed(2) || '0.00'}</div>
              <div style={styles.statDesc}>
                From lottery contract
                <button 
                  onClick={() => setShowBonusInfo(!showBonusInfo)}
                  style={styles.bonusLearnMoreFixed}
                  title="Learn about bonus pool"
                >
                  Learn more ↗
                </button>
              </div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Total Prize</div>
              <div style={{...styles.statValue, color: '#06d6a0'}}>${(prizeAmount + (lotteryData.bonusPool || 0)).toFixed(2)}</div>
              <div style={styles.statDesc}>Winner takes all</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>Participants</div>
              <div style={styles.statValue}>{totalParticipants}</div>
              <div style={styles.statDesc}>
                {userTickets.length > 0 ? `You: ${userTickets.length} ticket${userTickets.length > 1 ? 's' : ''}, Mock: ${mockParticipants.length}` : mockParticipants.length > 0 ? `${mockParticipants.length} mock only` : 'Add tickets or mock participants'}
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
                💎 The lottery bonus pool comes from the main LotteryPoolUSDC contract and is automatically added to the demo prize when a winner is drawn.
                It rewards participants from the actual lottery deposits.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Step 1: Buy Lottery Tickets */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={styles.mockCard}
            className="card-squishy"
          >
            <div style={styles.mockHeader}>
              <Users size={24} style={{ color: '#06d6a0' }} />
              <h3 style={styles.cardTitle}>🎟️ Step 1: Get Free Demo Tickets</h3>
            </div>
            <p style={styles.fundDesc}>
              Get FREE tickets to enter the demo lottery draw (no USDC required)
            </p>
            
            <div style={styles.sliderGroup}>
              <label style={styles.sliderLabel}>
                Number of tickets: <strong>{ticketCount}</strong>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={ticketCount}
                onChange={(e) => setTicketCount(parseInt(e.target.value))}
                style={styles.slider}
              />
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <div style={{ ...styles.sliderValue, color: '#06d6a0' }}>
                  {ticketCount} {ticketCount > 1 ? 'Entries' : 'Entry'}
                </div>
                <p style={styles.participantCount}>
                  Demo tickets for simulation
                </p>
              </div>
            </div>
            
            <button
              onClick={handleBuyTickets}
              disabled={!isConnected}
              style={{
                ...styles.actionButton,
                ...(!isConnected ? styles.disabledButton : {}),
                background: '#06d6a0',
              }}
              className="btn-bounce"
            >
              {!isConnected ? '⚠️ CONNECT WALLET' : `🎟️ GET ${ticketCount} FREE TICKET${ticketCount > 1 ? 'S' : ''}`}
            </button>
            {userTickets.length > 0 && (
              <p style={{...styles.participantCount, color: '#06d6a0', marginTop: '12px'}}>
                ✅ You have {userTickets.length} ticket{userTickets.length > 1 ? 's' : ''}!
              </p>
            )}
          </motion.div>
        )}

        {/* Step 2: Add Mock Participants */}
        {/* Step 2: Add Mock Participants */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            style={styles.mockCard}
            className="card-squishy"
          >
            <div style={styles.mockHeader}>
              <Users size={24} style={{ color: '#00d4ff' }} />
              <h3 style={styles.cardTitle}>👥 Step 2: Add Mock Participants (Optional)</h3>
            </div>
            <p style={styles.fundDesc}>
              Add simulated participants for the demo draw (no USDC required)
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
                  onClick={handleClearMockParticipants}
                  style={{
                    ...styles.actionButton,
                    background: '#ff4d6d',
                    flex: 1,
                  }}
                  className="btn-bounce"
                >
                  <Trash2 size={18} /> CLEAR ALL
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Fund Prize Pools */}
        {isConnected && (
          <div style={styles.fundingGrid}>
            {/* Fund Prize Pool */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              style={styles.fundCard}
              className="card-squishy"
            >
              <h3 style={styles.cardTitle}>💰 Step 3: Fund Prize Pool (Yield)</h3>
              <p style={styles.fundDesc}>Add USDC to demo prize pool</p>
              
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
              transition={{ duration: 0.3, delay: 0.35 }}
              style={{...styles.fundCard, borderColor: '#ff4d6d'}}
              className="card-squishy"
            >
              <h3 style={styles.cardTitle}>💎 Fund Lottery Bonus Pool</h3>
              <p style={styles.fundDesc}>Add USDC to the lottery bonus pool (shown in stats above)</p>
              
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

        {/* Step 4: Draw Winner - Arcade Machine */}
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

          <h2 style={styles.arcadeTitle}>🎰 STEP 4: DRAW WINNER</h2>

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
              {isSpinning ? '???' : `$${(prizeAmount + (lotteryData.bonusPool || 0)).toFixed(2)}`}
            </motion.div>
            <p style={styles.prizeLabel2}>
              {isSpinning ? '⏳ DRAWING WINNER...' : 'TOTAL PRIZE'}
            </p>
          </div>

          {/* Single Draw Button */}
          <div style={styles.drawButtonContainer}>
            <motion.button
              whileHover={{ scale: !isSpinning ? 1.02 : 1 }}
              whileTap={{ scale: !isSpinning ? 0.98 : 1 }}
              onClick={handleDrawWinner}
              disabled={isSpinning}
              style={{
                ...styles.drawButton,
                background: isSpinning ? 'linear-gradient(135deg, #999 0%, #666 100%)' : 'linear-gradient(135deg, #ffd23f 0%, #ff4d6d 100%)',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
                opacity: isSpinning ? 0.7 : 1,
              }}
              className="btn-bounce"
            >
              {isSpinning ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ display: 'inline-block', marginRight: '12px' }}
                  >
                    🎰
                  </motion.span>
                  DRAWING...
                </>
              ) : (
                <>
                  🎲 DRAW WINNER
                </>
              )}
            </motion.button>
            <p style={styles.drawInfo}>
              {totalParticipants === 0 ? '⚠️ Add participants first' : `${totalParticipants} participants ready`}
            </p>
          </div>

          {/* Golden Ticket Winner Display */}
          {showWinner && winner && (
            <GoldenTicketWinner 
              address={winner} 
              prize={prizeAmount + (lotteryData.bonusPool || 0)}
              confetti={confetti}
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

// Golden Ticket Winner Component
function GoldenTicketWinner({ address, prize, confetti }) {
  const { data: ensName } = useEnsName({ address, chainId: 11155111 });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName, chainId: 11155111 });

  const getInitials = (addr) => {
    return addr ? addr.slice(2, 4).toUpperCase() : '??';
  };

  const avatarColor = address ? `hsl(${parseInt(address.slice(-6), 16) % 360}, 70%, 60%)` : '#00d4ff';

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -5 }}
      animate={{ 
        scale: 0.85,
        opacity: 1,
        rotate: 0
      }}
      transition={{ 
        type: 'spring',
        duration: 0.6,
        delay: 0.2,
        bounce: 0.4
      }}
      style={styles.winnerCard}
    >
      {/* Confetti overlay */}
      <div style={styles.confettiOverlay}>
        {confetti.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ y: -20, x: `${particle.x}%`, opacity: 1, rotate: 0 }}
            animate={{ 
              y: '100vh', 
              opacity: 0, 
              x: `${particle.x + (Math.random() * 20 - 10)}%`,
              rotate: particle.rotation
            }}
            transition={{ duration: particle.duration, delay: particle.delay }}
            style={{
              ...styles.confettiParticle,
              background: particle.color,
            }}
          />
        ))}
      </div>

      {/* Winner header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
        style={styles.winnerHeader}
      >
        <motion.div 
          style={styles.winnerBadge}
          animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          🏆
        </motion.div>
        <h2 style={styles.winnerTitle}>WINNER!</h2>
      </motion.div>

      {/* Winner avatar */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', delay: 0.5, duration: 0.6, bounce: 0.5 }}
        style={styles.winnerAvatarContainer}
      >
        {ensAvatar ? (
          <img 
            src={ensAvatar} 
            alt="Winner"
            style={styles.winnerAvatar}
          />
        ) : (
          <div style={{ ...styles.winnerAvatarFallback, background: avatarColor }}>
            {getInitials(address)}
          </div>
        )}
      </motion.div>

      {/* Winner info */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, type: 'spring', bounce: 0.4 }}
        style={styles.winnerInfo}
      >
        <div>
          <p style={styles.winnerLabel}>WINNER ADDRESS</p>
          <p style={styles.winnerName}>
            {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
          </p>
          <p style={styles.winnerAddress}>
            {address?.slice(0, 10)}...{address?.slice(-8)}
          </p>
        </div>
      </motion.div>

      {/* Prize amount */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.7, type: 'spring', bounce: 0.5 }}
        style={styles.winnerPrizeBox}
      >
        <p style={styles.winnerPrizeLabel}>🎉 PRIZE WON 🎉</p>
        <motion.p 
          style={styles.winnerPrizeAmount}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          ${prize.toFixed(2)}
        </motion.p>
        <p style={styles.winnerPrizeCurrency}>USDC</p>
      </motion.div>

      {/* Decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={styles.winnerDecoration}
      >
        🎊 🎉 🎊 🎉 🎊
      </motion.div>
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
  bonusLearnMore: {
    background: 'transparent',
    border: 'none',
    color: '#ff4d6d',
    cursor: 'pointer',
    padding: '0',
    marginLeft: '8px',
    fontSize: '10px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
    textDecoration: 'underline',
    transition: 'color 0.2s',
  },
  bonusLearnMoreFixed: {
    background: 'transparent',
    border: 'none',
    color: '#ff4d6d',
    cursor: 'pointer',
    padding: '0',
    marginLeft: '6px',
    fontSize: '10px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
    textDecoration: 'underline',
    transition: 'color 0.2s',
    display: 'inline',
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
  cancelButton: {
    marginTop: '16px',
    padding: '10px 20px',
    background: '#ff4d6d',
    color: '#ffffff',
    border: '3px solid #1a1a1a',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: '"Comic Neue", cursive',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 #1a1a1a',
    transition: 'all 0.2s',
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
  // Draw Button Styles
  drawButtonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginTop: '32px',
    marginBottom: '32px',
  },
  drawButton: {
    width: '100%',
    maxWidth: '400px',
    padding: '24px 48px',
    border: '5px solid #1a1a1a',
    borderRadius: '16px',
    fontSize: '28px',
    fontWeight: 900,
    color: '#1a1a1a',
    fontFamily: '"Fredoka", sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '10px 10px 0 #1a1a1a',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  drawInfo: {
    color: '#666',
    fontSize: '14px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: '600',
    textAlign: 'center',
  },
  // Golden Ticket Styles
  winnerCard: {
    position: 'relative',
    background: '#ffd23f',
    border: '6px solid #1a1a1a',
    borderRadius: '24px',
    padding: '40px',
    marginTop: '40px',
    boxShadow: '12px 12px 0 #1a1a1a',
    overflow: 'hidden',
  },
  winnerHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  winnerBadge: {
    fontSize: '80px',
    marginBottom: '16px',
    textShadow: '4px 4px 0 rgba(0, 0, 0, 0.2)',
  },
  winnerTitle: {
    fontSize: '48px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    margin: 0,
    textShadow: '4px 4px 0 rgba(255, 77, 109, 0.4)',
  },
  winnerAvatarContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  winnerAvatar: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    border: '6px solid #1a1a1a',
    boxShadow: '6px 6px 0 #1a1a1a',
    objectFit: 'cover',
    background: '#ffffff',
  },
  winnerAvatarFallback: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    border: '6px solid #1a1a1a',
    boxShadow: '6px 6px 0 #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    color: '#ffffff',
  },
  winnerInfo: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '6px 6px 0 #1a1a1a',
  },
  winnerLabel: {
    color: '#666',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    fontFamily: '"Comic Neue", cursive',
  },
  winnerName: {
    color: '#1a1a1a',
    fontSize: '28px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    marginBottom: '8px',
    wordBreak: 'break-all',
  },
  winnerAddress: {
    color: '#999',
    fontSize: '14px',
    fontFamily: 'monospace',
    fontWeight: 600,
  },
  winnerPrizeBox: {
    textAlign: 'center',
    padding: '32px',
    background: '#06d6a0',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    boxShadow: '8px 8px 0 #1a1a1a',
  },
  winnerPrizeLabel: {
    color: '#1a1a1a',
    fontSize: '16px',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '16px',
    fontFamily: '"Fredoka", sans-serif',
  },
  winnerPrizeAmount: {
    color: '#1a1a1a',
    fontSize: '56px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    margin: '8px 0',
    textShadow: '3px 3px 0 rgba(255, 255, 255, 0.3)',
  },
  winnerPrizeCurrency: {
    color: '#1a1a1a',
    fontSize: '20px',
    fontWeight: 700,
    fontFamily: '"Comic Neue", cursive',
    textTransform: 'uppercase',
  },
  winnerDecoration: {
    textAlign: 'center',
    fontSize: '32px',
    marginTop: '24px',
  },
  goldenTicket: {
    position: 'relative',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
    border: '6px solid #1a1a1a',
    borderRadius: '24px',
    padding: '40px',
    marginTop: '40px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 12px 12px 0 #1a1a1a',
    overflow: 'hidden',
  },
  confettiOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 9999,
  },
  confettiParticle: {
    position: 'absolute',
    width: '12px',
    height: '12px',
    border: '2px solid #1a1a1a',
    borderRadius: '2px',
  },
  ticketHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '32px',
  },
  ticketStars: {
    fontSize: '32px',
    animation: 'sparkle 1.5s infinite',
  },
  ticketTitle: {
    fontSize: '48px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    margin: 0,
    textShadow: '3px 3px 0 rgba(255, 77, 109, 0.3)',
  },
  ticketAvatarContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  ticketAvatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '6px solid #1a1a1a',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    objectFit: 'cover',
    background: '#ffffff',
  },
  ticketAvatarFallback: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '6px solid #1a1a1a',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    color: '#ffffff',
  },
  ticketInfo: {
    background: 'rgba(255, 255, 255, 0.95)',
    border: '4px solid #1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'center',
  },
  ticketLabel: {
    color: '#666',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '8px',
    fontFamily: '"Comic Neue", cursive',
  },
  ticketName: {
    color: '#1a1a1a',
    fontSize: '32px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    marginBottom: '4px',
    wordBreak: 'break-all',
  },
  ticketAddress: {
    color: '#999',
    fontSize: '14px',
    fontFamily: '"Courier New", monospace',
    fontWeight: 600,
  },
  ticketPrize: {
    background: 'rgba(6, 214, 160, 0.2)',
    border: '4px solid #06d6a0',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
  },
  ticketPrizeLabel: {
    color: '#06d6a0',
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginBottom: '8px',
    fontFamily: '"Comic Neue", cursive',
  },
  ticketPrizeAmount: {
    color: '#06d6a0',
    fontSize: '56px',
    fontWeight: 900,
    fontFamily: '"Fredoka", sans-serif',
    margin: '8px 0',
    lineHeight: '1',
  },
  ticketPrizeCurrency: {
    color: '#06d6a0',
    fontSize: '20px',
    fontWeight: 700,
    fontFamily: '"Comic Neue", cursive',
    textTransform: 'uppercase',
  },
  ticketDecoration: {
    textAlign: 'center',
    fontSize: '32px',
    marginTop: '24px',
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

