import React from 'react';
import { Player, KarmicStats } from '../types';
import { Scale, Volume2, VolumeX, QrCode, Shield, Sparkles, Flame, Users, Radio, LogIn, LogOut, UserCheck, Droplets, Coins } from 'lucide-react';
import { soundManager } from '../services/sound';

interface HeaderProps {
  currentPlayer: Player;
  players: Player[];
  onSelectPlayer: (player: Player) => void;
  stats: KarmicStats | null;
  activeTab: 'feed' | 'court' | 'radar' | 'quests' | 'leaderboard';
  setActiveTab: (tab: 'feed' | 'court' | 'radar' | 'quests' | 'leaderboard') => void;
  onOpenLogModal: () => void;
  onOpenSigilModal: () => void;
  onOpenAuthModal: () => void;
  onOpenFaucetModal?: () => void;
  onOpenTokenomicsModal?: () => void;
  onSignOut: () => void;
  isAuthenticated: boolean;
  isWsConnected: boolean;
  soundMuted: boolean;
  setSoundMuted: (muted: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPlayer,
  players,
  onSelectPlayer,
  stats,
  activeTab,
  setActiveTab,
  onOpenLogModal,
  onOpenSigilModal,
  onOpenAuthModal,
  onOpenFaucetModal,
  onOpenTokenomicsModal,
  onSignOut,
  isAuthenticated,
  isWsConnected,
  soundMuted,
  setSoundMuted,
}) => {
  const handleToggleSound = () => {
    const newMuted = soundManager.toggleMute();
    setSoundMuted(newMuted);
    if (!newMuted) {
      soundManager.playVirtueChime();
    }
  };

  const purity = stats ? stats.globalPurityPercent : 72;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      {/* Top Ticker: Global Balance & Connectivity */}
      <div className="bg-slate-900/60 border-b border-slate-800/50 px-4 py-1 text-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-mono tracking-wider uppercase text-[10px]">
              {isWsConnected ? 'Cosmic Ledger: Live Sync' : 'Reconnecting...'}
            </span>
          </span>
          <span className="hidden sm:inline-block text-slate-700">|</span>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Global Purity:</span>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-amber-400 transition-all duration-700" 
                style={{ width: `${purity}%` }} 
                title={`${purity}% Virtues`} 
              />
              <div 
                className="bg-rose-600 transition-all duration-700" 
                style={{ width: `${100 - purity}%` }} 
                title={`${100 - purity}% Vices`} 
              />
            </div>
            <span className="text-amber-400 font-mono font-bold text-[10px]">{purity}% Light</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 hidden md:inline flex items-center gap-1 font-mono text-[11px]">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Active Arbiters: <strong className="text-indigo-300">{players.length}</strong></span>
          </span>

          {/* Persona Switcher for Quick MMO Testing */}
          <div className="flex items-center gap-1.5 bg-slate-800/70 hover:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700/60 transition">
            <span className="text-[10px] uppercase font-mono text-slate-400 hidden lg:inline">Persona:</span>
            <select
              aria-label="Active Player Persona"
              className="bg-transparent text-amber-300 font-medium text-xs focus:outline-none cursor-pointer"
              value={currentPlayer.id}
              onChange={(e) => {
                const found = players.find(p => p.id === e.target.value);
                if (found) onSelectPlayer(found);
              }}
            >
              {players.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.avatar} {p.displayName} ({p.karmaScore > 0 ? `+${p.karmaScore}` : p.karmaScore})
                </option>
              ))}
            </select>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundMuted ? "Unmute Celestial/Infernal Synthesizer" : "Mute Sounds"}
            className="p-1 rounded text-slate-400 hover:text-amber-400 transition hover:bg-slate-800"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-purple-600 to-rose-600 shadow-lg shadow-amber-500/20">
            <Scale className="w-6 h-6 text-slate-950 font-bold" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-500">
                KarmaKount
              </span>
              <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                IRL MMO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight font-medium hidden sm:block">
              Universal Real-World Ledger & Score
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Feed</span>
          </button>

          <button
            onClick={() => setActiveTab('court')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'court'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Court (Jury)</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'radar'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>IRL Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('quests')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'quests'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>Bounties</span>
          </button>
        </nav>

        {/* Action Buttons: Log Deed, My Sigil & Sign In/Out */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <button
              onClick={onSignOut}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-rose-950/40 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 text-xs font-semibold transition"
              title="Sign Out of Soul Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Register</span>
            </button>
          )}

          {onOpenFaucetModal && (
            <button
              onClick={onOpenFaucetModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-semibold transition hover:border-cyan-400 shadow-sm shadow-cyan-500/10 active:scale-95"
              title="Dispense Free $KARMA Crypto Tokens"
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">Faucet</span>
              {typeof currentPlayer.cryptoBalance === 'number' && currentPlayer.cryptoBalance > 0 && (
                <span className="text-[10px] font-mono bg-cyan-900/70 border border-cyan-700/50 px-1.5 py-0.2 rounded text-cyan-200">
                  {currentPlayer.cryptoBalance > 1000000 ? `${(currentPlayer.cryptoBalance / 1000000).toFixed(0)}M` : `${currentPlayer.cryptoBalance}`} $K
                </span>
              )}
            </button>
          )}

          {onOpenTokenomicsModal && (
            <button
              onClick={onOpenTokenomicsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs font-semibold transition hover:border-amber-400 shadow-sm shadow-amber-500/10 active:scale-95"
              title="$KARMA Tokenomics & Real Crypto Coin"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">$KARMA Coin</span>
            </button>
          )}

          <button
            onClick={onOpenSigilModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition hover:border-amber-500/50"
            title="Scan or View IRL Sigil QR"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">IRL Sigil</span>
          </button>

          <button
            onClick={onOpenLogModal}
            className="relative group overflow-hidden px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center gap-1.5"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span>+ Log Deed</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
