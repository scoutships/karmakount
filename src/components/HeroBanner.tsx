import React, { useState } from 'react';
import { 
  Sparkles, Heart, Camera, Coins, ArrowRight, 
  HelpCircle, TrendingUp, X, ChevronDown, HeartHandshake, Smile, Star 
} from 'lucide-react';
import { soundManager } from '../services/sound';

interface HeroBannerProps {
  onOpenLogModal: () => void;
  onOpenHowItWorks: () => void;
  onOpenTokenomics: () => void;
  isAuthenticated: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenLogModal,
  onOpenHowItWorks,
  onOpenTokenomics,
  isAuthenticated,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('karma_hero_dismissed') === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('karma_hero_dismissed', 'true');
  };

  const handleRestore = () => {
    setIsDismissed(false);
    localStorage.removeItem('karma_hero_dismissed');
  };

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/20 via-slate-900 to-amber-950/20 border border-rose-500/20 text-xs text-slate-300 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🌸</span>
          <span>New here? Share real-world kindness & earn real <strong>$KARMA</strong> rewards on Base.</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playVirtueChime();
              onOpenHowItWorks();
            }}
            className="text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1 transition"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How it works</span>
          </button>
          <button
            onClick={handleRestore}
            className="p-1 text-slate-400 hover:text-white transition"
            title="Expand Welcome Guide"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-rose-950/30 border border-rose-500/30 p-6 sm:p-8 shadow-2xl shadow-rose-500/5 backdrop-blur-xl transition-all">
      {/* Soft warm ambient glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        title="Hide Welcome Guide"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Main Pitch */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-3.5">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          <span>The Real-World Game of Kindness & Impact</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Do Good. Inspire Others.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300">
            Get Rewarded.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed max-w-2xl">
          KarmaKount turns your everyday positive actions—helping a neighbor, volunteering, cleaning nature, or making someone smile—into a fun social game. Share your deeds, cheer on others, and earn real <strong>$KARMA crypto rewards</strong> on Base!
        </p>
      </div>

      {/* 3 Friendly Visual Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-6">
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-rose-500/40 transition">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-xl mb-3">
            <span>🌸</span>
          </div>
          <span className="text-[11px] font-mono uppercase text-rose-400 font-bold">1. Be Kind IRL</span>
          <h4 className="text-sm font-bold text-white mt-0.5">Do Something Positive</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Help a friend, plant trees, donate, hold an elevator, or pick up litter in your neighborhood.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-indigo-500/40 transition">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xl mb-3">
            <span>📸</span>
          </div>
          <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">2. Snap & Share</span>
          <h4 className="text-sm font-bold text-white mt-0.5">Post Proof to the Feed</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Snap a photo or share a short story. The community verifies your deed and cheers you on!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-amber-500/40 transition">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl mb-3">
            <span>✨</span>
          </div>
          <span className="text-[11px] font-mono uppercase text-amber-400 font-bold">3. Earn $KARMA</span>
          <h4 className="text-sm font-bold text-white mt-0.5">Collect Real Crypto Value</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Earn Karma Points, unlock streak badges, and claim real $KARMA tokens trading live on Uniswap.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              soundManager.playVirtueChime();
              onOpenLogModal();
            }}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:via-pink-600 hover:to-amber-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-500/25 transition active:scale-95 flex items-center gap-2"
          >
            <span>+ Share a Good Deed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundManager.playVirtueChime();
              onOpenHowItWorks();
            }}
            className="px-4 py-2.5 rounded-full border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition flex items-center gap-2"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>How It Works & FAQ</span>
          </button>
        </div>

        {/* Live Token Status Badge */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onOpenTokenomics}
            className="px-3.5 py-2 rounded-full bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white transition flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono font-bold text-amber-300">$KARMA Live on Base</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Uniswap & DexScreener</span>
          </button>
        </div>
      </div>
    </div>
  );
};
