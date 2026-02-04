import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Shield, Clock } from 'lucide-react';

export function Pools() {
  const navigate = useNavigate();

  const pools = [
    {
      id: 'usdc',
      name: 'USDC Pool',
      status: 'active',
      minDeposit: '$100',
      drawFrequency: 'Weekly',
      chain: 'Sepolia',
      chainId: 11155111,
      description: 'Deposit USDC and earn yield through Aave V3. Weekly draws with Chainlink VRF.',
      color: 'var(--primary)',
    },
    {
      id: 'eth',
      name: 'ETH Pool',
      status: 'coming-soon',
      minDeposit: '0.05 ETH',
      drawFrequency: 'Weekly',
      chain: 'Sepolia',
      chainId: 11155111,
      description: 'Native ETH deposits with yield generation.',
      color: 'rgba(255, 255, 255, 0.3)',
    },
    {
      id: 'weth',
      name: 'WETH Pool',
      status: 'coming-soon',
      minDeposit: '0.05 WETH',
      drawFrequency: 'Weekly',
      chain: 'Sepolia',
      chainId: 11155111,
      description: 'Wrapped ETH deposits with yield generation.',
      color: 'rgba(255, 255, 255, 0.3)',
    },
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header} className="animate-fade-in-up">
        <p style={styles.headerSubtitle}>NOCAP PROTOCOL</p>
        <h1 style={styles.headerTitle}>
          <span className="text-gradient">Lottery Pools</span>
        </h1>
        <p style={styles.headerDescription}>
          Choose a pool to enter. Deposit funds, earn yield, and win prizes. Your principal is always safe.
        </p>
      </div>

      {/* Features */}
      <div style={styles.featuresGrid} className="animate-fade-in-up stagger-2">
        <div style={styles.featureCard} className="glass hover-lift">
          <Shield style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>No Loss</h3>
          <p style={styles.featureText}>Your principal is always safe</p>
        </div>
        <div style={styles.featureCard} className="glass hover-lift">
          <TrendingUp style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Yield Generation</h3>
          <p style={styles.featureText}>Earn through Aave V3</p>
        </div>
        <div style={styles.featureCard} className="glass hover-lift">
          <Sparkles style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Fair Winners</h3>
          <p style={styles.featureText}>Chainlink VRF randomness</p>
        </div>
        <div style={styles.featureCard} className="glass hover-lift">
          <Clock style={styles.featureIcon} />
          <h3 style={styles.featureTitle}>Weekly Draws</h3>
          <p style={styles.featureText}>Consistent prize schedule</p>
        </div>
      </div>

      {/* Pool Cards */}
      <div style={styles.poolsGrid} className="animate-fade-in-up stagger-3">
        {pools.map((pool, index) => (
          <div
            key={pool.id}
            style={{
              ...styles.poolCard,
              borderColor: pool.status === 'active' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
              opacity: pool.status === 'coming-soon' ? 0.6 : 1,
            }}
            className="glass hover-lift"
          >
            {/* Status Badge */}
            <div style={styles.statusBadgeWrapper}>
              <span
                style={{
                  ...styles.statusBadge,
                  background: pool.status === 'active' ? 'rgba(0, 255, 157, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: pool.status === 'active' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.5)',
                  borderColor: pool.status === 'active' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)',
                }}
              >
                {pool.status === 'active' && <span style={styles.activePulse} />}
                {pool.status === 'active' ? 'ACTIVE' : 'COMING SOON'}
              </span>
            </div>

            {/* Pool Icon */}
            <div
              style={{
                ...styles.poolIcon,
                border: `2px solid ${pool.color}`,
                background: pool.status === 'active' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(255, 255, 255, 0.05)',
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
            <button
              onClick={() => pool.status === 'active' && navigate(`/pools/${pool.id}`)}
              disabled={pool.status === 'coming-soon'}
              style={{
                ...styles.poolButton,
                borderColor: pool.status === 'active' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.2)',
                color: pool.status === 'active' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.3)',
                cursor: pool.status === 'active' ? 'pointer' : 'not-allowed',
              }}
              className={pool.status === 'active' ? 'group' : ''}
            >
              <span style={{ position: 'relative', zIndex: 10 }}>
                {pool.status === 'active' ? 'ENTER POOL' : 'COMING SOON'}
              </span>
              {pool.status === 'active' && <span style={{ position: 'relative', zIndex: 10 }}>→</span>}
              {pool.status === 'active' && <span style={styles.buttonBg} />}
            </button>

            {/* Glow Effect */}
            {pool.status === 'active' && <div style={styles.poolGlow} />}
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div style={styles.howItWorks} className="glass animate-fade-in-up stagger-4">
        <h2 style={styles.howItWorksTitle}>
          <span className="text-gradient">How It Works</span>
        </h2>
        <div style={styles.stepsGrid}>
          <div style={styles.step}>
            <div style={styles.stepNumber} className="glass">
              <span style={styles.stepNumberText}>01</span>
            </div>
            <h3 style={styles.stepTitle}>Deposit</h3>
            <p style={styles.stepText}>Enter the pool during the deposit window</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber} className="glass">
              <span style={styles.stepNumberText}>02</span>
            </div>
            <h3 style={styles.stepTitle}>Earn Yield</h3>
            <p style={styles.stepText}>Your funds generate yield through Aave V3</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber} className="glass">
              <span style={styles.stepNumberText}>03</span>
            </div>
            <h3 style={styles.stepTitle}>Weekly Draw</h3>
            <p style={styles.stepText}>Chainlink VRF selects a random winner</p>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber} className="glass">
              <span style={styles.stepNumberText}>04</span>
            </div>
            <h3 style={styles.stepTitle}>Win Prizes</h3>
            <p style={styles.stepText}>Winner receives all yield, everyone keeps principal</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '9rem 1.5rem 4rem',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  headerSubtitle: {
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    color: 'var(--primary)',
    marginBottom: '1rem',
  },
  headerTitle: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    lineHeight: 1.1,
    marginBottom: '1rem',
  },
  headerDescription: {
    maxWidth: '600px',
    margin: '0 auto',
    fontSize: '1rem',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'monospace',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '4rem',
  },
  featureCard: {
    position: 'relative',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    transition: 'all 0.3s',
  },
  featureIcon: {
    width: '2rem',
    height: '2rem',
    color: 'var(--primary)',
    margin: '0 auto 1rem',
  },
  featureTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  featureText: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'monospace',
  },
  poolsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2rem',
    marginBottom: '5rem',
  },
  poolCard: {
    position: 'relative',
    borderRadius: 'var(--radius)',
    border: '1px solid',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '2rem',
    transition: 'all 0.3s',
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
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius)',
    border: '1px solid',
    fontFamily: 'monospace',
    fontSize: '0.65rem',
    fontWeight: '600',
    letterSpacing: '0.1em',
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
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '0.75rem',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  poolDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    fontFamily: 'monospace',
  },
  detailsTerminal: {
    position: 'relative',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '1.5rem 1rem 1rem',
    marginBottom: '1.5rem',
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
    fontSize: '0.7rem',
    lineHeight: '1.5',
    color: 'var(--primary)',
    whiteSpace: 'pre',
    margin: 0,
  },
  poolButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    border: '1px solid',
    background: 'transparent',
    padding: '0.75rem 1.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    fontWeight: '600',
    letterSpacing: '0.05em',
    transition: 'all 0.3s',
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
    borderRadius: 'var(--radius)',
    border: '1px solid var(--primary)',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '3rem 2rem',
  },
  howItWorksTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '3rem',
    fontFamily: 'monospace',
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
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '50%',
    border: '1px solid var(--primary)',
    background: 'rgba(0, 255, 157, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  stepNumberText: {
    fontFamily: 'monospace',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: 'var(--primary)',
  },
  stepTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  stepText: {
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'monospace',
    lineHeight: '1.5',
  },
};