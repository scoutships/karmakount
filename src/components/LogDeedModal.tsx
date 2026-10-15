import React, { useState } from 'react';
import { Player, DeedPolarity, ImpactTier } from '../types';
import { X, Sparkles, Flame, CheckCircle2, AlertTriangle, MapPin, Camera, User, Users } from 'lucide-react';
import { soundManager } from '../services/sound';
import confetti from 'canvas-confetti';

interface LogDeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player;
  players: Player[];
  onSubmitDeed: (deedData: {
    polarity: DeedPolarity;
    category: string;
    title: string;
    description: string;
    impactTier: ImpactTier;
    actorPlayerId: string;
    targetPlayerId?: string | null;
    reporterPlayerId: string;
    isSelfReport: boolean;
    location: { name: string; lat: number; lng: number };
    proofImage?: string | null;
  }) => Promise<void>;
}

export const LogDeedModal: React.FC<LogDeedModalProps> = ({
  isOpen,
  onClose,
  currentPlayer,
  players,
  onSubmitDeed,
}) => {
  const [reportMode, setReportMode] = useState<'SELF' | 'WITNESS'>('SELF');
  const [polarity, setPolarity] = useState<DeedPolarity>('VIRTUE');
  const [targetPlayerId, setTargetPlayerId] = useState<string>(
    players.find(p => p.id !== currentPlayer.id)?.id || ''
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impactTier, setImpactTier] = useState<ImpactTier>('NOTABLE');
  const [locationName, setLocationName] = useState('Central Community Plaza');
  const [category, setCategory] = useState('Altruism & Charity');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const virtueCategories = [
    'Altruism & Charity',
    'Environmental Stewardship',
    'Courage & Defense',
    'Community Uplift',
    'Unconditional Honesty',
    'Random Act of Kindness'
  ];

  const viceCategories = [
    'Petty Spite & Obstruction',
    'Vandalism & Littering',
    'Public Deception & Lies',
    'Selfish Greed',
    'Broken Vow / Betrayal',
    'Digital / IRL Toxicity'
  ];

  const handlePolarityChange = (newPolarity: DeedPolarity) => {
    setPolarity(newPolarity);
    if (newPolarity === 'VIRTUE') {
      soundManager.playVirtueChime();
      setCategory(virtueCategories[0]);
    } else {
      soundManager.playViceRumble();
      setCategory(viceCategories[0]);
    }
  };

  const getPointsEstimate = () => {
    const base: Record<ImpactTier, number> = {
      TRIVIAL: 10,
      NOTABLE: 35,
      MAJOR: 100,
      MYTHIC: 300
    };
    const pts = base[impactTier] || 35;
    return polarity === 'VIRTUE' ? `+${pts}` : `-${pts}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const isSelf = reportMode === 'SELF';
      const actorId = isSelf ? currentPlayer.id : targetPlayerId;

      await onSubmitDeed({
        polarity,
        category,
        title,
        description,
        impactTier,
        actorPlayerId: actorId,
        targetPlayerId: isSelf ? null : targetPlayerId,
        reporterPlayerId: currentPlayer.id,
        isSelfReport: isSelf,
        location: {
          name: locationName,
          lat: currentPlayer.location.lat,
          lng: currentPlayer.location.lng
        },
        proofImage
      });

      if (polarity === 'VIRTUE') {
        soundManager.playVirtueChime();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#10b981']
        });
      } else {
        soundManager.playViceRumble();
      }

      // Reset and close
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Failed to submit deed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              The Cosmic Ledger
            </span>
          </div>
          <h2 className="text-2xl font-bold font-cinzel text-white tracking-wide">
            Record An IRL Deed
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every action leaves an indelible mark on the cosmic scales. Be truthful; the jury will arbitrate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mode Switcher: Self vs Witness */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setReportMode('SELF')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                reportMode === 'SELF'
                  ? 'bg-slate-800 text-amber-300 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>Log For Myself</span>
            </button>
            <button
              type="button"
              onClick={() => setReportMode('WITNESS')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                reportMode === 'WITNESS'
                  ? 'bg-slate-800 text-indigo-300 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Witnessed Another Player</span>
            </button>
          </div>

          {/* Polarity Selection: Virtue vs Vice */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Deed Polarity (Light vs Dark)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handlePolarityChange('VIRTUE')}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-center gap-3 ${
                  polarity === 'VIRTUE'
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">VIRTUE (Good)</div>
                  <div className="text-[10px] text-amber-400/80 font-mono">Brings Light & Karma</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePolarityChange('VICE')}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-center gap-3 ${
                  polarity === 'VICE'
                    ? 'bg-rose-500/15 border-rose-500/60 shadow-[0_0_20px_rgba(239,68,68,0.25)] text-rose-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">VICE (Bad)</div>
                  <div className="text-[10px] text-rose-400/80 font-mono">Subtracts Karma</div>
                </div>
              </button>
            </div>
          </div>

          {/* If Witness mode, pick target player */}
          {reportMode === 'WITNESS' && (
            <div>
              <label htmlFor="witness-target-select" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Player Caught / Observed
              </label>
              <select
                id="witness-target-select"
                aria-label="Player Caught or Observed"
                value={targetPlayerId}
                onChange={(e) => setTargetPlayerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {players
                  .filter(p => p.id !== currentPlayer.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.avatar} {p.displayName} ({p.username}) - Balance: {p.karmaScore}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Category & Impact Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="deed-category-select" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                id="deed-category-select"
                aria-label="Deed Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {(polarity === 'VIRTUE' ? virtueCategories : viceCategories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="deed-impact-tier-select" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Impact Tier
              </label>
              <select
                id="deed-impact-tier-select"
                aria-label="Deed Impact Tier"
                value={impactTier}
                onChange={(e) => setImpactTier(e.target.value as ImpactTier)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              >
                <option value="TRIVIAL">Trivial (±10 pts)</option>
                <option value="NOTABLE">Notable (±35 pts)</option>
                <option value="MAJOR">Major (±100 pts)</option>
                <option value="MYTHIC">Mythic (±300 pts)</option>
              </select>
            </div>
          </div>

          {/* Deed Title */}
          <div>
            <label htmlFor="deed-title-input" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Action Headline
            </label>
            <input
              id="deed-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={polarity === 'VIRTUE' ? "e.g., Carried heavy groceries for an elder up steep stairs" : "e.g., Abandoned a half-eaten pizza box in the park"}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Detailed Narrative */}
          <div>
            <label htmlFor="deed-narrative-textarea" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              Deed Narrative & Details
            </label>
            <textarea
              id="deed-narrative-textarea"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, where, and what the immediate real-world outcome was..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Geolocation Tag */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <input
              type="text"
              aria-label="IRL Location Tag"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="IRL Location tag..."
              className="bg-transparent text-xs text-slate-300 w-full focus:outline-none font-mono"
            />
          </div>

          {/* Karmic Preview Banner */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Pending Karmic Adjustment
              </span>
              <div className="text-xl font-bold font-mono">
                <span className={polarity === 'VIRTUE' ? 'text-amber-400' : 'text-rose-400'}>
                  {getPointsEstimate()} Karma
                </span>
                <span className="text-xs text-slate-500 font-normal ml-2">
                  ({impactTier === 'TRIVIAL' && reportMode === 'SELF' ? 'Auto-settled' : 'Requires 2 Jury Vouches'})
                </span>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-400 max-w-[200px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline mr-1" />
              Arbiters review witness reports. False submissions lose 25 Karma.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider transition shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 ${
              polarity === 'VIRTUE'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-rose-600/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Inscribing in Cosmic Ledger...' : 'Inscribe Deed To Ledger'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
