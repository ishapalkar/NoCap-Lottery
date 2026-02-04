import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { WinnersBoard } from './components/WinnersBoard';
import { CursorGlow } from './components/CursorGlow';
import { Pools } from './pages/Pools';
import { USDCPool } from './pages/USDCPool';
import { Play } from './components/Play';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="relative min-h-screen scanlines">
      <CursorGlow />
      <div className="relative z-10">
        <Routes>
          {/* Home Route */}
          <Route path="/" element={
            <>
              <Header />
              <HeroSection />
              <WinnersBoard />
            </>
          } />

          {/* Pools Route */}
          <Route path="/pools" element={
            <>
              <Header />
              <Pools />
            </>
          } />

          {/* USDC Pool Route */}
          <Route path="/pools/usdc" element={
            <>
              <Header />
              <USDCPool />
            </>
          } />

          {/* Cross-Chain Play Route */}
          <Route path="/play" element={
            <>
              <Header />
              <Play />
            </>
          } />
        </Routes>
      </div>

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            background: 'var(--primary)',
            border: 'none',
            color: '#000',
            fontSize: '1.25rem',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 255, 157, 0.3)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          ↑
        </button>
      )}
    </main>
  );
}

export default App;
