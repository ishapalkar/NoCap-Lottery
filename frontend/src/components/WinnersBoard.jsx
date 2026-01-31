import { useState, useEffect } from 'react';
import { Trophy, ExternalLink } from 'lucide-react';

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
        <div style={styles.header} className="animate-fade-in-up">
          <p style={styles.subtitle}>
            <Trophy style={{ height: '1rem', width: '1rem' }} />
            Hall of Fame
          </p>
          <h2 style={styles.title}>Recent Winners</h2>
          <p style={styles.description}>
            Live updates of players winning big on NoCap Lottery. These could be you next.
          </p>
        </div>

        <div style={styles.board} className="glass animate-scale-in">
          {/* Table header */}
          <div style={styles.tableHeader}>
            <span style={styles.headerCell}>Rank</span>
            <span style={styles.headerCell}>Address</span>
            <span style={styles.headerCell}>Prize</span>
            <span style={styles.headerCell}>Multiplier</span>
            <span style={styles.headerCell}>Network</span>
            <span style={{ ...styles.headerCell, textAlign: 'right' }}>Time</span>
          </div>

          <div style={{ borderTop: '1px solid var(--border)' }}>
            {winners.map((winner, index) => (
              <div
                key={winner.id}
                style={{
                  ...styles.row,
                  ...(index === 0 ? styles.firstRow : {}),
                  animationDelay: `${index * 50}ms`,
                }}
                className="group animate-fade-in"
              >
                <div style={styles.rowGrid}>
                  <div style={styles.rankCell}>
                    <span style={styles.emoji}>{winner.emoji}</span>
                    <span style={styles.rankNumber}>#{winner.rank}</span>
                  </div>

                  <div style={styles.addressCell}>
                    <span style={styles.address}>{winner.address}</span>
                    <ExternalLink style={styles.icon} />
                  </div>

                  <span style={styles.prize} className="text-gradient">{winner.prize}</span>

                  <span style={styles.multiplier}>{winner.multiplier}x</span>

                  <span style={styles.blockchain}>{winner.blockchain}</span>

                  <span style={styles.time}>{winner.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Winners are updated every 15 seconds. Prizes paid instantly to winner wallets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: '4rem 1.5rem',
    borderTop: '1px solid rgba(0, 255, 157, 0.1)',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2.5rem',
  },
  subtitle: {
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
    color: '#ffffff',
  },
  description: {
    maxWidth: '48rem',
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: '1.6',
  },
  board: {
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    background: 'rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1rem',
    borderBottom: '1px solid var(--border)',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '1rem 1.5rem',
  },
  headerCell: {
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  row: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(0, 255, 157, 0.05)',
    transition: 'all 0.3s',
  },
  firstRow: {
    background: 'rgba(0, 255, 157, 0.03)',
    borderLeft: '2px solid var(--primary)',
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
    gap: '0.5rem',
  },
  emoji: {
    fontSize: '1.125rem',
  },
  rankNumber: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--primary)',
  },
  addressCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  address: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  icon: {
    height: '0.75rem',
    width: '0.75rem',
    color: 'var(--muted-foreground)',
    opacity: 0.5,
  },
  prize: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  multiplier: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'var(--primary)',
    fontWeight: '600',
  },
  blockchain: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    padding: '0.375rem 0.625rem',
    borderRadius: 'calc(var(--radius) / 2)',
    background: 'rgba(34, 30, 46, 0.6)',
    width: 'fit-content',
  },
  time: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    textAlign: 'right',
  },
  footer: {
    borderTop: '1px solid var(--border)',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '1rem 1.5rem',
  },
  footerText: {
    textAlign: 'center',
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
};
