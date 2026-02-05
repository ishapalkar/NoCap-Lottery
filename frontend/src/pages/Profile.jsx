import { useAccount } from 'wagmi';
import { User, Copy, ExternalLink, Award } from 'lucide-react';
import { useState } from 'react';
import { useUserEns } from '../hooks/useEns';

export function Profile() {
  const { address, isConnected } = useAccount();
  const { displayName, ensAvatar, hasEnsName, isPremiumUser, isLoading } = useUserEns(address);
  const [copied, setCopied] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openExplorer = () => {
    if (address) {
      window.open(`https://etherscan.io/address/${address}`, '_blank');
    }
  };

  // Mock stats - replace with real data from your contract
  const stats = {
    ticketsPurchased: 42,
    totalSpent: '250.00',
    timesWon: 3,
    totalWinnings: '1,250.50',
    portfolioValue: '1,500.50',
  };

  const recentActivity = [
    { type: 'purchase', description: 'Bought 5 tickets for USDC Pool', amount: '-50.00', date: '2 hours ago' },
    { type: 'win', description: 'Won ETH Pool Draw #42', amount: '+250.00', date: '1 day ago' },
    { type: 'purchase', description: 'Bought 10 tickets for BTC Pool', amount: '-100.00', date: '3 days ago' },
  ];

  if (!isConnected) {
    return (
      <div style={styles.container}>
        <div style={styles.notConnectedCard}>
          <div style={styles.emptyIcon}>
            <User style={{ width: '3rem', height: '3rem' }} />
          </div>
          <h2 style={styles.notConnectedTitle}>Wallet Not Connected</h2>
          <p style={styles.notConnectedText}>Please connect your wallet to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Profile Header */}
      <div style={styles.profileHeader}>
        <div style={styles.profileAvatarContainer}>
          <div style={styles.profileAvatar}>
            {ensAvatar ? (
              <img 
                src={ensAvatar} 
                alt="ENS Avatar" 
                style={styles.ensAvatarImg}
              />
            ) : (
              <User style={{ width: '2.5rem', height: '2.5rem', color: 'var(--ink-black)' }} />
            )}
          </div>
          {hasEnsName && (
            <div style={styles.ensBadgeProfile}>
              <Award size={14} />
              ENS
            </div>
          )}
        </div>
        <div style={styles.profileInfo}>
          <div style={styles.nameContainer}>
            <h1 style={styles.profileTitle}>
              {isLoading ? 'Loading...' : displayName}
            </h1>
            {hasEnsName && <span style={styles.premiumBadge}>✨ Premium</span>}
          </div>
          <div style={styles.addressContainer}>
            <code style={styles.addressText}>
              {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
            </code>
            <button 
              onClick={copyToClipboard} 
              style={styles.copyButton}
              title="Copy address"
              onMouseEnter={(e) => Object.assign(e.target.style, styles.copyButtonHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { transform: 'none', boxShadow: 'none' })}
            >
              <Copy style={{ width: '1rem', height: '1rem' }} />
            </button>
            <button 
              onClick={openExplorer} 
              style={styles.explorerButton}
              title="View on Etherscan"
              onMouseEnter={(e) => Object.assign(e.target.style, styles.explorerButtonHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { transform: 'none', boxShadow: 'none' })}
            >
              <ExternalLink style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>
        {copied && <div style={styles.copiedNotification}>Copied!</div>}
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {['Tickets Purchased', 'Total Spent', 'Times Won', 'Total Winnings', 'Portfolio Value', 'Win Rate'].map((label, index) => (
          <div 
            key={index}
            style={{
              ...styles.statCard,
              ...(hoveredCard === index && styles.statCardHover),
            }}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={styles.statLabel}>
              {index === 0 && 'Tickets Purchased'}
              {index === 1 && 'Total Spent'}
              {index === 2 && 'Times Won'}
              {index === 3 && 'Total Winnings'}
              {index === 4 && 'Portfolio Value'}
              {index === 5 && 'Win Rate'}
            </div>
            <div style={styles.statValue}>
              {index === 0 && stats.ticketsPurchased}
              {index === 1 && `$${stats.totalSpent}`}
              {index === 2 && stats.timesWon}
              {index === 3 && `$${stats.totalWinnings}`}
              {index === 4 && `$${stats.portfolioValue}`}
              {index === 5 && '7.1%'}
            </div>
            <div style={styles.statSubtext}>
              {index === 0 && 'Across all pools'}
              {index === 1 && 'USDC'}
              {index === 2 && 'Lucky player!'}
              {index === 3 && 'USDC'}
              {index === 4 && 'Holdings'}
              {index === 5 && '3 of 42'}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={styles.activitySection}>
        <h2 style={styles.activityTitle}>Recent Activity</h2>
        <div style={styles.activityList}>
          {recentActivity.map((activity, index) => (
            <div key={index} style={styles.activityItem}>
              <div style={styles.activityContent}>
                <div style={styles.activityDescription}>{activity.description}</div>
                <div style={styles.activityDate}>{activity.date}</div>
              </div>
              <div style={{
                ...styles.activityAmount,
                color: activity.type === 'win' ? 'var(--marker-green)' : 'var(--ink-black)'
              }}>
                {activity.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    minHeight: 'calc(100vh - 100px)',
  },
  notConnectedCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    background: 'white',
    border: '4px solid var(--ink-black)',
    borderRadius: '15px 5px 15px 5px / 5px 15px 5px 15px',
    boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.1)',
    minHeight: '300px',
  },
  emptyIcon: {
    width: '5rem',
    height: '5rem',
    background: 'var(--marker-yellow)',
    border: '4px solid var(--ink-black)',
    borderRadius: '12px 4px 12px 4px / 4px 12px 4px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    boxShadow: '4px 4px 0px var(--ink-black)',
    transform: 'rotate(-5deg)',
  },
  notConnectedTitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 800,
    fontSize: '1.75rem',
    color: 'var(--ink-black)',
    marginBottom: '0.5rem',
  },
  notConnectedText: {
    fontSize: '1rem',
    color: 'var(--ink-black)',
    opacity: 0.7,
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    marginBottom: '3rem',
    background: 'white',
    padding: '2rem',
    border: '4px solid var(--ink-black)',
    borderRadius: '15px 5px 15px 5px / 5px 15px 5px 15px',
    boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.1)',
    position: 'relative',
  },
  profileAvatarContainer: {
    flexShrink: 0,
  },
  profileAvatar: {
    width: '5rem',
    height: '5rem',
    background: 'var(--marker-cyan)',
    border: '4px solid var(--ink-black)',
    borderRadius: '12px 4px 12px 4px / 4px 12px 4px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '5px 5px 0px var(--ink-black)',
    transform: 'rotate(-3deg)',
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 900,
    fontSize: '2rem',
    color: 'var(--ink-black)',
    marginBottom: '0.5rem',
  },
  addressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  addressText: {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.95rem',
    background: 'var(--bg-offwhite)',
    padding: '0.5rem 1rem',
    border: '2px solid var(--ink-black)',
    borderRadius: '6px',
    color: 'var(--ink-black)',
  },
  copyButton: {
    background: 'var(--marker-yellow)',
    border: '2px solid var(--ink-black)',
    borderRadius: '6px',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    color: 'var(--ink-black)',
  },
  copyButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '3px 3px 0px var(--ink-black)',
  },
  explorerButton: {
    background: 'var(--marker-pink)',
    border: '2px solid var(--ink-black)',
    borderRadius: '6px',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    color: 'var(--ink-black)',
  },
  explorerButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '3px 3px 0px var(--ink-black)',
  },
  copiedNotification: {
    position: 'absolute',
    top: '-2rem',
    right: '2rem',
    background: 'var(--marker-green)',
    color: 'var(--ink-black)',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: 'bold',
    border: '2px solid var(--ink-black)',
    boxShadow: '3px 3px 0px var(--ink-black)',
    animation: 'slideDown 0.3s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  statCard: {
    background: 'white',
    border: '4px solid var(--ink-black)',
    borderRadius: '15px 5px 15px 5px / 5px 15px 5px 15px',
    padding: '1.5rem',
    boxShadow: '5px 5px 0px 0px rgba(0,0,0,0.1)',
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    cursor: 'default',
  },
  statCardHover: {
    transform: 'translateY(-5px) rotate(1deg)',
    boxShadow: '8px 8px 0px 0px rgba(0,0,0,0.15)',
  },
  statLabel: {
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 700,
    fontSize: '0.875rem',
    color: 'var(--ink-black)',
    opacity: 0.7,
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 900,
    fontSize: '2rem',
    color: 'var(--marker-cyan)',
    marginBottom: '0.5rem',
  },
  statSubtext: {
    fontSize: '0.875rem',
    color: 'var(--ink-black)',
    opacity: 0.6,
  },
  activitySection: {
    background: 'white',
    border: '4px solid var(--ink-black)',
    borderRadius: '15px 5px 15px 5px / 5px 15px 5px 15px',
    padding: '2rem',
    boxShadow: '6px 6px 0px 0px rgba(0,0,0,0.1)',
  },
  activityTitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 800,
    fontSize: '1.5rem',
    color: 'var(--ink-black)',
    marginBottom: '1.5rem',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  activityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'var(--bg-offwhite)',
    border: '2px solid var(--ink-black)',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontFamily: 'Comic Neue, cursive',
    fontWeight: 600,
    fontSize: '1rem',
    color: 'var(--ink-black)',
    marginBottom: '0.25rem',
  },
  activityDate: {
    fontSize: '0.875rem',
    color: 'var(--ink-black)',
    opacity: 0.6,
  },
  activityAmount: {
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 700,
    fontSize: '1.125rem',
    marginLeft: '1rem',
  },
  ensAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  ensBadgeProfile: {
    position: 'absolute',
    bottom: '-8px',
    right: '-8px',
    background: 'linear-gradient(135deg, #5298FF 0%, #3B7EEE 100%)',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    border: '3px solid var(--ink-black)',
    fontSize: '0.75rem',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: '900',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
  },
  nameContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '0.5rem',
  },
  premiumBadge: {
    background: 'linear-gradient(135deg, #ffd23f 0%, #ffed4e 100%)',
    color: 'var(--ink-black)',
    padding: '4px 12px',
    borderRadius: '8px',
    border: '2px solid var(--ink-black)',
    fontSize: '0.85rem',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  '@media (max-width: 768px)': {
    profileHeader: {
      flexDirection: 'column',
      textAlign: 'center',
    },
    statsGrid: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
    },
    profileTitle: {
      fontSize: '1.5rem',
    },
    statValue: {
      fontSize: '1.5rem',
    },
    addressContainer: {
      flexDirection: 'column',
    },
  },
};
