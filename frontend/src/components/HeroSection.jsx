import { useState, useEffect } from 'react';

const roles = ['no cap', 'no loss', 'no risk', 'no scam', 'no stress', 'no worries'];

export function HeroSection({ onPlayClick }) {
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const targetText = roles[currentRole];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < targetText.length) {
            setDisplayText(targetText.slice(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentRole((prev) => (prev + 1) % roles.length);
          }
        }
      },
      isDeleting ? 50 : 100
    );
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentRole]);

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.grid} className="hero-grid-responsive">
          <div style={styles.leftColumn}>
            <div style={styles.textContent} className="animate-fade-in-up">
              <p style={styles.subtitle}>NoCap Protocol — Cross-Chain Prize Savings</p>
              <h1 style={styles.title}>
                Save with
                <br />
                <span className="text-gradient typing-cursor">{displayText}</span>
              </h1>
            </div>

            <p style={styles.description} className="animate-fade-in-up stagger-2">
              A cross-chain no-loss prize savings protocol. Deposit stablecoins from any chain via LI.FI, earn Aave yield on Base Sepolia, 
              and compete for prizes from the yield pool.
              <span style={{ color: 'var(--foreground)', fontWeight: 500 }}> Your principal is always safe and withdrawable.</span>
            </p>

            <div style={styles.buttons} className="animate-fade-in-up stagger-3">
              <button onClick={onPlayClick} style={styles.primaryButton} className="group">
                <span style={{ position: 'relative', zIndex: 10 }}>play now</span>
                <span style={{ position: 'relative', zIndex: 10, transition: 'transform 0.3s' }}>→</span>
                <span style={styles.buttonBg} />
              </button>
              <button style={styles.secondaryButton} className="group">
                <span>how it works</span>
                <span style={styles.arrow}>→</span>
              </button>
            </div>
          </div>

          <div style={styles.rightColumn} className="animate-scale-in stagger-4">
            <div style={styles.terminal} className="glass hover-lift">
              <div style={styles.terminalDots}>
                <div style={{ ...styles.dot, background: '#ff5f56' }} />
                <div style={{ ...styles.dot, background: '#ffbd2e' }} />
                <div style={{ ...styles.dot, background: '#27c93f' }} />
              </div>
              <div style={styles.terminalTitle}>terminal://nocap-lottery</div>

              <pre style={styles.ascii}>
{`┌────────────────────────────────────┐
│  PROTOCOL ARCHITECTURE             │
├────────────────────────────────────┤
│                                    │
│  1. Deposit via LI.FI Bridge       │
│     → Any chain → Base Sepolia     │
│                                    │
│  2. Funds in Aave ERC-4626 Vault   │
│     → Principal Protected          │
│     → Yield Accumulates            │
│                                    │
│  3. Yield → Prize Distribution     │
│     → Winners via ENS              │
│     → Principal Always Safe        │
│                                    │
│  Status: LIVE ON BASE SEPOLIA      │
└────────────────────────────────────┘`}
              </pre>
            </div>

            <div style={styles.badge} className="animate-float">
              <span style={styles.badgeContent}>
                <span style={styles.pulse} />
                v0.1.0
              </span>
            </div>
            <div style={styles.dateBadge} className="animate-float">
              Dec. 2025
            </div>

            <div style={styles.glow} />
          </div>
        </div>
      </div>

      <div style={styles.scrollIndicator} className="animate-fade-in stagger-6">
        <span style={styles.scrollText}>scroll</span>
        <div style={styles.scrollLine} />
      </div>
    </section>
  );
}

const styles = {
  section: {
    position: 'relative',
    padding: '9rem 1.5rem 6rem',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  grid: {
    display: 'grid',
    gap: '4rem',
    gridTemplateColumns: '1fr',
    alignItems: 'center',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  textContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  subtitle: {
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.2em',
    color: 'var(--primary)',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    lineHeight: 1.1,
    color: '#ffffff',
  },
  description: {
    maxWidth: '500px',
    fontSize: '1rem',
    lineHeight: '1.6',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  buttons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  primaryButton: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--primary)',
    background: 'transparent',
    padding: '0.75rem 1.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'var(--primary)',
    textDecoration: 'none',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  secondaryButton: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    borderRadius: 'var(--radius)',
    border: 'none',
    background: 'transparent',
    padding: '0.75rem 1.5rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    color: 'rgba(255, 255, 255, 0.5)',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  rightColumn: {
    position: 'relative',
  },
  terminal: {
    position: 'relative',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--primary)',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '1.5rem',
  },
  terminalDots: {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  dot: {
    height: '0.6rem',
    width: '0.6rem',
    borderRadius: '50%',
    transition: 'background 0.3s',
  },
  terminalTitle: {
    position: 'absolute',
    top: '0.6rem',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'transparent',
    padding: '0.25rem 0.75rem',
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  ascii: {
    marginTop: '1.5rem',
    overflow: 'hidden',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    lineHeight: '1.5',
    color: 'var(--primary)',
    whiteSpace: 'pre',
  },
  badge: {
    position: 'absolute',
    right: '-1rem',
    top: '-1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--primary)',
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '0.25rem 0.75rem',
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    color: 'var(--primary)',
  },
  badgeContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  pulse: {
    height: '0.4rem',
    width: '0.4rem',
    borderRadius: '50%',
    background: 'var(--primary)',
    animation: 'pulse 2s infinite',
  },
  dateBadge: {
    position: 'absolute',
    bottom: '-1rem',
    left: '-1rem',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '0.25rem 0.75rem',
    fontFamily: 'monospace',
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.5)',
    animationDelay: '1s',
  },
  glow: {
    position: 'absolute',
    zIndex: -10,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150%',
    height: '150%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 255, 157, 0.1) 0%, transparent 70%)',
    filter: 'blur(60px)',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  scrollText: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
  },
  scrollLine: {
    width: '1px',
    height: '3rem',
    background: 'linear-gradient(to bottom, rgba(212, 165, 116, 0.5), transparent)',
    animation: 'pulse 2s infinite',
  },
};
