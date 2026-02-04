import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { DrawStatus } from './components/DrawStatus';
import { ActivePools } from './components/ActivePools';
import { WinnersBoard } from './components/WinnersBoard';
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
    <main className="relative min-h-screen whiteboard-bg">
      <div className="relative z-10">
        <Routes>
          {/* Home Route */}
          <Route path="/" element={
            <>
              <Header />
              <HeroSection />
              <DrawStatus />
              <ActivePools />
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
          className="btn-bounce"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            background: 'var(--marker-cyan)',
            border: '4px solid var(--ink-black)',
            color: 'var(--ink-black)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '5px 5px 0 var(--ink-black)',
            transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px) rotate(-5deg)';
            e.target.style.boxShadow = '7px 7px 0 var(--ink-black)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) rotate(0deg)';
            e.target.style.boxShadow = '5px 5px 0 var(--ink-black)';
          }}
        >
          ↑
        </button>
      )}
    </main>
  );
}

export default App;
