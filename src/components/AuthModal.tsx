import React, { useState } from 'react';
import { Player, Faction } from '../types';
import { X, Sparkles, Flame, Scale, User, Mail, Lock, MapPin, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { soundManager } from '../services/sound';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (player: Player, token: string) => void;
  title?: string;
  subtitle?: string;
  initialTab?: 'LOGIN' | 'REGISTER';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  title,
  subtitle,
  initialTab = 'REGISTER',
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>(initialTab);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFaction, setRegFaction] = useState<Faction>('LUMEN');
  const [regAvatar, setRegAvatar] = useState('⚡');
  const [regLocation, setRegLocation] = useState('Metro Sector 1');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const avatars = ['🕊️', '⚡', '🦇', '☯️', '🦊', '🐉', '🌸', '🗡️', '🛡️', '👁️', '✨', '🪐'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      soundManager.playVirtueChime();
      onLoginSuccess(data.player, data.token);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: regEmail,
          username: regUsername,
          displayName: regDisplayName,
          password: regPassword,
          faction: regFaction,
          avatar: regAvatar,
          locationName: regLocation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      soundManager.playAscensionFanfare();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
      });

      onLoginSuccess(data.player, data.token);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (username: string) => {
    setLoginIdentifier(username);
    setLoginPassword('password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-6 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
            <span className="text-[10px] uppercase font-mono tracking-widest text-rose-300 font-bold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              KarmaKount Account
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {title ? title : (tab === 'LOGIN' ? 'Welcome Back!' : 'Join KarmaKount in 10 Seconds')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            {subtitle ? subtitle : (tab === 'LOGIN'
              ? 'Sign in to share deeds, cheer on others, and earn $KARMA rewards.'
              : 'Free & open for everyone! Start logging deeds and earning $KARMA on Base.')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setTab('LOGIN'); setError(null); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'LOGIN'
                ? 'bg-slate-800 text-rose-300 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('REGISTER'); setError(null); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'REGISTER'
                ? 'bg-slate-800 text-amber-300 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Join Free</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200">
            <div className="font-semibold">{error}</div>
            {error.includes('No player found') && (
              <div className="mt-2.5 pt-2.5 border-t border-rose-900/60">
                <button
                  type="button"
                  onClick={() => {
                    const isEmail = loginIdentifier.includes('@') && loginIdentifier.includes('.');
                    if (isEmail) {
                      setRegEmail(loginIdentifier);
                      setRegUsername(loginIdentifier.split('@')[0]);
                      setRegDisplayName(loginIdentifier.split('@')[0]);
                    } else {
                      setRegUsername(loginIdentifier.replace(/^@/, ''));
                      setRegDisplayName(loginIdentifier.replace(/^@/, ''));
                    }
                    if (loginPassword) {
                      setRegPassword(loginPassword);
                    }
                    setTab('REGISTER');
                    setError(null);
                  }}
                  className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Register "{loginIdentifier}" Now ➔</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. sophia@karmakount.com or @SaintSophia"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Verifying Soul Signature...' : 'Enter the Grid'}
            </button>

            {/* Quick Demo Logins Helper */}
            <div className="pt-3 border-t border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
                Quick Demo Accounts (Password: password123)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('@SaintSophia')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-[11px] text-slate-300 text-left truncate transition"
                >
                  <div className="font-bold text-amber-400">🕊️ Sophia</div>
                  <div className="text-[9px] text-slate-500 font-mono">+1420 Pts</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('@ShadowRebel')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-[11px] text-slate-300 text-left truncate transition"
                >
                  <div className="font-bold text-rose-400">🦇 Kaelen</div>
                  <div className="text-[9px] text-slate-500 font-mono">-340 Pts</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('@ZenTao')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-[11px] text-slate-300 text-left truncate transition"
                >
                  <div className="font-bold text-indigo-400">☯️ Master Chen</div>
                  <div className="text-[9px] text-slate-500 font-mono">+35 Pts</div>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Unique Gamer Tag
                </label>
                <input
                  type="text"
                  required
                  placeholder="@NeoMonk"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Cross"
                  value={regDisplayName}
                  onChange={(e) => setRegDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Choose Avatar */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Choose Karmic Sigil Avatar
              </label>
              <div className="flex flex-wrap gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                {avatars.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setRegAvatar(av)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition ${
                      regAvatar === av
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 scale-110'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Choose Starting Faction */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Allegiance (Faction)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRegFaction('LUMEN')}
                  className={`p-2 rounded-xl border text-left transition ${
                    regFaction === 'LUMEN'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Lumen
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Order of Light</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegFaction('CHAOS')}
                  className={`p-2 rounded-xl border text-left transition ${
                    regFaction === 'CHAOS'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400" /> Chaos
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Shadow Rebels</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegFaction('EQUILIBRIUM')}
                  className={`p-2 rounded-xl border text-left transition ${
                    regFaction === 'EQUILIBRIUM'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-cyan-400" /> Balance
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">True Neutral</div>
                </button>
              </div>
            </div>

            {/* Location Tag */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                Physical Sector / Neighborhood Tag
              </label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  placeholder="e.g. Downtown Metro, Southside Park"
                  value={regLocation}
                  onChange={(e) => setRegLocation(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-600/25 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Inscribing in Cosmic Ledger...' : 'Create Account & Start (+50 Karma)'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
