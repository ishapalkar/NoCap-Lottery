import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, TrendingUp, Trophy, DollarSign, Users, Zap } from 'lucide-react';
import './App.css';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectedChain, setSelectedChain] = useState('Ethereum');
  const [depositAmount, setDepositAmount] = useState('');
  const [totalDeposits, setTotalDeposits] = useState('2,450,000');
  const [activeUsers, setActiveUsers] = useState('12,458');
  const [prizePool, setPrizePool] = useState('125,430');
  const [nextDraw, setNextDraw] = useState('2d 14h 23m');

  const chains = ['Ethereum', 'Arbitrum', 'Optimism', 'Base'];

  const recentWinners = [
    { rank: '🥇', ens: 'vitalik.eth', address: '0x742d...b3f9', prize: '$12,450' },
    { rank: '🥈', ens: 'crypto.eth', address: '0x892a...c1e4', prize: '$8,320' },
    { rank: '🥉', ens: 'defi.eth', address: '0x453f...d8a2', prize: '$5,210' },
    { rank: '4', ens: 'whale.eth', address: '0x123b...e7c5', prize: '$3,100' },
    { rank: '5', ens: 'moon.eth', address: '0x9a8c...f2d1', prize: '$2,450' },
  ];

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet. Please make sure MetaMask is installed.');
      }
    } else {
      alert('Please install MetaMask to use this app!');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setDepositAmount('');
  };

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    alert(`Depositing ${depositAmount} on ${selectedChain}... (Demo)`);
    // In production, this would interact with smart contracts
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo-section">
          <div className="logo">No Cap Lottery</div>
          <div className="tagline">No loss. No scam. Just vibes.</div>
        </div>
        
        {!walletAddress ? (
          <button className="wallet-button" onClick={connectWallet}>
            <Wallet size={20} />
            Login with Wallet
          </button>
        ) : (
          <div className="wallet-info" onClick={disconnectWallet}>
            <Wallet size={18} />
            <span className="wallet-address">{formatAddress(walletAddress)}</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="main-content">
        {!walletAddress ? (
          // Landing Page
          <div className="landing-container">
            <h1 className="hero-title">No Cap Lottery</h1>
            <p className="hero-tagline">No loss. No scam. Just vibes.</p>
            <p className="hero-description">
              We are building a no-loss lottery primitive for DeFi, designed as a cross-chain prize vault. 
              Users can deposit funds seamlessly from multiple chains using LI.FI. Deposited principal is then 
              allocated into Aave or Compound. Instead of gambling user deposits, only the accrued yield is 
              distributed to prize winners on a recurring basis, ensuring depositors never lose their original funds. 
              AI-driven automation helps optimize liquidity deployment and harvesting, while ENS improves UX 
              through identity-based leaderboards and winner recognition.
            </p>
            <button className="cta-button" onClick={connectWallet}>
              <Wallet size={24} />
              Login with Wallet
            </button>
          </div>
        ) : (
          // Dashboard
          <div className="dashboard-grid">
            {/* Stats Section */}
            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-label">Total Deposits</div>
                <div className="stat-value">${totalDeposits}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Active Users</div>
                <div className="stat-value">{activeUsers}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Prize Pool</div>
                <div className="stat-value">${prizePool}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Next Draw</div>
                <div className="stat-value">{nextDraw}</div>
              </div>
            </div>

            {/* Deposit Card */}
            <div className="card">
              <h2 className="card-title">
                <DollarSign size={24} />
                Deposit Funds
              </h2>
              
              <div className="deposit-form">
                <div className="form-group">
                  <label className="form-label">Select Chain</label>
                  <div className="chain-selector">
                    {chains.map((chain) => (
                      <div
                        key={chain}
                        className={`chain-option ${selectedChain === chain ? 'active' : ''}`}
                        onClick={() => setSelectedChain(chain)}
                      >
                        {chain}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (USDC)</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      className="amount-input"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                    <button className="max-button" onClick={() => setDepositAmount('1000')}>
                      MAX
                    </button>
                  </div>
                </div>

                <div className="info-banner">
                  <strong>How it works:</strong> Your deposit is allocated to Aave/Compound to earn yield. 
                  Only the yield goes into the prize pool. Your principal is always safe and withdrawable anytime.
                </div>

                <button className="deposit-button" onClick={handleDeposit}>
                  <Zap size={20} />
                  Deposit Now
                </button>
              </div>
            </div>

            {/* Winners & Leaderboard Card */}
            <div className="card">
              <h2 className="card-title">
                <Trophy size={24} />
                Recent Winners
              </h2>
              
              <div className="winners-list">
                {recentWinners.map((winner, index) => (
                  <div key={index} className="winner-item">
                    <div className="winner-info">
                      <div className="winner-rank">{winner.rank}</div>
                      <div className="winner-details">
                        <div className="winner-ens">{winner.ens}</div>
                        <div className="winner-address">{winner.address}</div>
                      </div>
                    </div>
                    <div className="winner-prize">{winner.prize}</div>
                  </div>
                ))}
              </div>

              <div className="info-banner" style={{ marginTop: '1.5rem' }}>
                <strong>ENS Integration:</strong> Winners are recognized by their ENS names for better identity 
                and community engagement. Connect your ENS to appear on the leaderboard!
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
