import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLotteryPoolUSDC } from '../hooks/useLotteryPoolUSDC';
import { useEns } from '../hooks/useEns';
import { Trophy, Calendar, DollarSign, Users, TrendingUp, Award, Crown, Medal, ArrowLeft, Filter } from 'lucide-react';

// ENS-enabled Winner Card Component
function WinnerCard({ winner, index, getRankEmoji, getRankColor, selectedRound, setSelectedRound }) {
  const { displayName, ensAvatar, hasEnsName } = useEns(winner.winner);

  return (
    <motion.div
      key={winner.round}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      style={{
        ...styles.winnerCard,
        borderColor: index < 3 ? getRankColor(index) : 'var(--ink-black)',
      }}
      onClick={() => setSelectedRound(selectedRound === winner.round ? null : winner.round)}
      className="hover-lift"
    >
      {/* Rank Badge */}
      <div style={{
        ...styles.rankBadge,
        background: getRankColor(index),
      }}>
        <span style={styles.rankEmoji}>{getRankEmoji(index)}</span>
        <span style={styles.rankNumber}>#{index + 1}</span>
      </div>

      {/* Winner Info */}
      <div style={styles.winnerInfo}>
        <div style={styles.winnerHeader}>
          <div style={styles.winnerDetails}>
            <p style={styles.roundLabel}>Round #{winner.round}</p>
            <div style={styles.addressWithAvatar}>
              {ensAvatar && (
                <img 
                  src={ensAvatar} 
                  alt="ENS Avatar" 
                  style={styles.ensAvatar}
                />
              )}
              <p style={styles.winnerAddress}>
                {displayName}
                {hasEnsName && <span style={styles.ensBadge}>ENS</span>}
              </p>
            </div>
          </div>
          <div style={styles.prizeBox}>
            <DollarSign size={24} color="#06d6a0" />
            <span style={styles.prizeAmount}>${winner.prizeAmount.toLocaleString()}</span>
          </div>
        </div>

        <div style={styles.winnerMeta}>
          <span style={styles.metaItem}>
            <Calendar size={16} />
            {winner.drawDate}
          </span>
          <span style={styles.metaItem}>
            <Users size={16} />
            {winner.participants} participants
          </span>
          <span style={styles.metaItem}>
            <TrendingUp size={16} />
            ${winner.totalDeposits.toLocaleString()} TVL
          </span>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {selectedRound === winner.round && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={styles.expandedDetails}
            >
              <div style={styles.detailsDivider} />
              <div style={styles.detailsGrid}>
                <div style={styles.detailBox}>
                  <p style={styles.detailLabel}>Win Chance</p>
                  <p style={styles.detailValue}>
                    {((1 / winner.participants) * 100).toFixed(4)}%
                  </p>
                </div>
                <div style={styles.detailBox}>
                  <p style={styles.detailLabel}>Their Deposit</p>
                  <p style={styles.detailValue}>
                    ${(winner.totalDeposits / winner.participants).toFixed(2)}
                  </p>
                </div>
                <div style={styles.detailBox}>
                  <p style={styles.detailLabel}>Tickets Held</p>
                  <p style={styles.detailValue}>
                    {Math.floor(winner.totalDeposits / winner.participants / 10)}
                  </p>
                </div>
                <div style={styles.detailBox}>
                  <p style={styles.detailLabel}>Prize Multiplier</p>
                  <p style={styles.detailValue}>
                    {(winner.prizeAmount / (winner.totalDeposits / winner.participants)).toFixed(2)}x
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export const Leaderboard = () => {
  const navigate = useNavigate();
  const { currentRound, prizeDrawTime } = useLotteryPoolUSDC();
  const [filter, setFilter] = useState('all'); // 'all', 'thisMonth', 'thisWeek'
  const [selectedRound, setSelectedRound] = useState(null);

  // Calculate estimated prize from pool
  const weeklyYield = 5000; // Mock value - replace with actual calculation

  // Mock data for past winners (replace with actual contract data)
  const [winners, setWinners] = useState([
    {
      round: 12,
      winner: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      shortAddress: '0x742d...0bEb',
      prizeAmount: 52340,
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      participants: 523,
      totalDeposits: 523400,
      drawDate: 'May 28, 2024',
    },
    {
      round: 11,
      winner: '0x9F8a8E4C3B2D1A0B7C6D5E4F3A2B1C0D9E8F7A6',
      shortAddress: '0x9F8a...7A6',
      prizeAmount: 48750,
      timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
      participants: 487,
      totalDeposits: 487500,
      drawDate: 'May 21, 2024',
    },
    {
      round: 10,
      winner: '0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0',
      shortAddress: '0x1A2B...9A0',
      prizeAmount: 55890,
      timestamp: Date.now() - 21 * 24 * 60 * 60 * 1000,
      participants: 558,
      totalDeposits: 558900,
      drawDate: 'May 14, 2024',
    },
    {
      round: 9,
      winner: '0xABCDEF123456789ABCDEF123456789ABCDEF1234',
      shortAddress: '0xABCD...1234',
      prizeAmount: 49320,
      timestamp: Date.now() - 28 * 24 * 60 * 60 * 1000,
      participants: 493,
      totalDeposits: 493200,
      drawDate: 'May 7, 2024',
    },
    {
      round: 8,
      winner: '0x7654321FEDCBA9876543210FEDCBA987654321F',
      shortAddress: '0x7654...321F',
      prizeAmount: 61240,
      timestamp: Date.now() - 35 * 24 * 60 * 60 * 1000,
      participants: 612,
      totalDeposits: 612400,
      drawDate: 'Apr 30, 2024',
    },
    {
      round: 7,
      winner: '0x8E9F0A1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7',
      shortAddress: '0x8E9F...D6E7',
      prizeAmount: 47560,
      timestamp: Date.now() - 42 * 24 * 60 * 60 * 1000,
      participants: 475,
      totalDeposits: 475600,
      drawDate: 'Apr 23, 2024',
    },
    {
      round: 6,
      winner: '0xDEADBEEF1234567890ABCDEF1234567890ABCD',
      shortAddress: '0xDEAD...ABCD',
      prizeAmount: 58920,
      timestamp: Date.now() - 49 * 24 * 60 * 60 * 1000,
      participants: 589,
      totalDeposits: 589200,
      drawDate: 'Apr 16, 2024',
    },
    {
      round: 5,
      winner: '0xCAFEBABE9876543210FEDCBA9876543210FEDC',
      shortAddress: '0xCAFE...FEDC',
      prizeAmount: 44870,
      timestamp: Date.now() - 56 * 24 * 60 * 60 * 1000,
      participants: 448,
      totalDeposits: 448700,
      drawDate: 'Apr 9, 2024',
    },
  ]);

  // Calculate stats
  const totalPrizesAwarded = winners.reduce((sum, w) => sum + w.prizeAmount, 0);
  const averagePrize = totalPrizesAwarded / winners.length;
  const totalParticipantsAllTime = winners.reduce((sum, w) => sum + w.participants, 0);
  const largestPrize = Math.max(...winners.map(w => w.prizeAmount));

  // Filter function
  const filteredWinners = winners.filter(winner => {
    const winnerDate = new Date(winner.timestamp);
    const now = new Date();
    
    if (filter === 'thisWeek') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return winnerDate >= weekAgo;
    } else if (filter === 'thisMonth') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return winnerDate >= monthAgo;
    }
    return true; // 'all'
  });

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🏅';
  };

  const getRankColor = (index) => {
    if (index === 0) return '#ffd23f'; // Gold
    if (index === 1) return '#c0c0c0'; // Silver
    if (index === 2) return '#cd7f32'; // Bronze
    return '#00d4ff'; // Cyan for others
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={styles.header}
      >
        <button 
          onClick={() => navigate('/')}
          style={styles.backButton}
          className="btn-bounce"
        >
          <ArrowLeft size={20} style={{ marginRight: '8px' }} />
          Back Home
        </button>
        
        <h1 style={styles.title}>🏆 Winners Leaderboard</h1>
        <p style={styles.subtitle}>Hall of Fame - Past Prize Winners</p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={styles.statsContainer}
      >
        <div style={styles.statCard}>
          <DollarSign size={40} color="#00d4ff" />
          <p style={styles.statValue}>${totalPrizesAwarded.toLocaleString()}</p>
          <p style={styles.statLabel}>Total Prizes Awarded</p>
        </div>

        <div style={styles.statCard}>
          <TrendingUp size={40} color="#06d6a0" />
          <p style={styles.statValue}>${averagePrize.toLocaleString()}</p>
          <p style={styles.statLabel}>Average Prize</p>
        </div>

        <div style={styles.statCard}>
          <Users size={40} color="#ff4d6d" />
          <p style={styles.statValue}>{totalParticipantsAllTime.toLocaleString()}</p>
          <p style={styles.statLabel}>Total Participants</p>
        </div>

        <div style={styles.statCard}>
          <Trophy size={40} color="#ffd23f" />
          <p style={styles.statValue}>${largestPrize.toLocaleString()}</p>
          <p style={styles.statLabel}>Largest Prize</p>
        </div>
      </motion.div>

      {/* Current Round Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={styles.currentRoundBanner}
      >
        <Crown size={48} color="#ffd23f" />
        <div>
          <h2 style={styles.bannerTitle}>Current Round #{currentRound}</h2>
          <p style={styles.bannerText}>
            Prize Pool: <strong>${weeklyYield.toLocaleString()}</strong>
          </p>
          <p style={styles.bannerSubtext}>
            Be the next winner! Deposit now to participate 🎮
          </p>
        </div>
        <button
          onClick={() => navigate('/pools')}
          style={styles.playNowButton}
          className="btn-bounce"
        >
          🎯 Play Now
        </button>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        style={styles.filterContainer}
      >
        <Filter size={20} style={{ marginRight: '12px' }} />
        <button
          onClick={() => setFilter('all')}
          style={{
            ...styles.filterButton,
            background: filter === 'all' ? 'var(--marker-cyan)' : 'white',
          }}
          className="btn-bounce"
        >
          All Time
        </button>
        <button
          onClick={() => setFilter('thisMonth')}
          style={{
            ...styles.filterButton,
            background: filter === 'thisMonth' ? 'var(--marker-cyan)' : 'white',
          }}
          className="btn-bounce"
        >
          This Month
        </button>
        <button
          onClick={() => setFilter('thisWeek')}
          style={{
            ...styles.filterButton,
            background: filter === 'thisWeek' ? 'var(--marker-cyan)' : 'white',
          }}
          className="btn-bounce"
        >
          This Week
        </button>
      </motion.div>

      {/* Winners List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        style={styles.winnersContainer}
      >
        <h2 style={styles.sectionTitle}>🎊 Past Winners</h2>
        
        <AnimatePresence mode="popLayout">
          {filteredWinners.map((winner, index) => (
            <WinnerCard
              key={winner.round}
              winner={winner}
              index={index}
              getRankEmoji={getRankEmoji}
              getRankColor={getRankColor}
              selectedRound={selectedRound}
              setSelectedRound={setSelectedRound}
            />
          ))}
        </AnimatePresence>
                      >
                        🔍 View on BaseScan
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredWinners.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.emptyState}
          >
            <Trophy size={64} color="#ccc" />
            <p style={styles.emptyText}>No winners in this time period</p>
            <button
              onClick={() => setFilter('all')}
              style={styles.resetFilterButton}
              className="btn-bounce"
            >
              View All Winners
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        style={styles.ctaCard}
      >
        <Award size={48} color="#ff4d6d" />
        <h2 style={styles.ctaTitle}>🌟 Your Name Could Be Next!</h2>
        <p style={styles.ctaText}>
          Join thousands of players in the no-loss lottery. Deposit USDC, earn yield, and win big prizes!
        </p>
        <div style={styles.ctaButtons}>
          <button
            onClick={() => navigate('/pools')}
            style={styles.ctaButtonPrimary}
            className="btn-bounce"
          >
            🎮 Start Playing
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={styles.ctaButtonSecondary}
            className="btn-bounce"
          >
            📊 View Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '40px 20px',
    maxWidth: '1200px',
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
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    background: 'white',
    border: '5px solid var(--ink-black)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '5px 5px 0 var(--ink-black)',
  },
  statValue: {
    fontSize: '32px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    margin: '12px 0 4px 0',
  },
  statLabel: {
    fontSize: '14px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: 0,
    opacity: 0.7,
  },
  currentRoundBanner: {
    background: 'linear-gradient(135deg, #ffd23f 0%, #ffed4e 100%)',
    border: '5px solid var(--ink-black)',
    borderRadius: '20px',
    padding: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '32px',
    boxShadow: '6px 6px 0 var(--ink-black)',
  },
  bannerTitle: {
    fontSize: '28px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    margin: '0 0 8px 0',
  },
  bannerText: {
    fontSize: '18px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: '0 0 4px 0',
  },
  bannerSubtext: {
    fontSize: '14px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: 0,
    opacity: 0.8,
  },
  playNowButton: {
    padding: '16px 32px',
    fontSize: '18px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    background: 'var(--marker-pink)',
    color: 'white',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 var(--ink-black)',
    marginLeft: 'auto',
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
    padding: '20px',
    background: 'white',
    border: '3px solid var(--ink-black)',
    borderRadius: '16px',
    boxShadow: '4px 4px 0 var(--ink-black)',
  },
  filterButton: {
    padding: '10px 20px',
    fontSize: '16px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    border: '3px solid var(--ink-black)',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '2px 2px 0 var(--ink-black)',
  },
  winnersContainer: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '32px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    margin: '0 0 24px 0',
  },
  winnerCard: {
    background: 'white',
    border: '5px solid',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '5px 5px 0 var(--ink-black)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  rankBadge: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    padding: '8px 16px',
    borderBottomLeftRadius: '12px',
    border: '3px solid var(--ink-black)',
    borderTop: 'none',
    borderRight: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  rankEmoji: {
    fontSize: '24px',
  },
  rankNumber: {
    fontSize: '18px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
  },
  winnerInfo: {
    paddingRight: '80px',
  },
  winnerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  roundLabel: {
    fontSize: '14px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: '0 0 4px 0',
    opacity: 0.7,
  },
  winnerAddress: {
    fontSize: '20px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  addressWithAvatar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  ensAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid var(--marker-cyan)',
    objectFit: 'cover',
    flexShrink: 0,
  },
  ensBadge: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '0.7rem',
    fontWeight: '900',
    color: 'white',
    background: 'linear-gradient(135deg, #5298FF 0%, #3B7EEE 100%)',
    padding: '2px 8px',
    borderRadius: '6px',
    border: '2px solid var(--ink-black)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginLeft: '8px',
  },
  winnerDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  prizeBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#e6f9f5',
    padding: '12px 20px',
    borderRadius: '12px',
    border: '3px solid var(--ink-black)',
  },
  prizeAmount: {
    fontSize: '24px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: '#06d6a0',
  },
  winnerMeta: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    opacity: 0.8,
  },
  expandedDetails: {
    overflow: 'hidden',
  },
  detailsDivider: {
    height: '3px',
    background: 'var(--ink-black)',
    margin: '20px 0',
    opacity: 0.2,
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  detailBox: {
    background: '#f8f9fa',
    border: '3px solid var(--ink-black)',
    borderRadius: '10px',
    padding: '16px',
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: '12px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: '0 0 4px 0',
    opacity: 0.7,
  },
  detailValue: {
    fontSize: '20px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    margin: 0,
  },
  viewOnExplorerButton: {
    width: '100%',
    padding: '12px 24px',
    fontSize: '16px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    background: 'var(--marker-cyan)',
    border: '3px solid var(--ink-black)',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '3px 3px 0 var(--ink-black)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    border: '5px solid var(--ink-black)',
    borderRadius: '16px',
    boxShadow: '5px 5px 0 var(--ink-black)',
  },
  emptyText: {
    fontSize: '18px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'var(--ink-black)',
    margin: '16px 0 24px 0',
    opacity: 0.6,
  },
  resetFilterButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    background: 'var(--marker-cyan)',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '3px 3px 0 var(--ink-black)',
  },
  ctaCard: {
    background: 'linear-gradient(135deg, #ff4d6d 0%, #ff6b81 100%)',
    border: '5px solid var(--ink-black)',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '6px 6px 0 var(--ink-black)',
  },
  ctaTitle: {
    fontSize: '32px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    color: 'white',
    margin: '16px 0',
  },
  ctaText: {
    fontSize: '18px',
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
    color: 'white',
    margin: '0 0 32px 0',
    lineHeight: 1.6,
  },
  ctaButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaButtonPrimary: {
    padding: '16px 32px',
    fontSize: '18px',
    fontFamily: '"Fredoka", sans-serif',
    fontWeight: 900,
    background: 'var(--marker-yellow)',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '4px 4px 0 var(--ink-black)',
  },
  ctaButtonSecondary: {
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
};
