import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { FloatingCoins } from '../components/FloatingCoins';

export function Pools() {
  const navigate = useNavigate();

  const pools = [
    {
      id: 'usdc',
      name: 'USDC Pool',
      status: 'active',
      minDeposit: '$100',
      drawFrequency: 'Weekly',
      chain: 'Multi-Chain',
      chainId: 11155111,
      description: 'Deposit USDC and earn yield through Aave V3. Weekly draws with Chainlink VRF.',
      color: 'var(--marker-cyan)',
      borderColor: 'var(--marker-cyan)',
    },
    {
      id: 'eth',
      name: 'ETH Pool',
      status: 'coming-soon',
      minDeposit: '0.05 ETH',
      drawFrequency: 'Weekly',
      chain: 'Multi-Chain',
      chainId: 11155111,
      description: 'Native ETH deposits with yield generation.',
      color: 'var(--marker-pink)',
      borderColor: 'var(--marker-pink)',
    },
    {
      id: 'weth',
      name: 'WETH Pool',
      status: 'coming-soon',
      minDeposit: '0.05 WETH',
      drawFrequency: 'Weekly',
      chain: 'Multi-Chain',
      chainId: 11155111,
      description: 'Wrapped ETH deposits with yield generation.',
      color: 'var(--marker-yellow)',
      borderColor: 'var(--marker-yellow)',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Floating Coins */}
      <FloatingCoins />
      
      {/* Header */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={styles.header}
      >
        <p style={styles.headerSubtitle}>⭐ NOCAP PROTOCOL ⭐</p>
        <h1 style={styles.headerTitle}>Lottery Pools</h1>
        <p style={styles.headerDescription}>
          Choose a pool to enter. Deposit funds, earn yield, and win prizes. Your principal is always safe.
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={styles.featuresGrid}
      >
        <motion.div style={styles.featureCard} className="card-squishy">
          <Shield style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>No Loss</h3>
          <p style={styles.featureText}>Your principal is always safe</p>
        </motion.div>
        <motion.div style={styles.featureCard} className="card-squishy">
          <TrendingUp style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Yield Generation</h3>
          <p style={styles.featureText}>Earn through Aave V3</p>
        </motion.div>
        <motion.div style={styles.featureCard} className="card-squishy">
          <Sparkles style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Fair Winners</h3>
          <p style={styles.featureText}>Chainlink VRF randomness</p>
        </motion.div>
        <motion.div style={styles.featureCard} className="card-squishy">
          <Clock style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Weekly Draws</h3>
          <p style={styles.featureText}>Consistent prize schedule</p>
        </motion.div>
      </motion.div>

      {/* Pool Cards */}
      <div style={styles.poolsGrid}>
        {pools.map((pool, index) => (
          <motion.div
            key={pool.id}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
            style={{
              ...styles.poolCard,
              borderColor: pool.borderColor,
              opacity: pool.status === 'coming-soon' ? 0.7 : 1,
              boxShadow: `6px 6px 0 var(--ink-black)`,
            }}
            className="card-squishy"
          >
            {/* Status Badge */}
            <div style={styles.statusBadgeWrapper}>
              <span
                style={{
                  ...styles.statusBadge,
                  background: pool.status === 'active' ? 'var(--marker-green)' : 'var(--marker-yellow)',
                  color: 'white',
                  borderColor: 'var(--ink-black)',
                }}
              >
                {pool.status === 'active' && <span style={styles.activePulse} />}
                {pool.status === 'active' ? '⚡ ACTIVE' : '⏳ COMING SOON'}
              </span>
            </div>

            {/* Pool Icon */}
            <div
              style={{
                ...styles.poolIcon,
                border: `4px solid ${pool.color}`,
                background: 'white',
                boxShadow: `4px 4px 0 var(--ink-black)`,
              }}
            >
              <span style={{ ...styles.poolIconText, color: pool.color }}>
                {pool.name[0]}
              </span>
            </div>

            {/* Pool Info */}
            <h2 style={styles.poolName}>{pool.name}</h2>
            <p style={styles.poolDescription}>{pool.description}</p>

            {/* Pool Details - Terminal Style */}
            <div style={styles.detailsTerminal} className="glass">
              <div style={styles.terminalHeader}>
                <div style={styles.terminalDots}>
                  <div style={{ ...styles.dot, background: '#ff5f56' }} />
                  <div style={{ ...styles.dot, background: '#ffbd2e' }} />
                  <div style={{ ...styles.dot, background: '#27c93f' }} />
                </div>
              </div>
              <pre style={styles.detailsContent}>
{`┌──────────────────────────┐
│ Min Deposit: ${pool.minDeposit.padEnd(12)}│
│ Frequency:   ${pool.drawFrequency.padEnd(12)}│
│ Network:     ${pool.chain.padEnd(12)}│
└──────────────────────────┘`}
              </pre>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={() => pool.status === 'active' && navigate(`/pools/${pool.id}`)}
              disabled={pool.status === 'coming-soon'}
              className="btn-bounce"
              style={{
                ...styles.poolButton,
                background: pool.status === 'active' ? pool.color : 'var(--card-bg)',
                borderColor: 'var(--ink-black)',
                color: pool.status === 'active' ? 'white' : 'var(--ink-black)',
                cursor: pool.status === 'active' ? 'pointer' : 'not-allowed',
                boxShadow: pool.status === 'active' ? '4px 4px 0 var(--ink-black)' : '2px 2px 0 var(--ink-black)',
              }}
            >
              {pool.status === 'active' ? 'ENTER POOL →' : 'COMING SOON'}
            </motion.button>

            {/* Glow Effect */}
            {pool.status === 'active' && <div style={styles.poolGlow} />}
          </motion.div>
        ))}
      </div>

      {/* How It Works */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={styles.howItWorks}
      >
        <h2 style={styles.howItWorksTitle}>How It Works</h2>
        <div style={styles.stepsGrid}>
          {[
            { num: '01', title: 'Deposit', text: 'Enter the pool during the deposit window' },
            { num: '02', title: 'Earn Yield', text: 'Your funds generate yield through Aave V3' },
            { num: '03', title: 'Weekly Draw', text: 'Chainlink VRF selects a random winner' },
            { num: '04', title: 'Win Prizes', text: 'Winner receives all yield, everyone keeps principal' },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card-squishy"
              style={styles.step}
            >
              <div style={styles.stepNumber}>
                <span style={styles.stepNumberText}>{step.num}</span>
              </div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepText}>{step.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '9rem 1.5rem 4rem',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  headerSubtitle: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1.1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'var(--marker-pink)',
    marginBottom: '1rem',
    fontWeight: 900,
  },
  headerTitle: {
    fontSize: '3.5rem',
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: '1rem',
    fontFamily: 'Fredoka, sans-serif',
    color: 'var(--ink-black)',
  },
  headerDescription: {
    maxWidth: '600px',
    margin: '0 auto',
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: 'var(--ink-black)',
    fontFamily: 'Comic Neue, sans-serif',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '4rem',
  },
  featureCard: {
    position: 'relative',
    borderRadius: '16px',
    border: '4px solid var(--ink-black)',
    background: 'white',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    overflow: 'visible',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    boxShadow: '5px 5px 0 var(--ink-black)',
  },
  featureIcon: {
    width: '2.5rem',
    height: '2.5rem',
    color: 'var(--marker-cyan)',
    margin: '0 auto 1rem',
    strokeWidth: 2.5,
  },
  featureTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: 'var(--ink-black)',
    fontFamily: 'Fredoka, sans-serif',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
  },
  featureText: {
    fontSize: '0.95rem',
    color: 'var(--ink-black)',
    fontFamily: 'Comic Neue, sans-serif',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    opacity: 0.8,
  },
  poolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    marginBottom: '5rem',
  },
  poolCard: {
    position: 'relative',
    borderRadius: '16px',
    border: '4px solid',
    background: 'white',
    padding: '2rem',
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    overflow: 'visible',
  },
  statusBadgeWrapper: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 1rem',
    borderRadius: '12px',
    border: '3px solid',
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    boxShadow: '3px 3px 0 var(--ink-black)',
  },
  activePulse: {
    height: '0.4rem',
    width: '0.4rem',
    borderRadius: '50%',
    background: 'var(--primary)',
    animation: 'pulse 2s infinite',
  },
  poolIcon: {
    width: '4rem',
    height: '4rem',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  poolIconText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  poolName: {
    fontSize: '2rem',
    fontWeight: 900,
    marginBottom: '0.75rem',
    color: 'var(--ink-black)',
    fontFamily: 'Fredoka, sans-serif',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
  },
  poolDescription: {
    color: 'var(--ink-black)',
    marginBottom: '1.5rem',
    fontSize: '1rem',
    lineHeight: '1.6',
    fontFamily: 'Comic Neue, sans-serif',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    opacity: 0.8,
  },
  detailsTerminal: {
    position: 'relative',
    borderRadius: '12px',
    border: '3px solid var(--ink-black)',
    background: 'var(--bg-paper)',
    padding: '1.5rem 1rem 1rem',
    marginBottom: '1.5rem',
    boxShadow: '3px 3px 0 var(--ink-black)',
  },
  terminalHeader: {
    position: 'absolute',
    top: '0.5rem',
    left: '0.5rem',
  },
  terminalDots: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  dot: {
    height: '0.5rem',
    width: '0.5rem',
    borderRadius: '50%',
  },
  detailsContent: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    lineHeight: '1.5',
    color: 'var(--ink-black)',
    whiteSpace: 'pre',
    margin: 0,
    fontWeight: 600,
  },
  poolButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    overflow: 'visible',
    borderRadius: '12px',
    border: '4px solid',
    padding: '1rem 1.5rem',
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
    transition: 'all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    textTransform: 'uppercase',
  },
  buttonBg: {
    position: 'absolute',
    inset: 0,
    background: 'var(--primary)',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s',
    zIndex: 0,
  },
  poolGlow: {
    position: 'absolute',
    zIndex: -10,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '120%',
    height: '120%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 255, 157, 0.15) 0%, transparent 70%)',
    filter: 'blur(40px)',
    pointerEvents: 'none',
  },
  howItWorks: {
    position: 'relative',
    borderRadius: '16px',
    border: '4px solid var(--ink-black)',
    background: 'white',
    padding: '3rem 2rem',
    boxShadow: '6px 6px 0 var(--ink-black)',
  },
  howItWorksTitle: {
    fontSize: '2.5rem',
    fontWeight: 900,
    textAlign: 'center',
    marginBottom: '3rem',
    fontFamily: 'Fredoka, sans-serif',
    color: 'var(--ink-black)',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
  },
  step: {
    textAlign: 'center',
  },
  stepNumber: {
    width: '4rem',
    height: '4rem',
    borderRadius: '50%',
    border: '4px solid var(--ink-black)',
    background: 'var(--marker-yellow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
    boxShadow: '4px 4px 0 var(--ink-black)',
  },
  stepNumberText: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 900,
    color: 'var(--ink-black)',
  },
  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: 'var(--ink-black)',
    fontFamily: 'Fredoka, sans-serif',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
  },
  stepText: {
    fontSize: '1rem',
    color: 'var(--ink-black)',
    fontFamily: 'Comic Neue, sans-serif',
    lineHeight: '1.6',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    opacity: 0.8,
  },
};