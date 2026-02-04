import { motion } from 'framer-motion';

export function DrawStatus() {
  return (
    <motion.section
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      style={styles.section}
    >
      <div style={styles.container}>
        <h2 style={styles.title}>NEXT DRAW STATUS</h2>
        
        <div style={styles.barsGrid}>
          {/* Prize Pot Filling */}
          <div style={styles.barWrapper}>
            <div style={styles.barHeader}>
              <span style={styles.barLabel}>PRIZE POT FILLING..</span>
              <span style={styles.barPercentage}>85%</span>
            </div>
            <div style={styles.progressBarContainer}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                style={styles.progressBarFill}
              />
            </div>
          </div>

          {/* Ticke-O-Meter */}
          <div style={styles.barWrapper}>
            <div style={styles.barHeader}>
              <span style={styles.barLabel}>TICKE-O-METER</span>
              <span style={styles.barPercentage}>42%</span>
            </div>
            <div style={styles.progressBarContainer}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '42%' }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                style={styles.progressBarFill}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

const styles = {
  section: {
    padding: '3rem 1.5rem 2rem',
    background: '#ffffff',
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  title: {
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    fontWeight: 900,
    fontFamily: 'Fredoka, sans-serif',
    color: 'var(--ink-black)',
    textAlign: 'center',
    marginBottom: '2rem',
    letterSpacing: '0.05em',
  },
  barsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  barWrapper: {
    width: '100%',
  },
  barHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  barLabel: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--ink-black)',
    fontStyle: 'italic',
  },
  barPercentage: {
    fontFamily: 'Fredoka, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 900,
    color: 'var(--ink-black)',
  },
  progressBarContainer: {
    width: '100%',
    height: '40px',
    background: '#ffffff',
    border: '4px solid var(--ink-black)',
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '4px 4px 0 var(--ink-black)',
  },
  progressBarFill: {
    height: '100%',
    background: 'var(--marker-cyan)',
    position: 'relative',
    overflow: 'hidden',
  },
};
