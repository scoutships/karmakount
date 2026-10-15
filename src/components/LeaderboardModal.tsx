import React, { useState } from 'react';
import { Player } from '../types';
import { Trophy, Shield, Sparkles, Flame, Scale, Award, Users } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  currentPlayer: Player;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  currentPlayer,
}) => {
  const [tab, setTab] = useState<'SAINTS' | 'SINNERS' | 'ARBITERS'>('SAINTS');

  const saints = [...players].sort((a, b) => b.karmaScore - a.karmaScore);
  const sinners = [...players].sort((a, b) => a.karmaScore - b.karmaScore);
  const arbiters = [...players].sort((a, b) => b.deedsWitnessed - a.deedsWitnessed);

  const activeList = tab === 'SAINTS' ? saints : tab === 'SINNERS' ? sinners : arbiters;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1.5 text-xs font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Global Community Roster
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Kindness Leaderboard
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          Celebrating everyday heroes, thoughtful neighbors, and the community members who verify real good deeds worldwide.
        </p>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setTab('SAINTS')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'SAINTS'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Top Kind Souls</span>
          </button>

          <button
            onClick={() => setTab('SINNERS')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'SINNERS'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Rebuilding Karma</span>
          </button>

          <button
            onClick={() => setTab('ARBITERS')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'ARBITERS'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Top Jurors</span>
          </button>
        </div>
      </div>

      {/* Roster Cards */}
      <div className="space-y-3">
        {activeList.map((player, index) => {
          const isCurrent = player.id === currentPlayer.id;
          const rank = index + 1;

          return (
            <div
              key={player.id}
              className={`flex items-center justify-between p-4 rounded-3xl border transition backdrop-blur-md ${
                isCurrent 
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-lg' 
                  : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  rank === 1 
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40' 
                    : rank === 2 
                    ? 'bg-slate-300 text-slate-950' 
                    : rank === 3 
                    ? 'bg-amber-700 text-amber-100' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {rank}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                  {player.avatar}
                </div>

                {/* Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{player.displayName}</span>
                    <span className="text-xs font-mono text-slate-400">{player.username}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="text-amber-300/90 font-medium text-[11px]">{player.title}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-slate-500">{player.location.name}</span>
                  </div>
                </div>
              </div>

              {/* Score / Metric */}
              <div className="text-right">
                {tab === 'ARBITERS' ? (
                  <div>
                    <span className="text-lg font-black font-mono text-indigo-300">
                      {player.deedsWitnessed}
                    </span>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">
                      Acc: {player.juryAccuracy}%
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className={`text-xl font-black font-mono ${
                      player.karmaScore > 0 ? 'text-amber-400' : player.karmaScore < 0 ? 'text-rose-400' : 'text-slate-300'
                    }`}>
                      {player.karmaScore > 0 ? `+${player.karmaScore}` : player.karmaScore}
                    </span>
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Karma</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
