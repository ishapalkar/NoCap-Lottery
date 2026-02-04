import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { FloatingCoins } from './FloatingCoins';

gsap.registerPlugin(ScrollTrigger);

const roles = ['no cap', 'no loss', 'no risk', 'no scam', 'no stress', 'no worries'];

export function HeroSection() {
  const navigate = useNavigate();
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

  useEffect(() => {
    // Scroll float animations
    gsap.set('.float-element', { y: 50, opacity: 0 });

    gsap.to('.float-element', {
      y: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
      stagger: 0.2,
      scrollTrigger: {
        trigger: '.hero-grid-responsive',
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    // Floating animation for badges
    gsap.to('.badge-float', {
      y: '+=10',
      duration: 2,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
      delay: 1
    });

    // Glow pulse animation
    gsap.to('.glow-pulse', {
      scale: 1.1,
      opacity: 0.8,
      duration: 3,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        
        {/* Floating Coins Background */}
        <FloatingCoins />
        
        {/* Animated floating elements */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{position: 'absolute', top: '15%', left: '5%', fontSize: '4rem', opacity: 0.4, zIndex: 1}}
        >
          🪙
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 12, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{position: 'absolute', top: '20%', right: '8%', fontSize: '3.5rem', opacity: 0.4, zIndex: 1}}
        >
          💎
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -12, 0],
            x: [0, 8, 0],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{position: 'absolute', bottom: '20%', left: '10%', fontSize: '3rem', opacity: 0.4, zIndex: 1}}
        >
          ⭐
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          style={{position: 'absolute', bottom: '25%', right: '12%', fontSize: '3.5rem', opacity: 0.4, zIndex: 1}}
        >
          🎯
        </motion.div>
        
        <div style={styles.contentWrapper}>
          {/* Main Title - Center of Screen */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={styles.heroTitle}
          >
            <h1 style={styles.mainTitle}>
              DEPOSIT MONEY.
            </h1>
            <motion.h1
              style={{...styles.mainTitle, color: 'var(--marker-pink)'}}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              WIN THE POT! 🏆
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            style={styles.subtitle}
          >
            We take the interest and give it to one lucky winner.<br/>
            Everyone else keeps their cash. It's magic! ✨
          </motion.p>

          {/* Feature Cards Grid */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            style={styles.cardsGrid}
          >
            {/* Super Safe Card */}
            <motion.div
              whileHover={{ scale: 1.01, y: -2, transition: { duration: 0.15 } }}
              style={{...styles.featureCard, background: 'rgba(255, 255, 255, 1)', borderColor: 'var(--marker-cyan)'}}
            >
              <div style={styles.featureIcon}>🛡️</div>
              <h3 style={{...styles.featureTitle, color: 'var(--marker-cyan)'}}>SUPER SAFE!</h3>
              <p style={styles.featureText}>
                We use big-brain DeFi stuff to make sure your money never leaves the vault.
              </p>
            </motion.div>
            
            {/* Fast Card */}
            <motion.div
              whileHover={{ scale: 1.01, y: -2, transition: { duration: 0.15 } }}
              style={{...styles.featureCard, background: 'rgba(255, 255, 255, 1)', borderColor: 'var(--marker-pink)'}}
            >
              <div style={styles.featureIcon}>⚡</div>
              <h3 style={{...styles.featureTitle, color: 'var(--marker-pink)'}}>FAST AS HECK!</h3>
              <p style={styles.featureText}>
                Instant deposits and withdrawals. No paperwork, no boring bank stuff.
              </p>
            </motion.div>
            
            {/* Big Prizes Card */}
            <motion.div
              whileHover={{ scale: 1.01, y: -2, transition: { duration: 0.15 } }}
              style={{...styles.featureCard, background: 'rgba(255, 255, 255, 1)', borderColor: 'var(--marker-yellow)'}}
            >
              <div style={styles.featureIcon}>🏆</div>
              <h3 style={{...styles.featureTitle, color: 'var(--marker-yellow)'}}>BIG PRIZES!</h3>
              <p style={styles.featureText}>
                Weekly draws for giant pots of gold. Someone's gotta win, why not you?
              </p>
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            style={styles.buttons}
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/pools')} 
              style={styles.primaryButton}
            >
              START PLAYING! 🚀
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})} 
              style={styles.secondaryButton}
            >
              HOW IT WORKS? 🤔
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    position: 'relative',
    padding: '8rem 1.5rem 4rem',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    position: 'relative',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3rem',
    textAlign: 'center',
  },
  heroTitle: {
    marginBottom: '1rem',
  },
  mainTitle: {
    fontSize: 'clamp(3rem, 10vw, 5.5rem)',
    fontWeight: 900,
    lineHeight: 1.1,
    color: 'var(--ink-black)',
    fontFamily: 'Fredoka, sans-serif',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    maxWidth: '700px',
    fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
    lineHeight: '1.6',
    color: 'var(--ink-black)',
    fontFamily: 'Comic Neue, sans-serif',
    fontWeight: 600,
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    width: '100%',
    maxWidth: '1000px',
  },
  featureCard: {
    padding: '2.5rem 2rem',
    background: 'white',
    border: '5px solid',
    borderRadius: '20px',
    boxShadow: '8px 8px 0 var(--ink-black)',
    transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    overflow: 'visible',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  },
  featureIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    display: 'block',
    filter: 'drop-shadow(3px 3px 0 rgba(0,0,0,0.1))',
  },
  featureTitle: {
    fontSize: '1.75rem',
    fontWeight: 900,
    fontFamily: 'Fredoka, sans-serif',
    marginBottom: '1rem',
    fontStyle: 'italic',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
  },
  featureText: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: 'var(--ink-black)',
    fontFamily: 'Comic Neue, sans-serif',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'normal',
    fontWeight: 600,
    opacity: 0.85,
  },
  buttons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5rem',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  primaryButton: {
    padding: '1.25rem 3rem',
    fontSize: '1.5rem',
    fontWeight: 900,
    fontFamily: 'Fredoka, sans-serif',
    background: 'var(--marker-pink)',
    color: 'white',
    border: '5px solid var(--ink-black)',
    borderRadius: '20px',
    cursor: 'pointer',
    boxShadow: '7px 7px 0 var(--ink-black)',
    transition: 'all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    textTransform: 'uppercase',
  },
  secondaryButton: {
    padding: '1.25rem 2.5rem',
    fontSize: '1.3rem',
    fontWeight: 900,
    fontFamily: 'Fredoka, sans-serif',
    background: 'var(--marker-cyan)',
    color: 'white',
    border: '5px solid var(--ink-black)',
    borderRadius: '20px',
    cursor: 'pointer',
    boxShadow: '7px 7px 0 var(--ink-black)',
    transition: 'all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    textTransform: 'uppercase',
  },
};
