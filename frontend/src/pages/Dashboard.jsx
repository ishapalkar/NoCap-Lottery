import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Users, Trophy, Coins, Calendar, ArrowRight } from 'lucide-react';
import { useLotteryPoolUSDC } from '../hooks/useLotteryPoolUSDC';
import { useUSDCVault } from '../hooks/useUSDCVault';
import { useCountdown } from '../hooks/useCountdown';

export function Dashboard() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { 
    currentRound,
    depositWindowEnd,
    prizeDrawTime,
    userDeposits,
    minDeposit,
    depositWindowOpen,
    drawPhaseActive
  } = useLotteryPoolUSDC(address);
  const { totalAssets } = useUSDCVault();
  const depositCountdown = useCountdown(depositWindowEnd * 1000); // Convert to ms
  const drawCountdown = useCountdown(prizeDrawTime * 1000); // Convert to ms

  // Calculate pool stats
  const totalYield = totalAssets > 0 ? ((totalAssets * 0.08) / 52).toFixed(2) : '0'; // ~8% APY / 52 weeks
  const estimatedPrize = totalYield;
  const participantCount = totalAssets > 0 && minDeposit > 0 ? Math.floor(totalAssets / minDeposit) : 0;
  const userWinChance = userDeposits > 0 && totalAssets > 0 ? ((userDeposits / totalAssets) * 100).toFixed(2) : '0';

  // Determine current phase
  const getCurrentPhase = () => {
    if (depositWindowOpen) return 'DEPOSIT';
    if (drawPhaseActive) return 'DRAW';
    return 'YIELD';
  };

  const currentPhase = getCurrentPhase();

  if (!isConnected) {
    return (
      <div style={styles.container}>
        <Header />
        <FloatingCoins />
        <div style={styles.content}>
          <motion.div
            style={styles.emptyState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.emptyIcon}>🔒</div>
            <h2 style={styles.emptyTitle}>CONNECT WALLET</h2>
            <p style={styles.emptyText}>Connect your wallet to view your dashboard</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Header />
      <FloatingCoins />
      
      <div style={styles.content}>
        {/* Page Title */}
        <motion.div
          style={styles.titleSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 style={styles.title}>MY DASHBOARD</h1>
          <p style={styles.subtitle}>Track your deposits, winnings, and pool performance</p>
        </motion.div>

        {/* Phase Indicator */}
        <motion.div
          style={styles.phaseCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div style={styles.phaseHeader}>
            <div style={styles.phaseIcon}>
              {currentPhase === 'DEPOSIT' && '📥'}
              {currentPhase === 'YIELD' && '💰'}
              {currentPhase === 'DRAW' && '🎲'}
            </div>
            <div>
              <h3 style={styles.phaseTitle}>CURRENT PHASE</h3>
              <div style={styles.phaseLabel}>
                {currentPhase === 'DEPOSIT' && 'DEPOSIT WINDOW OPEN'}
                {currentPhase === 'YIELD' && 'YIELD GENERATION'}
                {currentPhase === 'DRAW' && 'DRAW READY'}
              </div>
            </div>
          </div>
          <div style={styles.phaseCountdown}>
            <Clock size={20} />
            <span>
              {currentPhase === 'DEPOSIT' && `Closes in ${depositCountdown.formatted}`}
              {currentPhase === 'YIELD' && `Draw in ${drawCountdown.formatted}`}
              {currentPhase === 'DRAW' && 'Winner selection ready'}
            </span>
          </div>
        </motion.div>

        {/* Account Stats Grid */}
        <div style={styles.statsGrid}>
          {/* Your Deposits */}
          <motion.div
            style={styles.statCard}
            className="card-squishy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div style={styles.statIcon}>💵</div>
            <div style={styles.statLabel}>YOUR DEPOSITS</div>
            <div style={styles.statValue}>${userDeposits.toLocaleString()}</div>
            <div style={styles.statSubtext}>USDC in pool</div>
          </motion.div>

          {/* Pool Shares */}
          <motion.div
            style={styles.statCard}
            className="card-squishy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <div style={styles.statIcon}>🎫</div>
            <div style={styles.statLabel}>YOUR TICKETS</div>
            <div style={styles.statValue}>{Math.floor(userDeposits / 10)}</div>
            <div style={styles.statSubtext}>1 USDC = 1 ticket</div>
          </motion.div>

          {/* Win Chance */}
          <motion.div
            style={styles.statCard}
            className="card-squishy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div style={styles.statIcon}>🎯</div>
            <div style={styles.statLabel}>WIN CHANCE</div>
            <div style={styles.statValue}>{userWinChance}%</div>
            <div style={styles.statSubtext}>This round</div>
          </motion.div>

          {/* Prize Estimate */}
          <motion.div
            style={styles.statCard}
            className="card-squishy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <div style={styles.statIcon}>🏆</div>
            <div style={styles.statLabel}>PRIZE ESTIMATE</div>
            <div style={styles.statValue}>${estimatedPrize}</div>
            <div style={styles.statSubtext}>This week's yield</div>
          </motion.div>
        </div>

        {/* Pool Performance */}
        <motion.div
          style={styles.performanceCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h3 style={styles.sectionTitle}>POOL PERFORMANCE</h3>
          
          <div style={styles.performanceGrid}>
            <div style={styles.performanceItem}>
              <TrendingUp size={24} style={{ color: '#00d4ff' }} />
              <div>
                <div style={styles.performanceLabel}>Total TVL</div>
                <div style={styles.performanceValue}>${totalAssets.toLocaleString()}</div>
              </div>
            </div>

            <div style={styles.performanceItem}>
              <Coins size={24} style={{ color: '#ffd23f' }} />
              <div>
                <div style={styles.performanceLabel}>Weekly Yield</div>
                <div style={styles.performanceValue}>${totalYield} (~8% APY)</div>
              </div>
            </div>

            <div style={styles.performanceItem}>
              <Users size={24} style={{ color: '#ff4d6d' }} />
              <div>
                <div style={styles.performanceLabel}>Participants</div>
                <div style={styles.performanceValue}>{participantCount} players</div>
              </div>
            </div>

            <div style={styles.performanceItem}>
              <Calendar size={24} style={{ color: '#06d6a0' }} />
              <div>
                <div style={styles.performanceLabel}>Current Round</div>
                <div style={styles.performanceValue}>#{currentRound}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          style={styles.actionsCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <h3 style={styles.sectionTitle}>QUICK ACTIONS</h3>
          
          <div style={styles.actionsGrid}>
            <motion.button
              onClick={() => navigate('/pools/usdc')}
              style={{...styles.actionButton, background: '#00d4ff'}}
              className="btn-bounce"
            >
              <span style={styles.actionIcon}>💰</span>
              <span style={styles.actionText}>Deposit More</span>
              <ArrowRight size={20} />
            </motion.button>

            <motion.button
              onClick={() => navigate('/withdraw')}
              style={{...styles.actionButton, background: '#ff4d6d'}}
              className="btn-bounce"
            >
              <span style={styles.actionIcon}>🏦</span>
              <span style={styles.actionText}>Withdraw</span>
              <ArrowRight size={20} />
            </motion.button>

            <motion.button
              onClick={() => navigate('/leaderboard')}
              style={{...styles.actionButton, background: '#ffd23f'}}
              className="btn-bounce"
            >
              <span style={styles.actionIcon}>🏆</span>
              <span style={styles.actionText}>View Winners</span>
              <ArrowRight size={20} />
            </motion.button>

            <motion.button
              onClick={() => navigate('/pools')}
              style={{...styles.actionButton, background: '#06d6a0'}}
              className="btn-bounce"
            >
              <span style={styles.actionIcon}>🎮</span>
              <span style={styles.actionText}>All Pools</span>
              <ArrowRight size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Withdrawal Warning */}
        {userDeposits > 0 && (
          <motion.div
            style={styles.warningCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div style={styles.warningIcon}>⚠️</div>
            <div>
              <div style={styles.warningTitle}>Withdrawal Notice</div>
              <div style={styles.warningText}>
                Withdrawing before the draw ends will forfeit your chance to win this week's prize. 
                Your principal is always safe and can be withdrawn anytime.
              </div>
            </div>
          </motion.div>
        )}
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
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '100px 40px 60px',
    position: 'relative',
    zIndex: 1,
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: '40px',
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
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    margin: 0,
  },
  phaseCard: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '40px',
    boxShadow: '12px 12px 0 #1a1a1a',
  },
  phaseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  phaseIcon: {
    fontSize: '48px',
  },
  phaseTitle: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    margin: '0 0 8px',
    textTransform: 'uppercase',
  },
  phaseLabel: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '24px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: 0,
  },
  phaseCountdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: '"Comic Neue", cursive',
    fontSize: '18px',
    fontWeight: '700',
    color: '#00d4ff',
    background: '#f5f5f5',
    padding: '16px 24px',
    borderRadius: '12px',
    border: '3px solid #1a1a1a',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '8px 8px 0 #1a1a1a',
    transition: 'all 0.2s',
  },
  statIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  statLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '12px',
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  statValue: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '32px',
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: '4px',
  },
  statSubtext: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#999',
  },
  performanceCard: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '40px',
    boxShadow: '12px 12px 0 #1a1a1a',
  },
  sectionTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '24px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '0 0 24px',
    textTransform: 'uppercase',
  },
  performanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
  },
  performanceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: '#f5f5f5',
    borderRadius: '12px',
    border: '3px solid #1a1a1a',
  },
  performanceLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '4px',
  },
  performanceValue: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '20px',
    fontWeight: '900',
    color: '#1a1a1a',
  },
  actionsCard: {
    background: '#ffffff',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '40px',
    boxShadow: '12px 12px 0 #1a1a1a',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '16px',
    fontWeight: '900',
    color: '#1a1a1a',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    padding: '16px 20px',
    cursor: 'pointer',
    boxShadow: '6px 6px 0 #1a1a1a',
    transition: 'all 0.15s',
    textTransform: 'uppercase',
  },
  actionIcon: {
    fontSize: '24px',
  },
  actionText: {
    flex: 1,
    textAlign: 'left',
  },
  warningCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
    background: '#fff9e6',
    border: '4px solid #ffd23f',
    borderRadius: '16px',
    padding: '24px',
  },
  warningIcon: {
    fontSize: '32px',
  },
  warningTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '18px',
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  warningText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    lineHeight: '1.6',
  },
  emptyState: {
    textAlign: 'center',
    padding: '100px 20px',
  },
  emptyIcon: {
    fontSize: '80px',
    marginBottom: '24px',
  },
  emptyTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '32px',
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: '12px',
  },
  emptyText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
  },
};

export default Dashboard;
