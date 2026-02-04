import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Trophy } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header style={styles.headerWrapper}>
      <div style={styles.container}>
        <div style={styles.logo} onClick={() => navigate('/')} className="cursor-pointer">
          <div style={styles.logoIcon}>
            <Trophy style={{width: '24px', height: '24px', color: 'var(--ink-black)'}} />
          </div>
          <span style={styles.logoText}>
            NoCap<span style={{color: 'var(--marker-pink)'}}>!</span>
          </span>
        </div>

        <nav style={styles.nav}>
          <button 
            onClick={() => navigate('/')} 
            style={{ 
              ...styles.navLink,
              ...(isActive('/') && styles.navLinkActive)
            }}
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/pools')} 
            style={{ 
              ...styles.navLink,
              ...((isActive('/pools') || location.pathname.startsWith('/pools/')) && styles.navLinkActive)
            }}
          >
            Play Game
          </button>
          <button 
            onClick={() => {
              const winnersSection = document.getElementById('winners');
              if (winnersSection) {
                winnersSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('winners')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }} 
            style={styles.navLink}
          >
            Winners
          </button>
        </nav>

        <div style={styles.walletButton}>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

const styles = {
  headerWrapper: {
    position: 'sticky',
    top: '1rem',
    zIndex: 50,
    width: '100%',
    padding: '0 1rem',
    marginBottom: '2rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    height: '5rem',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1.5rem',
    background: 'white',
    borderWidth: '3px',
    borderStyle: 'solid',
    borderColor: 'var(--ink-black)',
    borderRadius: '15px 5px 15px 5px / 5px 15px 5px 15px',
    boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  logoIcon: {
    width: '2.5rem',
    height: '2.5rem',
    background: '#ffd23f',
    borderWidth: '3px',
    borderStyle: 'solid',
    borderColor: 'var(--ink-black)',
    borderRadius: '15px 5px 15px 5px / 5px 15px 5px 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(-3deg)',
    transition: 'transform 0.2s ease',
  },
  logoText: {
    fontFamily: 'Fredoka, sans-serif',
    fontWeight: 900,
    fontSize: '1.5rem',
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLink: {
    fontSize: '0.875rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    transition: 'all 0.2s ease',
    color: 'var(--ink-black)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Fredoka, sans-serif',
    position: 'relative',
  },
  navLinkActive: {
    color: 'var(--marker-pink)',
    background: 'linear-gradient(120deg, rgba(255,255,0,0.3) 0%, rgba(255,255,0,0.6) 100%)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  walletButton: {
    display: 'flex',
    alignItems: 'center',
  },
};
