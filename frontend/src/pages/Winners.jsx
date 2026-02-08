import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, ExternalLink } from 'lucide-react';
import { Header } from '../components/Header';
import { useEns } from '../hooks/useEns';

// ENS-enabled Winner Row Component
function WinnerRow({ winner, index }) {
  const { displayName, ensAvatar } = useEns(winner.address);

  // Generate avatar color from address for fallback
  const getAvatarColor = (address) => {
    const colors = ['#ff4d6d', '#00d4ff', '#ffd23f', '#06d6a0', '#c77dff', '#ff006e'];
    const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <motion.div
      key={winner.id}
      initial={{ x: -15, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="hover-lift"
      style={{
        ...styles.row,
        ...(index === 0 ? styles.firstRow : {}),
      }}
    >
      <div style={styles.rowGrid}>
        <div style={styles.rankCell}>
          <motion.span
            animate={{ rotate: [0, -8, 8, -8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
            style={styles.emoji}
          >
            {winner.emoji}
          </motion.span>
          <span style={styles.rankNumber}>#{winner.rank}</span>
        </div>

        <div style={styles.addressCell}>
          {ensAvatar ? (
            <img 
              src={ensAvatar} 
              alt="ENS Avatar"
              style={styles.avatarImage}
            />
          ) : (
            <div style={{
              ...styles.avatar,
              backgroundColor: getAvatarColor(winner.address),
            }}>
              {winner.address.slice(2, 4).toUpperCase()}
            </div>
          )}
          <span style={styles.address}>
            {displayName || `${winner.address.slice(0, 6)}...${winner.address.slice(-4)}`}
          </span>
          <a
            href={`https://etherscan.io/address/${winner.address}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex' }}
          >
            <ExternalLink style={styles.icon} />
          </a>
        </div>

        <span style={styles.prize}>{winner.prize}</span>

        <span style={styles.multiplier}>{winner.multiplier}x</span>

        <span style={styles.blockchain}>{winner.blockchain}</span>

        <span style={styles.time}>{winner.time}</span>
      </div>
    </motion.div>
  );
}

// Mock winners with real ENS addresses
const mockWinners = [
  {
    id: 1,
    rank: 1,
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
    prize: '5,250 USDC',
    multiplier: 85,
    blockchain: 'Base',
    time: '2h ago',
    emoji: '🥇',
  },
  {
    id: 2,
    rank: 2,
    address: '0x225f137127d9067788314bc7fcc1f36746a3c3B5', // lootproject.eth
    prize: '3,840 USDC',
    multiplier: 62,
    blockchain: 'Base',
    time: '5h ago',
    emoji: '🥈',
  },
  {
    id: 3,
    rank: 3,
    address: '0x983110309620D911731Ac0932219af06091b6744', // brantly.eth
    prize: '2,100 USDC',
    multiplier: 50,
    blockchain: 'Base',
    time: '8h ago',
    emoji: '🥉',
  },
  {
    id: 4,
    rank: 4,
    address: '0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5', // nick.eth
    prize: '1,650 USDC',
    multiplier: 48,
    blockchain: 'Base',
    time: '12h ago',
    emoji: '⭐',
  },
  {
    id: 5,
    rank: 5,
    address: '0x0904Dac3347eA47d208F3Fd67402D039a3b99859', // fireflies.eth
    prize: '980 USDC',
    multiplier: 45,
    blockchain: 'Base',
    time: '1d ago',
    emoji: '✨',
  },
  {
    id: 6,
    rank: 6,
    address: '0x866B3c4994e1416B7C738B9818b31dC246b95eee', // coopahtroopa.eth
    prize: '750 USDC',
    multiplier: 40,
    blockchain: 'Base',
    time: '1d ago',
    emoji: '💎',
  },
  {
    id: 7,
    rank: 7,
    address: '0x54Be3a794282C030b15E43aE2bB182E14c409C5e', // pranksy.eth
    prize: '520 USDC',
    multiplier: 35,
    blockchain: 'Base',
    time: '2d ago',
    emoji: '🎯',
  },
  {
    id: 8,
    rank: 8,
    address: '0x05F7Aa50391BfAd9F28A507F63a202547275c4eC',
    prize: '380 USDC',
    multiplier: 30,
    blockchain: 'Base',
    time: '2d ago',
    emoji: '🌟',
  },
  {
    id: 9,
    rank: 9,
    address: '0x4cAd382572C51bF90a0402E00B7882D25a161ae0',
    prize: '250 USDC',
    multiplier: 25,
    blockchain: 'Base',
    time: '3d ago',
    emoji: '🎊',
  },
  {
    id: 10,
    rank: 10,
    address: '0x260EcDd9e8bd7254a5d16eA5Dc2a3A56391FBd26',
    prize: '150 USDC',
    multiplier: 20,
    blockchain: 'Base',
    time: '3d ago',
    emoji: '🏆',
  },
];

export function Winners() {
  const [winners] = useState(mockWinners);

  return (
    <div style={styles.container}>
      <Header />
      
      <div style={styles.content}>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={styles.header}
        >
          <p style={styles.subtitle}>
            <Trophy style={{ height: '1.5rem', width: '1.5rem' }} />
            🏆 HALL OF FAME 🏆
          </p>
          <h2 style={styles.title}>Recent Winners</h2>
          <p style={styles.description}>
            Players who won big on NoCap Lottery. These could be you next! 💰
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={styles.board}
        >
          {/* Table header */}
          <div style={styles.tableHeader}>
            <span style={styles.headerCell}>RANK</span>
            <span style={styles.headerCell}>WINNER</span>
            <span style={styles.headerCell}>PRIZE</span>
            <span style={styles.headerCell}>MULTIPLIER</span>
            <span style={styles.headerCell}>NETWORK</span>
            <span style={{ ...styles.headerCell, textAlign: 'right' }}>TIME</span>
          </div>

          <div>
            {winners.map((winner, index) => (
              <WinnerRow key={winner.id} winner={winner} index={index} />
            ))}
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              ⚡ All prizes are paid instantly to winner wallets via smart contracts! ⚡
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#ffffff',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem 6rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  subtitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--marker-pink)',
    marginBottom: '1rem',
    fontWeight: 900,
  },
  title: {
    fontSize: '3rem',
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: '1rem',
    color: 'var(--ink-black)',
    fontFamily: '"Fredoka", sans-serif',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: '1.125rem',
    color: '#666',
    lineHeight: 1.6,
    fontFamily: '"Comic Neue", cursive',
    fontWeight: 600,
  },
  board: {
    background: 'white',
    border: '5px solid var(--ink-black)',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '12px 12px 0 var(--ink-black)',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 150px 120px 120px 120px',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '3px solid var(--ink-black)',
    marginBottom: '1rem',
  },
  headerCell: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '0.875rem',
    fontWeight: 900,
    color: 'var(--ink-black)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  row: {
    background: '#f8f9fa',
    border: '3px solid var(--ink-black)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '0.75rem',
    transition: 'all 0.2s',
  },
  firstRow: {
    background: 'linear-gradient(135deg, #ffd23f 0%, #ffed4e 100%)',
    border: '4px solid var(--ink-black)',
    boxShadow: '4px 4px 0 var(--ink-black)',
  },
  rowGrid: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 150px 120px 120px 120px',
    gap: '1rem',
    alignItems: 'center',
  },
  rankCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  emoji: {
    fontSize: '1.5rem',
    display: 'flex',
  },
  rankNumber: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '1rem',
    fontWeight: 900,
    color: 'var(--ink-black)',
  },
  addressCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  avatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    border: '3px solid var(--ink-black)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '0.75rem',
    fontWeight: 900,
    color: '#ffffff',
    flexShrink: 0,
  },
  avatarImage: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    border: '3px solid var(--ink-black)',
    objectFit: 'cover',
    flexShrink: 0,
  },
  address: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--ink-black)',
  },
  icon: {
    width: '1rem',
    height: '1rem',
    color: '#666',
    cursor: 'pointer',
  },
  prize: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '1rem',
    fontWeight: 900,
    color: '#06d6a0',
  },
  multiplier: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#ff4d6d',
  },
  blockchain: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#666',
  },
  time: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#999',
    textAlign: 'right',
  },
  footer: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '3px solid var(--ink-black)',
    textAlign: 'center',
  },
  footerText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#666',
  },
};

export default Winners;
