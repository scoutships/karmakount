import React, { useState } from 'react';
import { Deed, Player } from '../types';
import { Radio, MapPin, Sparkles, Flame, User, Navigation, Compass } from 'lucide-react';
import { soundManager } from '../services/sound';

interface KarmicRadarProps {
  currentPlayer: Player;
  players: Player[];
  deeds: Deed[];
  onSelectDeed?: (deed: Deed) => void;
}

export const KarmicRadar: React.FC<KarmicRadarProps> = ({
  currentPlayer,
  players,
  deeds,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'DEED' | 'PLAYER';
    data: Deed | Player;
  } | null>(null);

  const handlePingRadar = () => {
    soundManager.playRadarPing();
  };

  // Generate radar coordinates for nearby entities based on dummy or real distance
  const radarItems = [
    ...players
      .filter(p => p.id !== currentPlayer.id)
      .map((p, i) => {
        const angles = [45, 120, 210, 315];
        const rad = (angles[i % angles.length] * Math.PI) / 180;
        const dist = 30 + (i * 20); // distance %
        const x = 50 + dist * Math.cos(rad);
        const y = 50 + dist * Math.sin(rad);
        return {
          id: p.id,
          type: 'PLAYER' as const,
          label: p.displayName,
          x: Math.max(10, Math.min(90, x)),
          y: Math.max(10, Math.min(90, y)),
          data: p,
          polarity: p.karmaScore >= 0 ? 'VIRTUE' : 'VICE'
        };
      }),
    ...deeds.slice(0, 6).map((d, i) => {
      const angles = [25, 90, 160, 240, 290, 340];
      const rad = (angles[i % angles.length] * Math.PI) / 180;
      const dist = 20 + ((i * 12) % 35);
      const x = 50 + dist * Math.cos(rad);
      const y = 50 + dist * Math.sin(rad);
      return {
        id: d.id,
        type: 'DEED' as const,
        label: d.title,
        x: Math.max(10, Math.min(90, x)),
        y: Math.max(10, Math.min(90, y)),
        data: d,
        polarity: d.polarity
      };
    })
  ];

  return (
    <div className="space-y-6">
      {/* Radar Control Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1.5 text-xs font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              IRL Proximity Radar
            </span>
          </div>
          <h2 className="text-2xl font-bold font-cinzel text-white">
            Local Karmic Grid
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-world sector: <strong className="text-emerald-400">{currentPlayer.location.name}</strong> • Range: 1.5 km
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePingRadar}
            className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Ping Grid Frequency</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Circular Display */}
        <div className="lg:col-span-2 relative aspect-square max-w-[550px] mx-auto w-full rounded-full bg-slate-950 border-4 border-slate-800/80 shadow-[0_0_60px_rgba(16,185,129,0.15)] overflow-hidden flex items-center justify-center p-4">
          {/* Concentric distance circles */}
          <div className="absolute inset-8 rounded-full border border-emerald-500/20 pointer-events-none" />
          <div className="absolute inset-20 rounded-full border border-emerald-500/20 pointer-events-none" />
          <div className="absolute inset-32 rounded-full border border-emerald-500/30 pointer-events-none" />
          <div className="absolute inset-44 rounded-full border border-emerald-500/40 pointer-events-none" />

          {/* Crosshairs */}
          <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-500/20 pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-500/20 pointer-events-none" />

          {/* Sweeping Radar Scanner Line */}
          <div className="absolute inset-0 pointer-events-none animate-radar-sweep origin-center">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-emerald-500/30 via-emerald-500/5 to-transparent origin-bottom-right" />
          </div>

          {/* Center: The Current Player */}
          <div className="absolute z-20 flex flex-col items-center justify-center cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-bold ring-4 ring-amber-400/30 animate-pulse shadow-lg">
              {currentPlayer.avatar}
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-300 bg-slate-950/80 px-1.5 py-0.2 rounded mt-1 border border-amber-500/30">
              YOU (Origin)
            </span>
          </div>

          {/* Radar Blips */}
          {radarItems.map((item) => {
            const isSelected = selectedEntity?.data.id === item.id;
            const isVirtue = item.polarity === 'VIRTUE';

            return (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => setSelectedEntity({ type: item.type, data: item.data })}
                style={{ top: `${item.y}%`, left: `${item.x}%` }}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full transition-transform hover:scale-150 ${
                  isSelected ? 'scale-125 ring-2 ring-white' : ''
                }`}
                title={`${item.type}: ${item.label}`}
              >
                {item.type === 'PLAYER' ? (
                  <div className="w-6 h-6 rounded-full bg-indigo-600 border border-indigo-300 text-white flex items-center justify-center text-[10px] shadow-lg shadow-indigo-500/50">
                    <User className="w-3.5 h-3.5" />
                  </div>
                ) : isVirtue ? (
                  <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-ping" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse" />
                )}
              </button>
            );
          })}

          {/* Legend corner overlay */}
          <div className="absolute bottom-4 left-6 z-20 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-[10px] font-mono space-y-1 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Virtue Event</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Vice Event</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Nearby IRL Player</span>
            </div>
          </div>
        </div>

        {/* Selected Entity Dossier / Inspector Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-2 font-bold flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Radar Target Inspector</span>
            </div>

            {selectedEntity ? (
              <div className="space-y-4">
                {selectedEntity.type === 'PLAYER' ? (
                  // Player Inspector
                  (() => {
                    const p = selectedEntity.data as Player;
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-3xl">
                            {p.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100">{p.displayName}</div>
                            <div className="text-xs font-mono text-slate-400">{p.username}</div>
                            <div className="text-[10px] text-amber-400 font-cinzel font-bold">{p.title}</div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Karmic Score:</span>
                            <span className="font-bold font-mono text-amber-400">{p.karmaScore} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Faction:</span>
                            <span className="font-bold text-slate-200">{p.faction}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Deeds Witnessed:</span>
                            <span className="font-bold text-slate-200">{p.deedsWitnessed}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 italic">"{p.bio}"</p>
                      </div>
                    );
                  })()
                ) : (
                  // Deed Inspector
                  (() => {
                    const d = selectedEntity.data as Deed;
                    const isV = d.polarity === 'VIRTUE';
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            isV ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            {d.polarity}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{d.category}</span>
                        </div>

                        <h4 className="font-bold text-slate-100 text-sm">{d.title}</h4>
                        <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                          {d.description}
                        </p>

                        <div className="text-xs text-slate-400 font-mono">
                          <div>Actor: <strong className="text-slate-200">{d.actorPlayerName}</strong></div>
                          <div>Value: <strong className={isV ? 'text-amber-400' : 'text-rose-400'}>{d.karmaValue} Karma</strong></div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <MapPin className="w-8 h-8 mx-auto text-slate-600 animate-bounce" />
                <p className="text-xs font-medium">Click any pulsing blip on the radar screen to inspect players or deeds detected in your IRL grid sector.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Active Grid Signal: <span className="text-emerald-400">99.4% Synchronized</span>
          </div>
        </div>
      </div>
    </div>
  );
};
