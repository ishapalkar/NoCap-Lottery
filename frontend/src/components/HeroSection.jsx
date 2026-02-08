import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        
        {/* Decorative floating emojis */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{position: 'absolute', top: '10%', left: '8%', fontSize: '3rem', opacity: 0.3, zIndex: 1}}
        >
          ⭐
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -8, 0],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{position: 'absolute', top: '15%', right: '10%', fontSize: '3rem', opacity: 0.3, zIndex: 1}}
        >
          ⭐
        </motion.div>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{position: 'absolute', bottom: '20%', left: '12%', fontSize: '2.5rem', opacity: 0.3, zIndex: 1}}
        >
          😊
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -12, 0],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          style={{position: 'absolute', bottom: '25%', right: '15%', fontSize: '3rem', opacity: 0.3, zIndex: 1}}
        >
          ⭐
        </motion.div>
        
        <div style={styles.contentWrapper}>
          
          {/* WIN REAL PRIZES Badge */}
          <div style={styles.badge}>
            ⭐ WIN REAL PRIZES! ⭐
          </div>

          {/* Main Title */}
          <div style={styles.heroTitle}>
            <h1 style={styles.mainTitle}>
              DEPOSIT MONEY.
            </h1>
            <h1 style={{...styles.mainTitle, color: '#00a8e8', fontStyle: 'italic'}}>
              WIN THE POT!
            </h1>
          </div>

          {/* Subtitle */}
          <p style={styles.subtitle}>
            We take the interest and give it to one lucky winner.<br/>
            Everyone else keeps their cash. It's magic! ✨
          </p>

          {/* CTA Buttons */}
          <div style={styles.buttons}>
            <button
              onClick={() => navigate('/pools')} 
              style={styles.primaryButton}
              className="btn-bounce"
            >
              START PLAYING!
            </button>
            
            <button
              onClick={() => navigate('/how-it-works')} 
              style={styles.secondaryButton}
              className="btn-bounce"
            >
              HOW IT WORKS?
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    position: 'relative',
    padding: '8rem 1.5rem 6rem',
    minHeight: '90vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: '#ffffff',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    position: 'relative',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2.5rem',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
  },
  badge: {
    padding: '0.75rem 2rem',
    background: '#ffd23f',
    border: '4px solid var(--ink-black)',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: 900,
    fontFamily: 'Fredoka, sans-serif',
    textTransform: 'uppercase',
    boxShadow: '5px 5px 0 var(--ink-black)',
    letterSpacing: '0.02em',
  },
  heroTitle: {
    marginBottom: '0',
  },
  mainTitle: {
    fontSize: 'clamp(3rem, 10vw, 6rem)',
    fontWeight: 900,
    lineHeight: 0.95,
    color: 'var(--ink-black)',
    fontFamily: 'Fredoka, sans-serif',
    marginBottom: '0.3rem',
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    maxWidth: '650px',
    fontSize: 'clamp(1.15rem, 2.5vw, 1.35rem)',
    lineHeight: '1.65',
    color: 'var(--ink-black)',
    fontFamily: 'Comic Neue, sans-serif',
    fontWeight: 600,
  },
  buttons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.25rem',
    justifyContent: 'center',
    marginTop: '0.5rem',
  },
  primaryButton: {
    padding: '1.1rem 2.5rem',
    fontSize: '1.25rem',
    fontWeight: 900,
    fontFamily: 'Fredoka, sans-serif',
    background: '#ff6b9d',
    color: 'white',
    border: '4px solid var(--ink-black)',
    borderRadius: '15px',
    cursor: 'pointer',
    boxShadow: '6px 6px 0 var(--ink-black)',
    textTransform: 'uppercase',
    letterSpacing: '-0.01em',
  },
  secondaryButton: {
    padding: '1.1rem 2.5rem',
    fontSize: '1.25rem',
    fontWeight: 900,
    fontFamily: 'Fredoka, sans-serif',
    background: 'white',
    color: 'var(--ink-black)',
    border: '4px solid var(--ink-black)',
    borderRadius: '15px',
    cursor: 'pointer',
    boxShadow: '6px 6px 0 var(--ink-black)',
    textTransform: 'uppercase',
    letterSpacing: '-0.01em',
  },
};
