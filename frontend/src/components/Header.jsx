import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CustomConnectButton } from './CustomConnectButton';
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
            onClick={() => navigate('/winners')} 
            style={{ 
              ...styles.navLink,
              ...(isActive('/winners') && styles.navLinkActive)
            }}
          >
            Winners
          </button>
          <button 
            onClick={() => navigate('/profile')} 
            style={{ 
              ...styles.navLink,
              ...(isActive('/profile') && styles.navLinkActive)
            }}
          >
            Profile
          </button>
          <button 
            onClick={() => navigate('/demo')} 
            style={{ 
              ...styles.navLink,
              ...(isActive('/demo') && styles.navLinkActive)
            }}
          >
            Demo
          </button>
        </nav>

        <div style={styles.walletButton}>
          <CustomConnectButton />
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
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(150px, auto) 1fr minmax(200px, auto)',
    height: '5rem',
    alignItems: 'center',
    gap: '1rem',
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
    justifySelf: 'start',
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
    justifyContent: 'center',
    gap: '1.5rem',
    width: '100%',
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
    whiteSpace: 'nowrap',
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
    justifyContent: 'flex-end',
  },
};
