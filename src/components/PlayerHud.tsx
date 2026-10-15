import React from 'react';
import { Player } from '../types';
import { 
  Heart, Sparkles, Star, MapPin, Zap, Share2, 
  Droplets, LogIn, HelpCircle, Coins, Shield, Award 
} from 'lucide-react';
import { soundManager } from '../services/sound';

interface PlayerHudProps {
  player: Player;
  onOpenSigilModal: () => void;
  onSimulateEncounter: () => void;
  onOpenAtonement: () => void;
  onShareProfile?: () => void;
  onOpenFaucet?: () => void;
  onOpenTokenomics?: () => void;
  onOpenAuth?: () => void;
  onOpenHowItWorks?: () => void;
  isAuthenticated?: boolean;
  isSimulating: boolean;
}

export const PlayerHud: React.FC<PlayerHudProps> = ({
  player,
  onOpenSigilModal,
  onSimulateEncounter,
  onOpenAtonement,
  onShareProfile,
  onOpenFaucet,
  onOpenTokenomics,
  onOpenAuth,
  onOpenHowItWorks,
  isAuthenticated = false,
  isSimulating,
}) => {
  // If not authenticated, render a friendly welcoming card
  if (!isAuthenticated) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/20 border border-slate-800/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Left: Friendly Greeting */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-3xl shadow-inner shrink-0">
              <span>🌸</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Welcome, Friend!</span>
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400 inline" />
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  Guest Explorer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                You're exploring real good deeds happening around the world. Anyone can browse! Join in 10 seconds to share your own deeds, cheer on others, and earn real <strong>$KARMA</strong> crypto rewards on Base.
              </p>
            </div>
          </div>

          {/* Right: Quick Onboarding Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
            {onOpenAuth && (
              <button
                onClick={() => {
                  soundManager.playVirtueChime();
                  onOpenAuth();
                }}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:via-pink-600 hover:to-amber-600 text-white text-xs font-bold transition shadow-lg shadow-rose-500/20 active:scale-95 flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Join Free (10s)</span>
              </button>
            )}

            {onOpenHowItWorks && (
              <button
                onClick={() => {
                  soundManager.playVirtueChime();
                  onOpenHowItWorks();
                }}
                className="px-4 py-2.5 rounded-full border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>How It Works</span>
              </button>
            )}

            {onOpenTokenomics && (
              <button
                onClick={onOpenTokenomics}
                className="px-4 py-2.5 rounded-full border border-amber-500/30 bg-amber-950/20 hover:bg-amber-900/30 text-amber-300 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>$KARMA Token</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Compute aura styling for logged-in user
  const getAuraClass = () => {
    switch (player.alignment) {
      case 'CELESTIAL_ASCENDANT':
        return 'ring-4 ring-amber-400/80 shadow-[0_0_30px_rgba(251,191,36,0.4)]';
      case 'VIRTUOUS_GUARDIAN':
        return 'ring-4 ring-emerald-500/70 shadow-[0_0_25px_rgba(16,185,129,0.3)]';
      case 'ROGUE_TRICKSTER':
        return 'ring-4 ring-purple-500/70 shadow-[0_0_25px_rgba(168,85,247,0.3)]';
      case 'INFERNAL_TITAN':
        return 'ring-4 ring-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.4)]';
      default:
        return 'ring-2 ring-slate-700 shadow-md';
    }
  };

  const isDebt = player.karmaScore < 0;
  const xpNeeded = player.level * 100;
  const xpPercent = Math.min(100, Math.round((player.exp / xpNeeded) * 100));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950 border border-slate-800/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
      {/* Background ambient gradient based on score */}
      <div 
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isDebt ? 'bg-rose-500' : 'bg-amber-400'
        }`} 
      />

      {/* Encouragement Banner if Player has negative Karma */}
      {isDebt && (
        <div className="mb-4 bg-rose-950/60 border border-rose-500/40 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center gap-2 text-rose-300">
            <span>❤️‍🩹</span>
            <span>
              <strong>Kindness Goal Active ({player.karmaScore}):</strong> Complete a daily challenge to bounce back!
            </span>
          </div>
          <button
            onClick={onOpenAtonement}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-[11px] font-bold transition shadow"
          >
            Start Challenge
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-4">
          {/* Avatar with dynamic aura */}
          <div 
            onClick={onOpenSigilModal}
            className={`relative cursor-pointer group flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-950 transition-transform hover:scale-105 ${getAuraClass()}`}
            title="Click to view/scan your kindness QR"
          >
            <span className="text-4xl select-none">{player.avatar}</span>
            <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 rounded-full px-2 py-0.5 text-[10px] font-mono text-amber-300 font-bold">
              Lv.{player.level}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                {player.displayName}
              </h2>
              <span className="text-xs font-mono text-slate-400">{player.username}</span>
            </div>

            <p className="text-xs font-semibold text-amber-300 tracking-wider flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {player.title}
            </p>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{player.location.name}</span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Team {player.faction}
              </span>
            </div>
          </div>
        </div>

        {/* Center: The Big Kindness Score */}
        <div className="flex flex-col items-start md:items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl px-6 py-3.5 shadow-inner min-w-[200px]">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            <span>Kindness Score</span>
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span 
              className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
                player.karmaScore > 0 
                  ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]' 
                  : player.karmaScore < 0 
                  ? 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]' 
                  : 'text-slate-300'
              }`}
            >
              {player.karmaScore > 0 ? `+${player.karmaScore}` : player.karmaScore}
            </span>
            <span className="text-xs font-mono text-slate-500 uppercase font-bold">PTS</span>
          </div>

          <span className="text-[11px] font-medium text-slate-400 mt-1">
            Standing: <span className="font-bold text-slate-200">{player.alignment.replace(/_/g, ' ')}</span>
          </span>
        </div>

        {/* Right: Level XP & Token Balance */}
        <div className="flex flex-col gap-2.5 w-full md:w-64">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" /> Level Progress
              </span>
              <span className="text-amber-300 font-bold">{player.exp} / {xpNeeded} XP</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 transition-all duration-500" 
                style={{ width: `${xpPercent}%` }} 
              />
            </div>
          </div>

          {/* $KARMA Crypto Token balance banner */}
          <div className="bg-slate-950/80 border border-amber-900/30 rounded-2xl px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg select-none">🪙</span>
              <div>
                <span className="text-[9px] uppercase font-mono text-amber-400 block font-bold leading-none tracking-wider">$KARMA Rewards</span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 inline-block">
                  {player.cryptoBalance ? (player.cryptoBalance >= 1000000 ? `${(player.cryptoBalance / 1000000).toLocaleString()}M` : player.cryptoBalance.toLocaleString()) : '0'} <span className="text-[10px] text-amber-300">$KARMA</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onOpenTokenomics && (
                <button
                  onClick={onOpenTokenomics}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-full text-[10px] font-mono font-bold text-amber-300 transition"
                  title="View $KARMA Token on Base & Uniswap"
                >
                  <span>Trade</span>
                </button>
              )}
              {onOpenFaucet && (
                <button
                  onClick={onOpenFaucet}
                  className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-full text-[10px] font-mono font-bold text-cyan-300 transition flex items-center gap-1"
                  title="Claim free daily $KARMA drop"
                >
                  <Droplets className="w-3 h-3 text-cyan-300" />
                  <span>Daily Free</span>
                </button>
              )}
            </div>
          </div>

          {/* Social Share & Encounter Buttons */}
          <div className="flex items-center gap-2">
            {onShareProfile && (
              <button
                onClick={onShareProfile}
                className="flex-1 py-1.5 rounded-full border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 active:scale-95"
                title="Share your kindness record on Instagram, X, or TikTok"
              >
                <Share2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Share Card</span>
              </button>
            )}

            <button
              onClick={onSimulateEncounter}
              disabled={isSimulating}
              className={`flex-1 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 active:scale-95 ${
                isSimulating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Test a simulated IRL encounter from another player"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isSimulating ? 'Testing...' : 'Test Encounter'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
