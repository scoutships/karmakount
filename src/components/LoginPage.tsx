import React, { useState } from 'react';
import { Player, Faction } from '../types';
import { 
  Scale, Sparkles, Flame, ShieldCheck, Mail, Lock, 
  MapPin, User, ArrowRight, Eye, CheckCircle2 
} from 'lucide-react';
import { soundManager } from '../services/sound';
import confetti from 'canvas-confetti';

interface LoginPageProps {
  onLoginSuccess: (player: Player, token: string) => void;
  onContinueAsGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onContinueAsGuest,
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Sign in form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFaction, setRegFaction] = useState<Faction>('LUMEN');
  const [regAvatar, setRegAvatar] = useState('⚡');
  const [regLocation, setRegLocation] = useState('Downtown Metro');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        throw new Error(data.error || 'Invalid credentials');
      }

      soundManager.playVirtueChime();
      onLoginSuccess(data.player, data.token);
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
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
      });

      onLoginSuccess(data.player, data.token);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (identifier: string) => {
    setLoginIdentifier(identifier);
    setLoginPassword('password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Background Ambient Cosmic Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Simple Bar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full border-b border-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-purple-600 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Scale className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <span className="font-cinzel text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-500">
              KarmaKount
            </span>
            <span className="ml-2 text-[9px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
              IRL MMO
            </span>
          </div>
        </div>

        <button
          onClick={onContinueAsGuest}
          className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Explore Public Feed</span>
        </button>
      </header>

      {/* Main Center Auth Container */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-black font-cinzel text-white tracking-wide">
            {tab === 'LOGIN' ? 'Sign In to KarmaKount' : 'Create Soul Profile'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm mx-auto">
            {tab === 'LOGIN'
              ? 'Enter the physical-world MMO ledger. Log deeds, vote on jury trials, and build your aura.'
              : 'Register your soul into the physical-world MMO ledger. Every action leaves a mark.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setTab('LOGIN'); setError(null); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                tab === 'LOGIN'
                  ? 'bg-slate-800 text-amber-300 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setTab('REGISTER'); setError(null); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                tab === 'REGISTER'
                  ? 'bg-slate-800 text-indigo-300 shadow-md border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Register</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200">
              <div className="font-semibold">{error}</div>
              {error.includes('No player found') && (
                <div className="mt-2.5 pt-2.5 border-t border-rose-900/60">
                  <p className="text-[11px] text-rose-300/90 leading-relaxed mb-2">
                    Did you create this account recently? If the server restarted during our latest update, click below to immediately inscribe and register it with this password:
                  </p>
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
                    <span>Click Here to Register "{loginIdentifier}" Now ➔</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SIGN IN FORM */}
          {tab === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Email or @Username
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
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Verifying Soul Signature...' : 'Sign In to KarmaKount'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Accounts */}
              <div className="pt-4 border-t border-slate-800/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
                  1-Click Quick Demo Accounts:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('@SaintSophia')}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-[11px] text-slate-300 text-left transition"
                  >
                    <div className="font-bold text-amber-400">🕊️ Sophia</div>
                    <div className="text-[9px] text-slate-500 font-mono">+1420 Pts</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('@ShadowRebel')}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-[11px] text-slate-300 text-left transition"
                  >
                    <div className="font-bold text-rose-400">🦇 Kaelen</div>
                    <div className="text-[9px] text-slate-500 font-mono">-340 Pts</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('@ZenTao')}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 text-[11px] text-slate-300 text-left transition"
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Gamer Handle
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@YourHandle"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

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
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Password (min 6 characters)
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

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Karmic Avatar Sigil
                </label>
                <div className="flex flex-wrap gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {avatars.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setRegAvatar(av)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition ${
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

              {/* Faction Selector */}
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
                    <div className="text-[9px] text-slate-500">Order of Light</div>
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
                    <div className="text-[9px] text-slate-500">Shadow Rebels</div>
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
                    <div className="text-[9px] text-slate-500">True Neutral</div>
                  </button>
                </div>
              </div>

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
                {loading ? 'Creating Soul Signature...' : 'Register Account (+50 Karma)'}
              </button>
            </form>
          )}
        </div>

        {/* Guest Spectator Option */}
        <div className="text-center mt-6">
          <button
            onClick={onContinueAsGuest}
            className="text-xs text-slate-500 hover:text-slate-300 transition underline underline-offset-4"
          >
            Or browse the live Cosmic Ledger as a guest spectator →
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-slate-600 font-mono border-t border-slate-900">
        KarmaKount Universal IRL Ledger • Inscribe Every Deed
      </footer>
    </div>
  );
};
