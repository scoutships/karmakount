import React from 'react';
import { Player } from '../types';
import { Shield, Sparkles, Flame, Eye, Award, MapPin, Zap, Share2, Droplets } from 'lucide-react';

interface PlayerHudProps {
  player: Player;
  onOpenSigilModal: () => void;
  onSimulateEncounter: () => void;
  onOpenAtonement: () => void;
  onShareProfile?: () => void;
  onOpenFaucet?: () => void;
  onOpenTokenomics?: () => void;
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
  isSimulating,
}) => {
  // Compute aura styling
  const getAuraClass = () => {
    switch (player.alignment) {
      case 'CELESTIAL_ASCENDANT':
        return 'aura-celestial ring-4 ring-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.5)]';
      case 'VIRTUOUS_GUARDIAN':
        return 'ring-4 ring-emerald-500/70 shadow-[0_0_25px_rgba(16,185,129,0.4)]';
      case 'ROGUE_TRICKSTER':
        return 'ring-4 ring-purple-600/70 shadow-[0_0_25px_rgba(168,85,247,0.4)]';
      case 'INFERNAL_TITAN':
        return 'aura-infernal ring-4 ring-rose-600/90 shadow-[0_0_40px_rgba(225,29,72,0.6)]';
      default:
        return 'ring-2 ring-slate-600 shadow-[0_0_15px_rgba(148,163,184,0.2)]';
    }
  };

  const isDebt = player.karmaScore < 0;
  const xpNeeded = player.level * 100;
  const xpPercent = Math.min(100, Math.round((player.exp / xpNeeded) * 100));

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 p-5 shadow-2xl backdrop-blur-xl">
      {/* Background ambient gradient based on score */}
      <div 
        className={`absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isDebt ? 'bg-rose-600' : 'bg-amber-500'
        }`} 
      />

      {/* Debt Warning Banner if Player has negative Karma */}
      {isDebt && (
        <div className="mb-4 bg-rose-950/70 border border-rose-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs animate-pulse">
          <div className="flex items-center gap-2 text-rose-300">
            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Karmic Debt Active ({player.karmaScore}):</strong> Complete an Atonement Bounty to restore honor!
            </span>
          </div>
          <button
            onClick={onOpenAtonement}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-bold transition shadow"
          >
            Atone Now
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
            title="Click to view/scan IRL Sigil"
          >
            <span className="text-4xl select-none">{player.avatar}</span>
            <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 rounded-full px-1.5 py-0.5 text-[10px] font-mono text-amber-400 font-bold">
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

            <p className="text-xs font-semibold text-amber-300/90 font-cinzel tracking-wider flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {player.title}
            </p>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{player.location.name}</span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Faction: {player.faction}
              </span>
            </div>
          </div>
        </div>

        {/* Center: The Big Cosmic Score */}
        <div className="flex flex-col items-start md:items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl px-6 py-3.5 shadow-inner min-w-[200px]">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
            Karmic Ledger Balance
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span 
              className={`text-3xl md:text-4xl font-black font-mono tracking-tight ${
                player.karmaScore > 0 
                  ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
                  : player.karmaScore < 0 
                  ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]' 
                  : 'text-slate-300'
              }`}
            >
              {player.karmaScore > 0 ? `+${player.karmaScore}` : player.karmaScore}
            </span>
            <span className="text-xs font-mono text-slate-500 uppercase font-bold">PTS</span>
          </div>

          <span className="text-[11px] font-medium text-slate-400 mt-1">
            Status: <span className="font-bold text-slate-200">{player.alignment.replace(/_/g, ' ')}</span>
          </span>
        </div>

        {/* Right: Arbiter XP & Quick IRL Simulator */}
        <div className="flex flex-col gap-2.5 w-full md:w-64">
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-indigo-400" /> Arbiter XP
              </span>
              <span className="text-indigo-300 font-bold">{player.exp} / {xpNeeded}</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-500" 
                style={{ width: `${xpPercent}%` }} 
              />
            </div>
          </div>

          {/* $KARMA Crypto Token balance banner */}
          <div className="bg-slate-950/80 border border-amber-900/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">🪙</span>
              <div>
                <span className="text-[9px] uppercase font-mono text-amber-400 block font-bold leading-none tracking-wider">$KARMA Token Vault</span>
                <span className="text-xs font-mono font-bold text-white mt-0.5 inline-block">
                  {player.cryptoBalance ? (player.cryptoBalance >= 1000000 ? `${(player.cryptoBalance / 1000000).toLocaleString()}M` : player.cryptoBalance.toLocaleString()) : '0'} <span className="text-[10px] text-amber-300">$KARMA</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onOpenTokenomics && (
                <button
                  onClick={onOpenTokenomics}
                  className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-[10px] font-mono font-bold text-amber-300 transition flex items-center gap-1 active:scale-95 shadow-sm"
                  title="View $KARMA Tokenomics & Real Crypto Coin Architecture"
                >
                  <span>Coin</span>
                </button>
              )}
              {onOpenFaucet && (
                <button
                  onClick={onOpenFaucet}
                  className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg text-[10px] font-mono font-bold text-cyan-300 transition flex items-center gap-1 active:scale-95 shadow-sm"
                  title="Claim free $KARMA crypto tokens"
                >
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>Faucet</span>
                </button>
              )}
            </div>
          </div>

          {/* Detailed stats chips */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-1.5">
              <div className="text-[10px] uppercase text-emerald-400 font-mono font-bold">Virtues</div>
              <div className="text-xs font-bold text-slate-100">{player.virtuesLogged}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-1.5">
              <div className="text-[10px] uppercase text-rose-400 font-mono font-bold">Vices</div>
              <div className="text-xs font-bold text-slate-100">{player.vicesLogged}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-1.5">
              <div className="text-[10px] uppercase text-amber-400 font-mono font-bold">Witnessed</div>
              <div className="text-xs font-bold text-slate-100">{player.deedsWitnessed}</div>
            </div>
          </div>

          {/* Actions: Share & Simulated IRL Incident */}
          <div className="flex gap-2">
            {onShareProfile && (
              <button
                onClick={onShareProfile}
                className="flex-1 py-1.5 px-3 bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 border border-amber-500/40 hover:border-amber-400/60 rounded-lg text-xs font-semibold text-amber-200 transition flex items-center justify-center gap-1.5 shadow-sm"
                title="Share your Karmic score & status to X, Threads, Bluesky, Instagram, Facebook, Reddit & more"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Share Soul</span>
              </button>
            )}

            <button
              onClick={onSimulateEncounter}
              disabled={isSimulating}
              className="flex-1 py-1.5 px-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-amber-300 hover:text-amber-200 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              title="Simulate someone in the real world reporting a deed on you or nearby"
            >
              <Zap className={`w-3.5 h-3.5 text-amber-400 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Simulating...' : 'IRL Encounter'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
