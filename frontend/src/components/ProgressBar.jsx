import { motion } from 'framer-motion';

export function ProgressBar({ percentage = 75, label = "Pool Filled" }) {
  return (
    <div style={{ width: '100%', margin: '1.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ 
          fontFamily: 'Fredoka, sans-serif', 
          fontWeight: 900, 
          color: 'var(--ink-black)',
          fontSize: '1rem',
        }}>
          {label}
        </span>
        <span style={{ 
          fontFamily: 'Fredoka, sans-serif', 
          fontWeight: 900, 
          color: 'var(--marker-pink)',
          fontSize: '1rem',
        }}>
          {percentage}%
        </span>
      </div>
      <div className="progress-bar-container">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="progress-bar-fill"
        />
        <div className="progress-bar-text">{percentage}%</div>
      </div>
    </div>
  );
}
