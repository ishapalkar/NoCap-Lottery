import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X } from 'lucide-react';
import { useEns } from '../hooks/useEns';

export function WinnerAnnouncementModal({ isOpen, onClose, winner, prizeAmount, bonusAmount, round }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [leverPulled, setLeverPulled] = useState(false);
  const [revealWinner, setRevealWinner] = useState(false);
  const { displayName, ensAvatar, hasEnsName } = useEns(winner);

  useEffect(() => {
    if (isOpen) {
      setLeverPulled(false);
      setRevealWinner(false);
      setShowConfetti(false);
    }
  }, [isOpen]);

  const handleLeverPull = () => {
    if (leverPulled) return;
    
    setLeverPulled(true);
    
    // Reveal winner after lever animation
    setTimeout(() => {
      setRevealWinner(true);
      setShowConfetti(true);
      
      // Auto-hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={styles.overlay} onClick={onClose}>
        <motion.div
          style={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
          transition={{ type: 'spring', duration: 0.8 }}
        >
          {/* Confetti Effect */}
          {showConfetti && <Confetti />}

          {/* Close Button */}
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={24} />
          </button>

          {/* Golden Ticket Design */}
          <div style={styles.goldenTicket}>
            {/* Decorative Border */}
            <div style={styles.ticketBorderTop} />
            <div style={styles.ticketBorderBottom} />

            {/* Header */}
            <motion.div
              style={styles.header}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Trophy size={48} style={{ color: '#ffd700' }} />
              </motion.div>
              <h1 style={styles.title}>🎉 WINNER ANNOUNCEMENT 🎉</h1>
              <p style={styles.subtitle}>Round #{round}</p>
            </motion.div>

            {/* Slot Machine Lever */}
            {!revealWinner && (
              <motion.div
                style={styles.leverSection}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p style={styles.leverPrompt}>Pull the lever to reveal the winner!</p>
                <motion.div
                  style={styles.leverContainer}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeverPull}
                >
                  {/* Lever Handle */}
                  <motion.div
                    style={styles.leverHandle}
                    animate={leverPulled ? {
                      rotate: [0, -45, -45, -45, 0],
                      y: [0, 80, 80, 80, 0]
                    } : {}}
                    transition={{ duration: 1.5 }}
                  >
                    <div style={styles.leverBall} />
                    <div style={styles.leverStick} />
                  </motion.div>
                  <div style={styles.leverBase}>
                    <Sparkles size={20} style={{ color: '#ffd700' }} />
                  </div>
                </motion.div>
                
                {leverPulled && !revealWinner && (
                  <motion.p
                    style={styles.spinningText}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 1, 0] }}
                    transition={{ duration: 1.5 }}
                  >
                    ✨ Spinning... ✨
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Winner Reveal */}
            <AnimatePresence>
              {revealWinner && (
                <motion.div
                  style={styles.winnerSection}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 200,
                    damping: 15
                  }}
                >
                  {/* Golden Spotlight Effect */}
                  <motion.div
                    style={styles.spotlight}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <motion.div
                    style={styles.winnerLabel}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⭐ THE WINNER IS ⭐
                  </motion.div>

                  {/* Winner Card */}
                  <motion.div
                    style={styles.winnerCard}
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    {ensAvatar && (
                      <motion.img
                        src={ensAvatar}
                        alt="Winner Avatar"
                        style={styles.winnerAvatar}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                      />
                    )}

                    <motion.div
                      style={styles.winnerName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      {displayName}
                      {hasEnsName && (
                        <motion.span
                          style={styles.ensBadge}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8, type: 'spring' }}
                        >
                          ENS
                        </motion.span>
                      )}
                    </motion.div>

                    {!hasEnsName && (
                      <div style={styles.addressText}>{winner}</div>
                    )}
                  </motion.div>

                  {/* Prize Amount */}
                  <motion.div
                    style={styles.prizeContainer}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div style={styles.prizeLabel}>PRIZE AMOUNT</div>
                    <motion.div
                      style={styles.prizeAmount}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        textShadow: [
                          '0 0 10px rgba(255, 215, 0, 0.5)',
                          '0 0 20px rgba(255, 215, 0, 0.8)',
                          '0 0 10px rgba(255, 215, 0, 0.5)'
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ${prizeAmount.toLocaleString()}
                    </motion.div>
                    
                    {bonusAmount > 0 && (
                      <motion.div
                        style={styles.bonusAmount}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 }}
                      >
                        + ${bonusAmount.toLocaleString()} BONUS 🎁
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Celebration Message */}
                  <motion.div
                    style={styles.celebrationText}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                  >
                    🎊 Congratulations! Prize sent to wallet! 🎊
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Confetti Component
function Confetti() {
  const confettiCount = 50;
  const confettiColors = ['#ffd700', '#ff4d6d', '#00d4ff', '#06d6a0', '#ffd23f'];

  return (
    <div style={styles.confettiContainer}>
      {Array.from({ length: confettiCount }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            ...styles.confettiPiece,
            background: confettiColors[i % confettiColors.length],
            left: `${Math.random() * 100}%`,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight + 100,
            opacity: [1, 1, 0],
            rotate: Math.random() * 720 - 360,
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    padding: '20px',
  },
  modal: {
    position: 'relative',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    border: '8px solid #ffd700',
    borderRadius: '32px',
    boxShadow: '0 0 100px rgba(255, 215, 0, 0.5), 20px 20px 0 rgba(255, 215, 0, 0.2)',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '40px',
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: '3px solid #ffd700',
    borderRadius: '50%',
    cursor: 'pointer',
    padding: '8px',
    color: '#ffd700',
    transition: 'all 0.2s',
    zIndex: 10,
  },
  goldenTicket: {
    position: 'relative',
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%)',
    border: '6px solid #b8860b',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: 'inset 0 0 50px rgba(255, 255, 255, 0.3)',
  },
  ticketBorderTop: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    right: '15px',
    height: '3px',
    background: 'repeating-linear-gradient(90deg, #b8860b 0px, #b8860b 10px, transparent 10px, transparent 20px)',
  },
  ticketBorderBottom: {
    position: 'absolute',
    bottom: '15px',
    left: '15px',
    right: '15px',
    height: '3px',
    background: 'repeating-linear-gradient(90deg, #b8860b 0px, #b8860b 10px, transparent 10px, transparent 20px)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '36px',
    fontWeight: '900',
    color: '#1a1a1a',
    margin: '16px 0 8px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '2px 2px 0 rgba(0, 0, 0, 0.1)',
  },
  subtitle: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '18px',
    fontWeight: '700',
    color: '#4d4d4d',
    margin: 0,
  },
  leverSection: {
    textAlign: 'center',
    padding: '40px 0',
  },
  leverPrompt: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '24px',
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: '30px',
    textShadow: '1px 1px 0 rgba(255, 255, 255, 0.5)',
  },
  leverContainer: {
    display: 'inline-block',
    cursor: 'pointer',
    position: 'relative',
  },
  leverHandle: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  leverBall: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff4d6d 0%, #ff1744 100%)',
    border: '4px solid #1a1a1a',
    boxShadow: '0 8px 0 #1a1a1a, inset 0 -4px 8px rgba(0, 0, 0, 0.3)',
  },
  leverStick: {
    width: '12px',
    height: '120px',
    background: 'linear-gradient(90deg, #1a1a1a 0%, #4d4d4d 50%, #1a1a1a 100%)',
    border: '3px solid #1a1a1a',
    borderRadius: '6px',
  },
  leverBase: {
    width: '100px',
    height: '40px',
    background: '#1a1a1a',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '-3px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  },
  spinningText: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '20px',
    fontWeight: '900',
    color: '#1a1a1a',
    marginTop: '20px',
  },
  winnerSection: {
    position: 'relative',
    textAlign: 'center',
    padding: '20px 0',
  },
  spotlight: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  winnerLabel: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '28px',
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: '24px',
    textShadow: '2px 2px 0 rgba(255, 255, 255, 0.5)',
  },
  winnerCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '32px',
    boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
    position: 'relative',
    zIndex: 1,
  },
  winnerAvatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '6px solid #ffd700',
    objectFit: 'cover',
    marginBottom: '16px',
    boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
  },
  winnerName: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '32px',
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: '8px',
    wordBreak: 'break-all',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  ensBadge: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '16px',
    fontWeight: '900',
    color: '#fff',
    background: 'linear-gradient(135deg, #5298FF 0%, #3B7EEE 100%)',
    padding: '6px 16px',
    borderRadius: '12px',
    border: '3px solid #1a1a1a',
    textTransform: 'uppercase',
  },
  addressText: {
    fontFamily: '"Courier New", monospace',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    wordBreak: 'break-all',
  },
  prizeContainer: {
    background: 'linear-gradient(135deg, #06d6a0 0%, #00b388 100%)',
    border: '5px solid #1a1a1a',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '8px 8px 0 rgba(0, 0, 0, 0.2)',
    position: 'relative',
    zIndex: 1,
  },
  prizeLabel: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  prizeAmount: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '56px',
    fontWeight: '900',
    color: '#fff',
    lineHeight: '1',
    marginBottom: '12px',
  },
  bonusAmount: {
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '24px',
    fontWeight: '900',
    color: '#ffd700',
    marginTop: '16px',
  },
  celebrationText: {
    fontFamily: '"Comic Neue", cursive',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    textShadow: '1px 1px 0 rgba(255, 255, 255, 0.5)',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 999,
  },
  confettiPiece: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    borderRadius: '2px',
  },
};

export default WinnerAnnouncementModal;
