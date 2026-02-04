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
      <div style={{
        width: '100%',
        height: '2rem',
        border: '4px solid var(--ink-black)',
        background: 'white',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          style={{
            height: '100%',
            background: 'var(--marker-pink)',
            position: 'absolute',
            left: 0,
            top: 0,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.2) 10px,
              rgba(255,255,255,0.2) 20px
            )`,
            backgroundSize: '40px 40px',
            animation: 'progress-stripes 1s linear infinite',
          }}
        />
      </div>
    </div>
  );
}

export function RetroProgressBar({ 
  value = 0, 
  className = '', 
  color = 'var(--marker-pink)', 
  label = '', 
  showPercentage = true,
  height = '2rem',
  showStripes = true 
}) {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div className={className} style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 700,
          fontFamily: 'Fredoka, sans-serif',
        }}>
          {label && <span>{label}</span>}
          {showPercentage && <span style={{ color }}>{percentage}%</span>}
        </div>
      )}
      <div 
        style={{
          width: '100%',
          height: height,
          border: '4px solid var(--ink-black)',
          background: 'white',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '8px',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            height: '100%',
            background: color,
            position: 'absolute',
            left: 0,
            top: 0,
            backgroundImage: showStripes ? `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.2) 10px,
              rgba(255,255,255,0.2) 20px
            )` : 'none',
            backgroundSize: '40px 40px',
            animation: showStripes ? 'progress-stripes 1s linear infinite' : 'none',
          }}
        />
      </div>
    </div>
  );
}
