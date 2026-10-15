import React, { useState } from 'react';
import { Quest, Player } from '../types';
import { Flame, Sparkles, CheckCircle2, Clock, MapPin, Award, Compass, Zap } from 'lucide-react';
import { soundManager } from '../services/sound';
import confetti from 'canvas-confetti';

interface AtonementSanctuaryProps {
  quests: Quest[];
  currentPlayer: Player;
  onCompleteQuest: (questId: string) => Promise<void>;
}

export const AtonementSanctuary: React.FC<AtonementSanctuaryProps> = ({
  quests,
  currentPlayer,
  onCompleteQuest,
}) => {
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleComplete = async (quest: Quest) => {
    setCompletingId(quest.id);
    try {
      await onCompleteQuest(quest.id);
      soundManager.playAscensionFanfare();
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ec4899', '#f59e0b', '#10b981']
      });
    } finally {
      setCompletingId(null);
    }
  };

  const isDebt = currentPlayer.karmaScore < 0;

  return (
    <div className="space-y-6">
      {/* Sanctuary Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-amber-950/40 border border-purple-700/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold">
                <Flame className="w-3.5 h-3.5 text-purple-400" />
                The Crucible of Renewal
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-white tracking-wide">
              Atonement & Community Bounties
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              No soul is beyond grace in the Cosmic Ledger. Take up IRL quests to atone for transgressions, cleanse karmic debt, and uplift your physical community.
            </p>
          </div>

          {/* Current Debt or Grace Indicator */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shrink-0 shadow-lg min-w-[200px]">
            <div className="text-[10px] font-mono uppercase text-slate-400">Current Soul State</div>
            <div className={`text-xl font-bold font-mono ${isDebt ? 'text-rose-400' : 'text-amber-400'}`}>
              {isDebt ? `In Debt (${currentPlayer.karmaScore})` : `In Grace (+${currentPlayer.karmaScore})`}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isDebt ? 'Perform atonement to clear debuffs' : 'Earning surplus divine merit'}
            </div>
          </div>
        </div>
      </div>

      {/* Quests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quests.map((quest) => {
          const isDone = quest.completedBy.includes(currentPlayer.id);
          const isAtonement = quest.category === 'ATONEMENT_RITUAL';

          return (
            <div
              key={quest.id}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all backdrop-blur-md flex flex-col justify-between ${
                isDone
                  ? 'bg-slate-950/40 border-slate-800 opacity-60'
                  : isAtonement
                  ? 'bg-purple-950/30 border-purple-800/60 hover:border-purple-500/60 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40 shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow">
                      {quest.icon}
                    </div>
                    <div>
                      <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        isAtonement 
                          ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50' 
                          : 'bg-amber-900/40 text-amber-300 border border-amber-700/50'
                      }`}>
                        {quest.category.replace(/_/g, ' ')}
                      </span>
                      <h3 className="font-bold text-slate-100 text-base mt-1">
                        {quest.title}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black font-mono text-amber-400">
                      +{quest.karmaReward}
                    </span>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Karma</div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {quest.description}
                </p>

                {quest.locationHint && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mb-4">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>IRL Target: {quest.locationHint}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Difficulty: <strong className="text-slate-200">{quest.difficulty}</strong>
                </span>

                {isDone ? (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> COMPLETED
                  </span>
                ) : (
                  <button
                    onClick={() => handleComplete(quest)}
                    disabled={completingId === quest.id}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{completingId === quest.id ? 'Verifying...' : 'Claim & Atone (+XP)'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
