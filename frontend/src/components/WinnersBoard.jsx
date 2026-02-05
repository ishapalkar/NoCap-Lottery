import { useState, useEffect } from 'react';
import { Trophy, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEns } from '../hooks/useEns';

// ENS-enabled Winner Row Component
function WinnerRow({ winner, index }) {
  const { displayName, ensAvatar, hasEnsName } = useEns(winner.address);

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
          {ensAvatar && (
            <img 
              src={ensAvatar} 
              alt="ENS Avatar" 
              style={styles.ensAvatar}
            />
          )}
          <span style={styles.address}>
            {displayName}
            {hasEnsName && <span style={styles.ensBadge}>ENS</span>}
          </span>
          <ExternalLink style={styles.icon} />
        </div>

        <span style={styles.prize}>{winner.prize}</span>

        <span style={styles.multiplier}>{winner.multiplier}x</span>

        <span style={styles.blockchain}>{winner.blockchain}</span>

        <span style={styles.time}>{winner.time}</span>
      </div>
    </motion.div>
  );
}

const initialWinners = [
  {
    id: 1,
    rank: 1,
    address: '0x1a2b...9c8d',
    prize: '2.8 ETH',
    multiplier: 85,
    blockchain: 'Ethereum',
    time: '45 min ago',
    emoji: '🥇',
  },
  {
    id: 2,
    rank: 2,
    address: '0x5f4e...3b2a',
    prize: '1,250 MATIC',
    multiplier: 62,
    blockchain: 'Polygon',
    time: '2h 15m ago',
    emoji: '🥈',
  },
  {
    id: 3,
    rank: 3,
    address: '0x9k8j...7h6g',
    prize: '125 SOL',
    multiplier: 50,
    blockchain: 'Solana',
    time: '4h 30m ago',
    emoji: '🥉',
  },
  {
    id: 4,
    rank: 4,
    address: '0x2m3n...1l0k',
    prize: '15 BNB',
    multiplier: 48,
    blockchain: 'BNB Chain',
    time: '6h 12m ago',
    emoji: '⭐',
  },
  {
    id: 5,
    rank: 5,
    address: '0x7p6q...5o4n',
    prize: '3.2 ETH',
    multiplier: 45,
    blockchain: 'Ethereum',
    time: '8h 45m ago',
    emoji: '✨',
  },
];

export function WinnersBoard() {
  const [winners, setWinners] = useState(initialWinners);

  useEffect(() => {
    const interval = setInterval(() => {
      setWinners((prev) => {
        const newWinner = {
          id: Date.now(), // Use timestamp for truly unique IDs
          rank: 1,
          address: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
          prize: ['2.8 ETH', '1,250 MATIC', '125 SOL', '15 BNB', '3,500 USDC'][Math.floor(Math.random() * 5)],
          multiplier: Math.floor(Math.random() * 50) + 35,
          blockchain: ['Ethereum', 'Polygon', 'Solana', 'BNB Chain'][Math.floor(Math.random() * 4)],
          time: 'just now',
          emoji: ['🥇', '🎯', '✨', '🎊', '💎'][Math.floor(Math.random() * 5)],
        };
        // Update ranks for all winners
        const updatedWinners = [newWinner, ...prev.slice(0, 4)].map((winner, index) => ({
          ...winner,
          rank: index + 1
        }));
        return updatedWinners;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="winners" style={styles.section}>
      <div style={styles.container}>
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          style={styles.header}
        >
          <p style={styles.subtitle}>
            <Trophy style={{ height: '1.5rem', width: '1.5rem' }} />
            🏆 HALL OF FAME 🏆
          </p>
          <h2 style={styles.title}>Recent Winners</h2>
          <p style={styles.description}>
            Live updates of players winning big on NoCap Lottery. These could be you next! 💰
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={styles.board}
        >
          {/* Table header */}
          <div style={styles.tableHeader}>
            <span style={styles.headerCell}>RANK</span>
            <span style={styles.headerCell}>ADDRESS</span>
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
              ⚡ Winners are updated every 15 seconds. Prizes paid instantly to winner wallets! ⚡
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '5rem 1.5rem 6rem',
    background: 'var(--bg-offwhite)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '3rem',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--marker-pink)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    fontWeight: 900,
  },
  title: {
    fontSize: 'clamp(2.5rem, 6vw, 4rem)',
    fontWeight: 900,
    marginBottom: '1rem',
    color: 'var(--ink-black)',
    fontFamily: 'Fredoka, sans-serif',
    textTransform: 'uppercase',
  },
  description: {
    maxWidth: '700px',
    margin: '0 auto',
    fontSize: '1.2rem',
    color: 'var(--ink-black)',
    lineHeight: '1.6',
    fontFamily: 'Comic Neue, sans-serif',
    fontWeight: 600,
    opacity: 0.85,
  },
  board: {
    borderRadius: '20px',
    border: '5px solid var(--ink-black)',
    background: 'rgba(255, 255, 255, 0.95)',
    overflow: 'hidden',
    boxShadow: '8px 8px 0 var(--ink-black)',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1rem',
    borderBottom: '4px solid var(--ink-black)',
    background: 'var(--marker-yellow)',
    padding: '1.25rem 2rem',
  },
  headerCell: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--ink-black)',
    fontWeight: 900,
  },
  row: {
    padding: '1.5rem 2rem',
    borderBottom: '3px solid rgba(26, 26, 26, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    background: 'white',
  },
  firstRow: {
    background: 'rgba(255, 210, 63, 0.2)',
    borderLeft: '6px solid var(--marker-yellow)',
  },
  rowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1rem',
    alignItems: 'center',
  },
  rankCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  emoji: {
    fontSize: '1.5rem',
    display: 'inline-block',
  },
  rankNumber: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1.1rem',
    fontWeight: 900,
    color: 'var(--ink-black)',
  },
  addressCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  address: {
    fontFamily: 'monospace',
    fontSize: '1rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 700,
    color: 'var(--ink-black)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  ensAvatar: {
    width: '36px',
    height: '36px',
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
  },
  icon: {
    height: '1rem',
    width: '1rem',
    color: 'var(--marker-cyan)',
    strokeWidth: 3,
  },
  prize: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1.1rem',
    fontWeight: 900,
    color: 'var(--marker-pink)',
  },
  multiplier: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1.1rem',
    color: 'var(--marker-cyan)',
    fontWeight: 900,
  },
  blockchain: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '0.85rem',
    color: 'white',
    fontWeight: 700,
    padding: '0.5rem 0.875rem',
    borderRadius: '10px',
    background: 'var(--ink-black)',
    width: 'fit-content',
    border: '2px solid var(--ink-black)',
    boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
  },
  time: {
    fontFamily: 'Comic Neue, sans-serif',
    fontSize: '0.9rem',
    color: 'var(--ink-black)',
    textAlign: 'right',
    fontWeight: 600,
    opacity: 0.7,
  },
  footer: {
    borderTop: '4px solid var(--ink-black)',
    background: 'var(--marker-green)',
    padding: '1.25rem 2rem',
  },
  footerText: {
    textAlign: 'center',
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1rem',
    color: 'var(--ink-black)',
    fontWeight: 700,
  },
};
