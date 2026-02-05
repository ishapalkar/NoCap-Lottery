import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function ActivePools() {
  const navigate = useNavigate();
  
  const pools = [
    {
      id: 'stablecoins',
      name: 'Stablecoin Vault',
      icon: '$',
      token: 'USDC/USDT/DAI',
      pot: '$50,000',
      boost: '+12.5%',
      boostPercent: 35,
      bgColor: '#ffd23f',
      isActive: true,
    },
    {
      id: 'eth',
      name: 'ETH Pool',
      icon: '≡',
      token: 'ETH',
      pot: '$25,000',
      boost: '+8.2%',
      boostPercent: 28,
      bgColor: '#00d4ff',
      isActive: true,
    },
    {
      id: 'btc',
      name: 'BTC Pool',
      icon: '₿',
      token: 'WBTC',
      pot: '$100,000',
      boost: '+5.5%',
      boostPercent: 22,
      bgColor: '#ff6b6b',
      isActive: false,
      comingSoon: true,
    },
  ];

  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      style={styles.section}
    >
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>ACTIVE POOLS</h2>
          <div style={styles.underline} />
        </div>
        
        <div style={styles.poolsGrid}>
          {pools.map((pool, index) => (
            <motion.div
              key={pool.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
              className="card-squishy"
              style={styles.poolCard}
            >
              {/* Coming Soon Badge */}
              {pool.comingSoon && (
                <div style={styles.comingSoonBadge}>
                  🚀 COMING SOON
                </div>
              )}
              
              {/* Icon */}
              <div style={{ ...styles.poolIcon, background: pool.bgColor }}>
                <span style={styles.iconText}>{pool.icon}</span>
              </div>
              
              {/* Pool Name */}
              <h3 style={styles.poolName}>{pool.name}</h3>
              <p style={styles.poolToken}>{pool.token}</p>
              
              {/* The Pot */}
              <div style={styles.potSection}>
                <span style={styles.potLabel}>THE POT!</span>
                <span style={styles.potAmount}>{pool.pot}</span>
              </div>
              
              {/* APY Boost */}
              <div style={styles.boostSection}>
                <div style={styles.boostHeader}>
                  <span style={styles.boostLabel}>APY BOOST</span>
                  <span style={styles.boostValue}>{pool.boost}</span>
                </div>
                <div style={styles.miniProgressBar}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pool.boostPercent}%` }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.05, ease: "easeOut" }}
                    style={styles.miniProgressFill}
                  />
                </div>
              </div>
              
              {/* Go Play Button */}
              <motion.button
                className="btn-bounce"
                onClick={() => pool.isActive ? navigate(`/pools/${pool.id}`) : null}
                style={{
                  ...styles.playButton,
                  ...(pool.comingSoon && styles.playButtonDisabled),
                }}
                disabled={pool.comingSoon}
              >
                {pool.comingSoon ? 'COMING SOON' : 'GO PLAY!'}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

const styles = {
  section: {
    padding: '3rem 1.5rem 4rem',
    background: '#ffffff',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 900,
    fontFamily: 'Fredoka, sans-serif',
    color: 'var(--ink-black)',
    letterSpacing: '0.02em',
    marginBottom: '0.5rem',
  },
  underline: {
    width: '120px',
    height: '6px',
    background: 'var(--marker-cyan)',
    margin: '0 auto',
    borderRadius: '3px',
    border: '2px solid var(--ink-black)',
  },
  poolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },
  poolCard: {
    background: '#ffffff',
    border: '4px solid var(--ink-black)',
    borderRadius: '16px',
    padding: '2rem 1.5rem',
    boxShadow: '6px 6px 0 var(--ink-black)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    cursor: 'pointer',
    transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  poolIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    border: '3px solid var(--ink-black)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    boxShadow: '3px 3px 0 var(--ink-black)',
  },
  iconText: {
    fontSize: '2rem',
    fontWeight: 900,
    color: 'var(--ink-black)',
  },
  poolName: {
    fontSize: '1.25rem',
    fontWeight: 900,
    fontFamily: 'Fredoka, sans-serif',
    color: 'var(--ink-black)',
    marginBottom: '0.25rem',
    textDecoration: 'underline',
    textDecorationThickness: '2px',
    textUnderlineOffset: '3px',
  },
  poolToken: {
    fontSize: '0.9rem',
    fontFamily: 'Fredoka, sans-serif',
    color: 'var(--ink-black)',
    opacity: 0.7,
    marginBottom: '1.5rem',
    fontWeight: 700,
  },
  potSection: {
    background: '#f0f0f0',
    border: '3px solid var(--ink-black)',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  potLabel: {
    fontSize: '0.75rem',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    letterSpacing: '0.05em',
  },
  potAmount: {
    fontSize: '1.75rem',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 900,
    color: 'var(--marker-cyan)',
  },
  boostSection: {
    marginBottom: '1.5rem',
  },
  boostHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  boostLabel: {
    fontSize: '0.75rem',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 900,
    color: 'var(--ink-black)',
    fontStyle: 'italic',
  },
  boostValue: {
    fontSize: '0.9rem',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 900,
    color: '#ff4d6d',
  },
  miniProgressBar: {
    width: '100%',
    height: '12px',
    background: '#ffffff',
    border: '2px solid var(--ink-black)',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '2px 2px 0 var(--ink-black)',
  },
  miniProgressFill: {
    height: '100%',
    background: 'var(--marker-cyan)',
  },
  playButton: {
    width: '100%',
    padding: '0.875rem',
    background: 'var(--marker-cyan)',
    color: 'white',
    border: '4px solid var(--ink-black)',
    borderRadius: '10px',
    fontSize: '1rem',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '4px 4px 0 var(--ink-black)',
    transition: 'all 0.1s ease',
  },
  playButtonDisabled: {
    background: '#cccccc',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ff4d6d 100%)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '2px solid var(--ink-black)',
    fontSize: '0.7rem',
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    boxShadow: '3px 3px 0 rgba(0,0,0,0.2)',
    zIndex: 10,
  },
    borderRadius: '12px',
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1.1rem',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '4px 4px 0 var(--ink-black)',
    transition: 'all 0.1s cubic-bezier(0.34, 1.56, 0.64, 1)',
    textTransform: 'uppercase',
  },
};
