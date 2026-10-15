import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import QRCode from 'qrcode';
import { X, QrCode, Scan, Sparkles, Flame, UserCheck, Shield, Copy, Check } from 'lucide-react';
import { soundManager } from '../services/sound';
import confetti from 'canvas-confetti';

interface SigilScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player;
  players: Player[];
  onQuickBless: (targetPlayerId: string) => Promise<void>;
  onLogForTarget: (targetPlayer: Player) => void;
}

export const SigilScannerModal: React.FC<SigilScannerModalProps> = ({
  isOpen,
  onClose,
  currentPlayer,
  players,
  onQuickBless,
  onLogForTarget,
}) => {
  const [tab, setTab] = useState<'MY_SIGIL' | 'SCAN_PLAYER'>('MY_SIGIL');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [scannedPlayer, setScannedPlayer] = useState<Player | null>(null);
  const [manualHandle, setManualHandle] = useState('');
  const [copied, setCopied] = useState(false);
  const [isBlessing, setIsBlessing] = useState(false);

  useEffect(() => {
    if (isOpen && currentPlayer) {
      QRCode.toDataURL(
        `KARMA_IRL:${currentPlayer.id}:${currentPlayer.username}`,
        {
          width: 280,
          margin: 2,
          color: {
            dark: '#f59e0b',
            light: '#020617'
          }
        }
      ).then(setQrDataUrl);
    }
  }, [isOpen, currentPlayer]);

  if (!isOpen) return null;

  const handleCopySigil = () => {
    navigator.clipboard.writeText(`KARMA_IRL:${currentPlayer.id}:${currentPlayer.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = (player: Player) => {
    setScannedPlayer(player);
    soundManager.playRadarPing();
  };

  const handleQuickBless = async () => {
    if (!scannedPlayer) return;
    setIsBlessing(true);
    try {
      await onQuickBless(scannedPlayer.id);
      soundManager.playVirtueChime();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } finally {
      setIsBlessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              IRL Identity
            </span>
          </div>
          <h2 className="text-2xl font-bold font-cinzel text-white">
            Karmic Sigil & Scanner
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Present your sigil to other players in the real world to let them witness, bless, or log deeds with you.
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
          <button
            onClick={() => setTab('MY_SIGIL')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              tab === 'MY_SIGIL'
                ? 'bg-slate-800 text-amber-300 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>My Scannable Sigil</span>
          </button>
          <button
            onClick={() => setTab('SCAN_PLAYER')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              tab === 'SCAN_PLAYER'
                ? 'bg-slate-800 text-indigo-300 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scan className="w-4 h-4 text-indigo-400" />
            <span>Scan Another Player</span>
          </button>
        </div>

        {tab === 'MY_SIGIL' ? (
          /* My Sigil view */
          <div className="flex flex-col items-center text-center space-y-4">
            {/* The QR Code Card */}
            <div className="p-4 bg-slate-950 rounded-3xl border-2 border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Karmic Sigil QR"
                  className="w-56 h-56 rounded-2xl"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-600 font-mono text-xs">
                  Generating Sigil...
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-bold text-white">{currentPlayer.displayName}</span>
                <span className="text-xs font-mono text-amber-400">{currentPlayer.username}</span>
              </div>
              <p className="text-xs text-slate-400 font-cinzel mt-0.5">{currentPlayer.title}</p>
            </div>

            <div className="w-full flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
              <span className="truncate max-w-[280px]">
                KARMA_IRL:{currentPlayer.id}:{currentPlayer.username}
              </span>
              <button
                onClick={handleCopySigil}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Scanner / Lookup View */
          <div className="space-y-4">
            <div>
              <label htmlFor="sigil-code-input" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Scan IRL Sigil / Select Player to Inspect
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {players
                  .filter(p => p.id !== currentPlayer.id)
                  .map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSimulateScan(p)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                        scannedPlayer?.id === p.id
                          ? 'bg-indigo-950/60 border-indigo-500 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl">{p.avatar}</span>
                      <div className="truncate">
                        <div className="font-bold truncate">{p.displayName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{p.username}</div>
                      </div>
                    </button>
                  ))}
              </div>

              {/* Or manual handle lookup */}
              <div className="flex items-center gap-2">
                <input
                  id="sigil-code-input"
                  type="text"
                  placeholder="Or enter Sigil Code e.g. KARMA_IRL:p-2:@ShadowRebel"
                  value={manualHandle}
                  onChange={(e) => setManualHandle(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  onClick={() => {
                    const match = players.find(p => manualHandle.toLowerCase().includes(p.username.toLowerCase()) || manualHandle.includes(p.id));
                    if (match) handleSimulateScan(match);
                  }}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Lookup
                </button>
              </div>
            </div>

            {/* Scanned Player Dossier & Actions */}
            {scannedPlayer && (
              <div className="bg-slate-950 border border-indigo-500/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{scannedPlayer.avatar}</span>
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{scannedPlayer.displayName}</div>
                      <div className="text-xs font-mono text-indigo-400">{scannedPlayer.username}</div>
                      <div className="text-[10px] text-amber-400 font-cinzel">{scannedPlayer.title}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-lg font-black font-mono ${scannedPlayer.karmaScore >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {scannedPlayer.karmaScore > 0 ? `+${scannedPlayer.karmaScore}` : scannedPlayer.karmaScore}
                    </span>
                    <div className="text-[10px] font-mono text-slate-500">Karma Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      onLogForTarget(scannedPlayer);
                      onClose();
                    }}
                    className="py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Log Deed On Player</span>
                  </button>

                  <button
                    onClick={handleQuickBless}
                    disabled={isBlessing}
                    className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                  >
                    <span>🕊️</span>
                    <span>Bestow Blessing (+5)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
