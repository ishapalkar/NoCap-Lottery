import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <Header />
      
      <div style={styles.content}>
        {/* Header Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={styles.header}
        >
          <h1 style={styles.title}>How It Works</h1>
          <p style={styles.subtitle}>
            Understanding NoCap Lottery's no-loss prize system
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div style={styles.stepsGrid}>
          {[
            { 
              num: '01', 
              title: 'Deposit', 
              text: 'Enter the pool during the deposit window',
              description: 'Enter the pool during the deposit window'
            },
            { 
              num: '02', 
              title: 'Earn Yield', 
              text: 'Your funds generate yield through Aave V3',
              description: 'Your funds generate yield through Aave V3'
            },
            { 
              num: '03', 
              title: 'Weekly Draw', 
              text: 'Chainlink VRF selects a random winner',
              description: 'Chainlink VRF selects a random winner'
            },
            { 
              num: '04', 
              title: 'Win Prizes', 
              text: 'Winner receives all yield, everyone keeps principal',
              description: 'Winner receives all yield, everyone keeps principal'
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
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

        {/* CTA Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={styles.ctaSection}
        >
          <motion.button
            onClick={() => navigate('/pools')}
            className="btn-bounce"
            style={styles.ctaButton}
          >
            START PLAYING NOW
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '9rem 1.5rem 4rem',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: '1rem',
    color: 'var(--foreground)',
    fontFamily: '"Fredoka", sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '-2px',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.6,
    fontFamily: '"Comic Neue", cursive',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    marginBottom: '4rem',
  },
  step: {
    background: 'white',
    border: '5px solid var(--ink-black)',
    borderRadius: '20px',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '8px 8px 0 var(--ink-black)',
    transition: 'all 0.2s',
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'var(--marker-cyan)',
    border: '4px solid var(--ink-black)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
    boxShadow: '4px 4px 0 var(--ink-black)',
  },
  stepNumberText: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '1.5rem',
    fontWeight: 900,
    color: 'var(--ink-black)',
  },
  stepTitle: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '1.75rem',
    fontWeight: 900,
    color: 'var(--ink-black)',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
  },
  stepText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#666',
    lineHeight: 1.6,
  },
  ctaSection: {
    textAlign: 'center',
    marginTop: '4rem',
  },
  ctaButton: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '1.25rem',
    fontWeight: 900,
    color: 'var(--ink-black)',
    background: 'var(--marker-cyan)',
    border: '5px solid var(--ink-black)',
    borderRadius: '16px',
    padding: '1.25rem 3rem',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '8px 8px 0 var(--ink-black)',
    transition: 'all 0.2s',
  },
};

export default HowItWorks;
