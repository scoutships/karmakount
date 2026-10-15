import React from 'react';
import { Deed, Player } from '../types';
import { Shield, Gavel, CheckCircle2, XCircle, Award, Scale, HelpCircle } from 'lucide-react';
import { soundManager } from '../services/sound';
import confetti from 'canvas-confetti';

interface KarmicCourtProps {
  deeds: Deed[];
  currentPlayer: Player;
  onVote: (deedId: string, vote: 'VOUCH' | 'CAP') => Promise<void>;
}

export const KarmicCourt: React.FC<KarmicCourtProps> = ({
  deeds,
  currentPlayer,
  onVote,
}) => {
  const pendingDeeds = deeds.filter(d => d.status === 'PENDING_JURY');

  const handleVote = async (deedId: string, vote: 'VOUCH' | 'CAP') => {
    await onVote(deedId, vote);
    soundManager.playGavelStrike();
    if (vote === 'VOUCH') {
      confetti({ particleCount: 30, spread: 60 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Court Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-900/40 border border-indigo-700/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-bold">
                <Gavel className="w-3.5 h-3.5 text-indigo-400" />
                The Tribunal of Consensus
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-white tracking-wide">
              The Karmic Court
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              In an IRL world, truth is forged through peer witnesses. Review claims, corroborate genuine acts of grace, and strike down fraudulent reports.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Your Arbiter Accuracy</div>
              <div className="text-xl font-bold font-mono text-indigo-300">
                {currentPlayer.juryAccuracy}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {currentPlayer.deedsWitnessed} cases deliberated
              </div>
            </div>
          </div>
        </div>

        {/* Arbiter Code Rules */}
        <div className="mt-6 pt-4 border-t border-indigo-900/50 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="flex items-start gap-2 bg-indigo-950/40 p-3 rounded-xl border border-indigo-900/40">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>2 Vouches</strong> confirm the deed and release Karma points to the player.</span>
          </div>
          <div className="flex items-start gap-2 bg-indigo-950/40 p-3 rounded-xl border border-indigo-900/40">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span><strong>2 Caps</strong> dismiss fraudulent reports and penalize the liar with <strong>-25 Karma</strong>.</span>
          </div>
          <div className="flex items-start gap-2 bg-indigo-950/40 p-3 rounded-xl border border-indigo-900/40">
            <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Jurors earn <strong>+15 Arbiter XP</strong> for every fair consensus vote.</span>
          </div>
        </div>
      </div>

      {/* Pending Docket */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-cinzel text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Active Cases Awaiting Deliberation ({pendingDeeds.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {pendingDeeds.length === 0 ? 'Docket Clear' : 'Jurors Needed'}
          </span>
        </div>

        {pendingDeeds.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-950/50 border border-indigo-800/40 flex items-center justify-center text-indigo-400 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-semibold text-sm text-slate-200">The Scales Are In Equilibrium</p>
            <p className="text-xs text-slate-400 mt-1">
              All reported IRL deeds have achieved consensus. Check back when new deeds are logged!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingDeeds.map((deed) => {
              const isVirtue = deed.polarity === 'VIRTUE';
              const userVote = deed.juryVotes.voters[currentPlayer.id];
              const isOwnDeed = deed.actorPlayerId === currentPlayer.id;

              return (
                <div
                  key={deed.id}
                  className="bg-slate-900/90 border border-indigo-950/80 hover:border-indigo-600/50 rounded-2xl p-5 shadow-xl transition-all backdrop-blur-md"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-xl border border-slate-800">
                        {deed.actorAvatar}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100">
                          {deed.actorPlayerName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {deed.isSelfReport ? 'Self-Reported Claim' : `Witness Report by ${deed.reporterPlayerName}`}
                          {' • '}{deed.location.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-base font-black font-mono ${isVirtue ? 'text-amber-400' : 'text-rose-400'}`}>
                        {deed.karmaValue > 0 ? `+${deed.karmaValue}` : deed.karmaValue} Karma
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 font-bold">
                        {deed.impactTier}
                      </span>
                    </div>
                  </div>

                  {/* Deed Claim Text */}
                  <div className="my-4">
                    <h4 className="text-base font-bold text-slate-100">{deed.title}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                      "{deed.description}"
                    </p>
                  </div>

                  {/* Deliberation Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">{deed.juryVotes.vouches} Vouches</span>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${Math.min(100, (deed.juryVotes.vouches / 2) * 100)}%` }} 
                          />
                        </div>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-rose-400 font-bold">{deed.juryVotes.caps} Caps</span>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500" 
                            style={{ width: `${Math.min(100, (deed.juryVotes.caps / 2) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Verdict Buttons */}
                    <div>
                      {isOwnDeed ? (
                        <span className="text-xs font-mono text-amber-400 italic">
                          You cannot vote on your own registered deed
                        </span>
                      ) : userVote ? (
                        <span className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                          Your vote: <strong className={userVote === 'VOUCH' ? 'text-emerald-400' : 'text-rose-400'}>{userVote}</strong>
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote(deed.id, 'VOUCH')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 active:scale-95"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Vouch (True Deed)</span>
                          </button>
                          <button
                            onClick={() => handleVote(deed.id, 'CAP')}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-600/20 active:scale-95"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Call Cap (False)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
