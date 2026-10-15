import React from 'react';
import { 
  X, Sparkles, CheckCircle2, Shield, Coins, HeartHandshake, 
  Camera, TrendingUp, HelpCircle, ArrowRight, ExternalLink, Zap 
} from 'lucide-react';
import { soundManager } from '../services/sound';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogModal: () => void;
  onOpenTokenomics: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onOpenLogModal,
  onOpenTokenomics,
}) => {
  if (!isOpen) return null;

  const handlePostClick = () => {
    soundManager.playVirtueChime();
    onClose();
    onOpenLogModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="text-center max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>The Massively Multiplayer IRL Game</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
            What is KarmaKount?
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            KarmaKount turns real-world kindness into a game. Do good in real life, get verified by the community, level up your rank, and earn real <strong>$KARMA</strong> crypto tokens on Base!
          </p>
        </div>

        {/* 3 Step Visual Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-amber-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold mb-3">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono uppercase text-amber-400 font-bold">Step 1</span>
            <h4 className="font-bold text-sm text-white mt-0.5">Do Good in Real Life</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Help a neighbor, clean up a park, donate clothes, return a shopping cart, or buy a stranger coffee.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold mb-3">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono uppercase text-indigo-400 font-bold">Step 2</span>
            <h4 className="font-bold text-sm text-white mt-0.5">Post Proof</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Snap a photo and log your deed to the global public feed. Anyone can see the positive impact being made.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mb-3">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">Step 3</span>
            <h4 className="font-bold text-sm text-white mt-0.5">Earn $KARMA</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              The community jury verifies your deed. You earn Karma points and claim real $KARMA tokens deployed on Base!
            </p>
          </div>
        </div>

        {/* Real Token Callout */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-indigo-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">$KARMA Token is Real Money</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Live on Base
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Traded on Uniswap with live DexScreener charts. Earn it free by doing good deeds!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenTokenomics();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-amber-500/40 transition shrink-0"
          >
            Tokenomics & Dex
          </button>
        </div>

        {/* FAQ Quick Accordion */}
        <div className="mt-5 space-y-2">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Frequently Asked Questions</span>
          </h4>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs">
            <strong className="text-slate-200">Do I need a crypto wallet or money to start?</strong>
            <p className="text-slate-400 mt-1">
              No! It is 100% free. You can browse, read deeds, or sign up with just a username in 10 seconds. You only need a wallet if you want to cash out your $KARMA on Uniswap.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs">
            <strong className="text-slate-200">How do you prevent fake deeds?</strong>
            <p className="text-slate-400 mt-1">
              Every deed enters the <strong>Peer Jury</strong> tab. Other players inspect photos and stories, voting "Vouch" (legit) or "Cap" (fake). Jurors earn tokens for honest reviews!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
          >
            Explore Feed First
          </button>
          <button
            onClick={handlePostClick}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <span>+ Post a Good Deed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
