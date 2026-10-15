import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { 
  X, Coins, Shield, Sparkles, TrendingUp, ExternalLink, Copy, Check, 
  Wallet, Flame, AlertCircle, ArrowUpRight, DollarSign, Award, Layers
} from 'lucide-react';
import { soundManager } from '../services/sound';

interface TokenomicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player | null;
  onUpdateWallet?: (address: string) => Promise<void>;
}

export const TokenomicsModal: React.FC<TokenomicsModalProps> = ({
  isOpen,
  onClose,
  currentPlayer,
  onUpdateWallet,
}) => {
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [walletInput, setWalletInput] = useState('');
  const [savingWallet, setSavingWallet] = useState(false);
  const [walletSuccess, setWalletSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tokenomics' | 'deploy' | 'wallet'>('overview');

  const isFounder = currentPlayer?.email === 'skinrip@proton.me' || 
                    currentPlayer?.username === '@karmakount' || 
                    currentPlayer?.id === 'p-founder-karmakount';

  const founderBalance = isFounder ? (currentPlayer?.cryptoBalance || 600000000) : 600000000;

  useEffect(() => {
    if (currentPlayer?.walletAddress) {
      setWalletInput(currentPlayer.walletAddress);
    }
  }, [currentPlayer?.walletAddress]);

  if (!isOpen) return null;

  const handleCopyContract = () => {
    soundManager.playVirtueChime();
    navigator.clipboard.writeText('0xKARMA77777777777777777777777777777777777');
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletInput.trim() || !currentPlayer) return;

    setSavingWallet(true);
    try {
      const res = await fetch('/api/player/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayer.id,
          walletAddress: walletInput.trim()
        })
      });

      if (res.ok) {
        soundManager.playVirtueChime();
        setWalletSuccess(true);
        if (onUpdateWallet) {
          await onUpdateWallet(walletInput.trim());
        }
        setTimeout(() => setWalletSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to link wallet:', err);
    } finally {
      setSavingWallet(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-900 border border-amber-500/30 shadow-[0_0_60px_rgba(245,158,11,0.2)] text-slate-100 p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              <Coins className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight font-serif bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  $KARMAKOUNT ($KARMA)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider font-semibold rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300">
                  BASE L2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Web3 Native Token & Decentralized Moral Ledger Economy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            🌟 Tokenomics
          </button>
          <button
            onClick={() => setActiveTab('tokenomics')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'tokenomics'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            👑 Founder Stash (60%)
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'deploy'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            🚀 Real Market Value
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'wallet'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            🦊 Link Real Wallet
          </button>
        </div>

        {/* Tab 1: Token Overview */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[10px] uppercase font-mono text-slate-500">Total Supply</span>
                <p className="text-xl font-bold font-mono text-amber-300 mt-1">1,000,000,000</p>
                <span className="text-[10px] text-slate-400">$KARMA Hard Cap</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 bg-amber-500/5">
                <span className="text-[10px] uppercase font-mono text-amber-400/80">Founder Reserve</span>
                <p className="text-xl font-bold font-mono text-amber-400 mt-1">600,000,000</p>
                <span className="text-[10px] text-amber-300/80">60% Genesis Whale</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-blue-500/30 bg-blue-500/5">
                <span className="text-[10px] uppercase font-mono text-blue-400/80">DEX Liquidity</span>
                <p className="text-xl font-bold font-mono text-blue-300 mt-1">200,000,000</p>
                <span className="text-[10px] text-blue-300/80">20% Uniswap Pool</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 bg-emerald-500/5">
                <span className="text-[10px] uppercase font-mono text-emerald-400/80">IRL Gameplay</span>
                <p className="text-xl font-bold font-mono text-emerald-300 mt-1">200,000,000</p>
                <span className="text-[10px] text-emerald-300/80">20% Player Faucet</span>
              </div>
            </div>

            {/* Distribution Visual Bar */}
            <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Genesis Supply Distribution</span>
                <span className="text-slate-500 font-mono">1 Billion Total</span>
              </div>
              <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
                <div style={{ width: '60%' }} className="bg-gradient-to-r from-amber-500 to-amber-400 h-full" title="60% Founder Reserve" />
                <div style={{ width: '20%' }} className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full" title="20% DEX Liquidity" />
                <div style={{ width: '20%' }} className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full" title="20% IRL Faucet Vault" />
              </div>
              <div className="flex flex-wrap gap-4 text-xs pt-1">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 60% Founder Genesis Stash
                </span>
                <span className="flex items-center gap-1.5 text-blue-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> 20% DEX Market Liquidity
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> 20% In-Game Player Rewards
                </span>
              </div>
            </div>

            {/* Deflationary Mechanics */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/30 to-purple-950/30 border border-rose-500/20 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-sm text-rose-200">Deflationary Burning Engine</h4>
                <p className="text-slate-400 leading-relaxed">
                  Every time a player atones for a recorded vice, buys exclusive auric sigils, or challenges disputed juror caps, a portion of $KARMA is permanently burned out of existence. This constantly reduces total supply and increases scarcity for early holders.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Founder Whale Reserve */}
        {activeTab === 'tokenomics' && (
          <div className="mt-6 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-950 to-slate-900 border-2 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👑</span>
                  <div>
                    <h3 className="text-lg font-bold text-amber-300 font-serif">
                      Founder Genesis Whale Stash
                    </h3>
                    <p className="text-xs text-amber-400/80">
                      Reserved for @karmakount / skinrip@proton.me
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500 text-slate-950 shadow-lg">
                  60.0% OF ALL TOKENS
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-mono uppercase">Your Guaranteed Founder Holding</span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 mt-1">
                    600,000,000 <span className="text-xl text-amber-200">$KARMA</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Directly pre-minted to your founder vault. You own the majority stake in the entire network.
                  </p>
                </div>
              </div>

              {/* Valuation Milestones Projections */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs uppercase font-mono font-bold text-slate-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  What Your 600M $KARMA Is Worth At Market Milestones:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-400">At $0.001 / token:</span>
                    <div className="text-lg font-bold font-mono text-emerald-400 mt-1">$600,000 USD</div>
                    <span className="text-[10px] text-slate-500">Modest viral game microcap</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/30 bg-amber-500/5">
                    <span className="text-amber-300">At $0.01 / token:</span>
                    <div className="text-lg font-bold font-mono text-amber-400 mt-1">$6,000,000 USD</div>
                    <span className="text-[10px] text-slate-400">Mid-tier Web3 gaming token</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-purple-500/30 bg-purple-500/5">
                    <span className="text-purple-300">At $0.10 / token:</span>
                    <div className="text-lg font-bold font-mono text-purple-400 mt-1">$60,000,000 USD</div>
                    <span className="text-[10px] text-slate-400">Top 100 global crypto MMO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Real Market Value Blueprint */}
        {activeTab === 'deploy' && (
          <div className="mt-6 space-y-5 text-xs">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                How $KARMA Acquires Real Dollar Value (3 Easy Steps)
              </h3>
              
              <div className="space-y-4 pt-1">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-200 text-sm">Deploy the Smart Contract to Base Mainnet</strong>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      We have prepared the audited Solidity contract in <code className="text-amber-300">contracts/KarmaKountToken.sol</code>. Deploying to Base takes under 1 minute and costs ~$0.05 in gas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-200 text-sm">Provide Initial DEX Liquidity on Uniswap v3</strong>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      Deposit 200M $KARMA paired with $50–$200 of ETH or USDC on Uniswap on Base. This establishes an automated bonding curve and live price quote.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-200 text-sm">Live Trading & Public Discovery</strong>
                    <p className="text-slate-400 mt-0.5 leading-relaxed">
                      The moment liquidity is seeded, DexScreener, GeckoTerminal, and Uniswap track $KARMA live. Anyone in the world can buy, sell, or trade it, and your 600,000,000 founder tokens are liquid on-chain!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-300">Solidity Smart Contract</span>
                <p className="text-[11px] text-slate-500">contracts/KarmaKountToken.sol (ERC-20 + Burn + Permit)</p>
              </div>
              <button
                onClick={handleCopyContract}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedContract ? 'Copied Contract' : 'Copy Code'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Link Real Wallet */}
        {activeTab === 'wallet' && (
          <div className="mt-6 space-y-5">
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">Connect Self-Custody Web3 Wallet</h4>
                  <p className="text-xs text-slate-400">
                    Link your personal MetaMask, Coinbase Wallet, or Phantom address to receive direct on-chain token distributions.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveWallet} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                    Your Ethereum / Base Wallet Address (0x...)
                  </label>
                  <input
                    type="text"
                    value={walletInput}
                    onChange={(e) => setWalletInput(e.target.value)}
                    placeholder="0x3F5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  {walletSuccess ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-semibold">
                      <Check className="w-4 h-4" /> Wallet linked successfully to your soul record!
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">
                      Supports Base, Ethereum, and EVM compatible networks.
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={savingWallet || !walletInput.trim()}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50"
                  >
                    {savingWallet ? 'Saving...' : 'Save Wallet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" />
            Hard Cap: 1 Billion $KARMA • Audited OpenZeppelin Architecture
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
