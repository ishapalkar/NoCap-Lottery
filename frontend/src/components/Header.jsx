import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Header({ onNavigate, currentView }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      style={{
        ...styles.header,
        borderBottom: isScrolled ? '1px solid rgba(47, 43, 58, 0.5)' : 'none',
        background: isScrolled ? 'rgba(12, 10, 15, 0.8)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        boxShadow: isScrolled ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
      }}
    >
      <div style={styles.container}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🎰</span>
          <span style={styles.logoText}>NoCap Lottery</span>
        </div>

        <nav style={styles.nav} className="nav-desktop">
          <button onClick={() => onNavigate('home')} style={{ ...styles.navLink, color: currentView === 'home' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.7)' }}>Home</button>
          <button onClick={() => onNavigate('play')} style={{ ...styles.navLink, color: currentView === 'play' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.7)' }}>Play</button>
          <button onClick={() => onNavigate('leaderboard')} style={{ ...styles.navLink, color: currentView === 'leaderboard' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.7)' }}>Leaderboard</button>
          <button onClick={() => onNavigate('docs')} style={{ ...styles.navLink, color: currentView === 'docs' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.7)' }}>Docs</button>
        </nav>

        <ConnectButton />
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    transition: 'all 0.3s',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  logoIcon: {
    fontSize: '1.25rem',
  },
  logoText: {
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  nav: {
    display: 'flex',
    gap: '2.5rem',
  },
  navLink: {
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    textDecoration: 'none',
    transition: 'color 0.3s',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};
