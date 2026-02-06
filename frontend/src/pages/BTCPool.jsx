import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Trophy } from 'lucide-react';
import { DepositOptionsModal } from '../components/DepositOptionsModal';

export function BTCPool() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('RULES');
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <motion.button onClick={() => navigate('/pools')} style={styles.backButton} className="btn-bounce" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          <ArrowLeft size={16} />
          <span>BACK TO POOLS</span>
        </motion.button>

        <motion.div style={styles.titleSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <div style={styles.iconCircle}>₿</div>
          <h1 style={styles.title}>8-Bit BTC Arena</h1>
          <div style={styles.badges}>
            <span style={styles.badgeCyan}>NO LOSS</span>
            <span style={styles.badgeGrey}>WEEKLY DRAW</span>
          </div>
        </motion.div>

        <div style={styles.mainGrid}>
          <motion.div style={styles.prizeCard} className="card-squishy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <div style={styles.prizeHeader}>
              <h2 style={styles.prizeLabel}>CURRENT PRIZE</h2>
              <div style={styles.prizeAmount}>$100,000</div>
            </div>
            <div style={styles.prizeDetails}>
              <div style={styles.detailRow}>
                <div style={styles.detailItem}>
                  <Clock size={20} style={{ color: '#1a1a1a' }} />
                  <div>
                    <div style={styles.detailLabel}>TIME LEFT</div>
                    <div style={styles.detailValue}>4d 22h 45m</div>
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <Trophy size={20} style={{ color: '#1a1a1a' }} />
                  <div>
                    <div style={styles.detailLabel}>ODDS</div>
                    <div style={styles.detailValue}>1 in 2500</div>
                  </div>
                </div>
              </div>
              <div style={styles.trophyIcon}>🏆</div>
            </div>
            <div style={styles.progressSection}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Pool Progress</span>
                <span style={styles.progressAmount}>$3,800,000 deposited</span>
              </div>
              <div style={styles.progressBarContainer}>
                <motion.div style={styles.progressBarFill} initial={{ width: 0 }} animate={{ width: '76%' }} transition={{ duration: 1, delay: 0.5 }} />
              </div>
            </div>
          </motion.div>

          <motion.div style={styles.depositCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
            <h2 style={styles.depositTitle}>WBTC DEPOSITS</h2>
            <p style={styles.depositSubtitle}>Ready to deposit</p>
            <div style={styles.depositForm}>
              <button 
                onClick={() => setShowOptionsModal(true)}
                style={styles.depositButton}
                className="btn-bounce"
              >
                CHOOSE DEPOSIT METHOD
              </button>
            </div>
            <div style={styles.comingSoonBox}>
              <span style={styles.comingSoonEmoji}>🚀</span>
              <p style={styles.comingSoonText}>Bitcoin pool smart contracts deploying soon. UI is ready!</p>
            </div>
          </motion.div>
        </div>

        {/* Deposit Options Modal */}
        <DepositOptionsModal
          isOpen={showOptionsModal}
          onClose={() => setShowOptionsModal(false)}
          poolName="8-Bit BTC Arena"
          targetChainId={11155111}
          supportedAssets={['WBTC']}
          onDirectDeposit={() => {
            alert('🚀 BTC Pool Coming Soon!\n\nDirect WBTC deposit will be available once smart contracts are deployed.');
            setShowOptionsModal(false);
          }}
          onYellowDeposit={() => {
            alert('⚡ Yellow Network for WBTC Coming Soon!\n\nInstant, gas-free WBTC deposits will be available soon.');
            setShowOptionsModal(false);
          }}
          onBridgeDeposit={() => {
            alert('🌉 LI.FI Bridge for WBTC Coming Soon!\n\nCross-chain WBTC deposits will be available soon.');
            setShowOptionsModal(false);
          }}
        />

        <motion.div style={styles.tabSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
          <div style={styles.tabs}>
            {['RULES', 'WINNERS', 'ACTIVITY'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...styles.tab, borderBottom: activeTab === tab ? '5px solid #1a1a1a' : 'none', fontWeight: activeTab === tab ? '900' : '600' }}>
                {tab}
              </button>
            ))}
          </div>
          {activeTab === 'RULES' && (
            <motion.div style={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <ol style={styles.rulesList}>
                <li style={styles.ruleItem}><strong>Deposit WBTC into the pool to get tickets.</strong></li>
                <li style={styles.ruleItem}><strong>1 WBTC = 10000 Tickets. More tickets = higher chance to win.</strong></li>
              </ol>
            </motion.div>
          )}
          {activeTab === 'WINNERS' && (
            <motion.div style={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <p style={styles.comingSoon}>🏆 Winners history coming soon...</p>
            </motion.div>
          )}
          {activeTab === 'ACTIVITY' && (
            <motion.div style={styles.tabContent} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <p style={styles.comingSoon}>📊 Activity feed coming soon...</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#ffffff', position: 'relative', overflow: 'hidden' },
  content: { maxWidth: '1400px', margin: '0 auto', padding: '100px 40px 40px', position: 'relative', zIndex: 1 },
  backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', cursor: 'pointer', padding: '0', marginBottom: '30px', transition: 'all 0.2s' },
  titleSection: { textAlign: 'center', marginBottom: '40px' },
  iconCircle: { width: '80px', height: '80px', borderRadius: '50%', background: '#ffd23f', border: '5px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: '900', color: '#1a1a1a', margin: '0 auto 20px', boxShadow: '8px 8px 0 #1a1a1a' },
  title: { fontFamily: '"Fredoka", sans-serif', fontSize: '48px', fontWeight: '900', color: '#1a1a1a', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: '-1px' },
  badges: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' },
  badgeCyan: { fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '700', color: '#1a1a1a', background: '#00d4ff', padding: '8px 20px', borderRadius: '20px', border: '3px solid #1a1a1a', textTransform: 'uppercase' },
  badgeGrey: { fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '700', color: '#1a1a1a', background: '#e0e0e0', padding: '8px 20px', borderRadius: '20px', border: '3px solid #1a1a1a', textTransform: 'uppercase' },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px', marginBottom: '40px' },
  prizeCard: { background: '#ffffff', border: '5px solid #1a1a1a', borderRadius: '20px', padding: '40px', boxShadow: '12px 12px 0 #1a1a1a', transition: 'all 0.2s' },
  prizeHeader: { marginBottom: '30px' },
  prizeLabel: { fontFamily: '"Comic Neue", cursive', fontSize: '16px', fontWeight: '700', color: '#666', margin: '0 0 10px', textTransform: 'uppercase' },
  prizeAmount: { fontFamily: '"Fredoka", sans-serif', fontSize: '72px', fontWeight: '900', color: '#ffd23f', margin: '0', lineHeight: '1' },
  prizeDetails: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  detailRow: { display: 'flex', flexDirection: 'column', gap: '20px' },
  detailItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  detailLabel: { fontFamily: '"Comic Neue", cursive', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' },
  detailValue: { fontFamily: '"Fredoka", sans-serif', fontSize: '24px', fontWeight: '900', color: '#1a1a1a' },
  trophyIcon: { fontSize: '120px', opacity: '0.3', filter: 'grayscale(100%)' },
  progressSection: { marginTop: '30px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  progressLabel: { fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '600', color: '#1a1a1a' },
  progressAmount: { fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '600', color: '#666' },
  progressBarContainer: { width: '100%', height: '32px', background: '#f0f0f0', border: '4px solid #1a1a1a', borderRadius: '16px', overflow: 'hidden' },
  progressBarFill: { height: '100%', background: '#ffd23f' },
  depositCard: { background: '#ffffff', border: '5px solid #1a1a1a', borderRadius: '20px', padding: '30px', boxShadow: '12px 12px 0 #1a1a1a' },
  depositTitle: { fontFamily: '"Fredoka", sans-serif', fontSize: '24px', fontWeight: '900', color: '#1a1a1a', margin: '0 0 8px', textTransform: 'uppercase' },
  depositSubtitle: { fontFamily: '"Comic Neue", cursive', fontSize: '14px', fontWeight: '600', color: '#666', margin: '0 0 30px' },
  depositForm: { marginBottom: '20px' },
  depositButton: {
    width: '100%',
    fontFamily: '"Fredoka", sans-serif',
    fontSize: '18px',
    fontWeight: '900',
    color: '#1a1a1a',
    background: '#ffd23f',
    border: '4px solid #1a1a1a',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '6px 6px 0 #1a1a1a',
    transition: 'all 0.15s',
  },
  comingSoonBox: { textAlign: 'center', padding: '60px 20px', background: '#f5f5f5', border: '3px solid #1a1a1a', borderRadius: '12px' },
  comingSoonEmoji: { fontSize: '64px', display: 'block', marginBottom: '20px' },
  comingSoonText: { fontFamily: '"Comic Neue", cursive', fontSize: '16px', fontWeight: '600', color: '#666' },
  tabSection: { background: '#ffffff', border: '5px solid #1a1a1a', borderRadius: '20px', overflow: 'hidden', boxShadow: '12px 12px 0 #1a1a1a' },
  tabs: { display: 'flex', borderBottom: '5px solid #1a1a1a' },
  tab: { flex: 1, fontFamily: '"Fredoka", sans-serif', fontSize: '18px', color: '#1a1a1a', background: 'transparent', border: 'none', padding: '20px', cursor: 'pointer', textTransform: 'uppercase', transition: 'all 0.2s', borderBottom: '5px solid transparent' },
  tabContent: { padding: '40px' },
  rulesList: { fontFamily: '"Comic Neue", cursive', fontSize: '16px', fontWeight: '600', color: '#1a1a1a', lineHeight: '1.8', paddingLeft: '20px' },
  ruleItem: { marginBottom: '16px' },
  comingSoon: { fontFamily: '"Comic Neue", cursive', fontSize: '18px', fontWeight: '600', color: '#666', textAlign: 'center', margin: '40px 0' },
};

export default BTCPool;
