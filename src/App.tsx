import React, { useState, useEffect, useRef } from 'react';
import { Player, Deed, Quest, KarmicStats, DeedPolarity, ImpactTier } from './types';
import { Header } from './components/Header';
import { PlayerHud } from './components/PlayerHud';
import { CosmicFeed } from './components/CosmicFeed';
import { KarmicCourt } from './components/KarmicCourt';
import { KarmicRadar } from './components/KarmicRadar';
import { AtonementSanctuary } from './components/AtonementSanctuary';
import { Leaderboard } from './components/LeaderboardModal';
import { LogDeedModal } from './components/LogDeedModal';
import { SigilScannerModal } from './components/SigilScannerModal';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { soundManager } from './services/sound';
import { NativePlatformBridge } from './services/native';
import { Sparkles, Flame, Shield, X, Bell } from 'lucide-react';

export const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [deeds, setDeeds] = useState<Deed[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [stats, setStats] = useState<KarmicStats | null>(null);

  const [activeTab, setActiveTab] = useState<'feed' | 'court' | 'radar' | 'quests' | 'leaderboard'>('feed');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSigilModalOpen, setIsSigilModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('karma_auth_token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(localStorage.getItem('karma_auth_token')));
  const [isGuestMode, setIsGuestMode] = useState<boolean>(() => localStorage.getItem('karma_guest_mode') === 'true');

  const [isSimulating, setIsSimulating] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [soundMuted, setSoundMuted] = useState(soundManager.getMuted());
  const [toast, setToast] = useState<{ text: string; polarity: 'VIRTUE' | 'VICE' | 'INFO' } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const showToast = (text: string, polarity: 'VIRTUE' | 'VICE' | 'INFO' = 'INFO') => {
    setToast({ text, polarity });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Check existing auth session on boot
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('karma_auth_token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentPlayer(data.player);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('karma_auth_token');
            setAuthToken(null);
            setIsAuthenticated(false);
          }
        } catch {
          // Offline or network error
        }
      }
    };
    checkAuth();
  }, []);

  // 1. Initial REST fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, deedsRes, questsRes, statsRes] = await Promise.all([
          fetch('/api/players').then(r => r.json()),
          fetch('/api/deeds').then(r => r.json()),
          fetch('/api/quests').then(r => r.json()),
          fetch('/api/stats').then(r => r.json()),
        ]);

        setPlayers(playersRes);
        setDeeds(deedsRes);
        setQuests(questsRes);
        setStats(statsRes);

        // Pick default player or first in list
        if (!currentPlayer && playersRes.length > 0) {
          const savedId = localStorage.getItem('karma_active_player_id');
          const matched = playersRes.find((p: Player) => p.id === savedId) || playersRes[0];
          setCurrentPlayer(matched);
        }
      } catch (err) {
        console.error('Error fetching initial game data:', err);
      }
    };

    fetchData();
  }, []);

  // 2. WebSocket setup for real-time multiplayer sync
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // In dev (port 5173), connect to port 3001; in production (karmakount.com), connect to current host
      const isDev = window.location.port === '5173';
      const wsHost = isDev ? `${window.location.hostname}:3001` : window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}`;

      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const { type, payload } = JSON.parse(event.data);

          switch (type) {
            case 'INIT_SYNC':
              setPlayers(payload.players);
              setDeeds(payload.deeds);
              setQuests(payload.quests);
              if (!currentPlayer && payload.players.length > 0) {
                setCurrentPlayer(payload.players[0]);
              }
              break;

            case 'DEED_CREATED': {
              const { deed, actor } = payload;
              setDeeds(prev => [deed, ...prev.filter(d => d.id !== deed.id)]);

              // Update actor if in players list
              setPlayers(prev => prev.map(p => p.id === actor.id ? { ...p, ...actor } : p));
              if (currentPlayer?.id === actor.id) {
                setCurrentPlayer(prev => prev ? { ...prev, ...actor } : null);
              }

              // Sound & Toast & Native notification
              if (deed.polarity === 'VIRTUE') {
                soundManager.playVirtueChime();
                NativePlatformBridge.triggerVirtueHaptics();
                NativePlatformBridge.sendNativeNotification('KarmaKount Virtue Recorded', `${deed.actorPlayerName}: ${deed.title}`);
                showToast(`🕊️ New Virtue Logged: "${deed.title}" by ${deed.actorPlayerName}`, 'VIRTUE');
              } else {
                soundManager.playViceRumble();
                NativePlatformBridge.triggerViceHaptics();
                NativePlatformBridge.sendNativeNotification('KarmaKount Vice Reported', `${deed.actorPlayerName}: ${deed.title}`);
                showToast(`🔥 Vice Reported: "${deed.title}" by ${deed.actorPlayerName}`, 'VICE');
              }
              break;
            }

            case 'JURY_VOTED': {
              const { deed, voter, actor } = payload;
              setDeeds(prev => prev.map(d => d.id === deed.id ? deed : d));

              if (actor) {
                setPlayers(prev => prev.map(p => p.id === actor.id ? actor : p));
                if (currentPlayer?.id === actor.id) {
                  setCurrentPlayer(actor);
                }
              }
              if (voter) {
                setPlayers(prev => prev.map(p => p.id === voter.id ? voter : p));
                if (currentPlayer?.id === voter.id) {
                  setCurrentPlayer(voter);
                }
              }

              if (deed.status === 'VERIFIED') {
                showToast(`⚖️ Jury Verdict: "${deed.title}" has been VERIFIED as Cosmic Truth!`, 'VIRTUE');
              } else if (deed.status === 'CALL_CAP_DISPUTED') {
                showToast(`🧢 Jury Verdict: "${deed.title}" was ruled CAP / False report!`, 'VICE');
              }
              break;
            }

            case 'REACTION_ADDED': {
              const updatedDeed = payload;
              setDeeds(prev => prev.map(d => d.id === updatedDeed.id ? updatedDeed : d));
              break;
            }

            case 'COMMENT_ADDED': {
              const { deedId, comment } = payload;
              setDeeds(prev => prev.map(d => {
                if (d.id === deedId) {
                  return { ...d, comments: [...d.comments, comment] };
                }
                return d;
              }));
              break;
            }

            case 'QUEST_COMPLETED': {
              const { quest, player, deed } = payload;
              setQuests(prev => prev.map(q => q.id === quest.id ? quest : q));
              setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
              setDeeds(prev => [deed, ...prev]);
              if (currentPlayer?.id === player.id) {
                setCurrentPlayer(player);
              }
              showToast(`✨ Quest Cleared: "${quest.title}" (+${quest.karmaReward} Karma)`, 'VIRTUE');
              break;
            }

            case 'PLAYER_JOINED': {
              const newPlayer = payload;
              setPlayers(prev => [...prev.filter(p => p.id !== newPlayer.id), newPlayer]);
              break;
            }
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        setIsWsConnected(false);
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setIsWsConnected(false);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [currentPlayer?.id]);

  const handleSelectPlayer = (player: Player) => {
    setCurrentPlayer(player);
    localStorage.setItem('karma_active_player_id', player.id);
    showToast(`Switched active persona to ${player.displayName}`, 'INFO');
  };

  const handleLoginSuccess = (player: Player, token: string) => {
    setCurrentPlayer(player);
    setAuthToken(token);
    setIsAuthenticated(true);
    setIsGuestMode(false);
    localStorage.removeItem('karma_guest_mode');
    localStorage.setItem('karma_auth_token', token);
    localStorage.setItem('karma_active_player_id', player.id);
    showToast(`✨ Welcome to KarmaKount, ${player.displayName}!`, 'VIRTUE');
  };

  const handleSignOut = () => {
    localStorage.removeItem('karma_auth_token');
    localStorage.removeItem('karma_guest_mode');
    setAuthToken(null);
    setIsAuthenticated(false);
    setIsGuestMode(false);
    showToast('Signed out of soul session.', 'INFO');
  };

  // Submit a new deed
  const handleSubmitDeed = async (deedData: {
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
  }) => {
    const res = await fetch('/api/deeds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deedData),
    });
    if (!res.ok) throw new Error('Failed to post deed');
    const newDeed = await res.json();
    setDeeds(prev => [newDeed, ...prev.filter(d => d.id !== newDeed.id)]);
  };

  // Jury vote on deed
  const handleVote = async (deedId: string, vote: 'VOUCH' | 'CAP') => {
    if (!currentPlayer) return;
    const res = await fetch(`/api/deeds/${deedId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterPlayerId: currentPlayer.id, vote }),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(err.error || 'Vote rejected', 'VICE');
      return;
    }
    const data = await res.json();
    setDeeds(prev => prev.map(d => d.id === deedId ? data.deed : d));
  };

  // React to deed
  const handleReact = async (deedId: string, reactionType: 'blessing' | 'cap' | 'fire') => {
    if (!currentPlayer) return;
    const res = await fetch(`/api/deeds/${deedId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: currentPlayer.id, reactionType }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDeeds(prev => prev.map(d => d.id === deedId ? updated : d));
    }
  };

  // Add witness comment
  const handleAddComment = async (deedId: string, text: string) => {
    if (!currentPlayer) return;
    const res = await fetch(`/api/deeds/${deedId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: currentPlayer.id, text }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setDeeds(prev => prev.map(d => {
        if (d.id === deedId) {
          return { ...d, comments: [...d.comments, newComment] };
        }
        return d;
      }));
    }
  };

  // Complete Quest / Bounty
  const handleCompleteQuest = async (questId: string) => {
    if (!currentPlayer) return;
    const res = await fetch(`/api/quests/${questId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: currentPlayer.id }),
    });
    if (!res.ok) throw new Error('Quest completion failed');
    const data = await res.json();
    setQuests(prev => prev.map(q => q.id === questId ? data.quest : q));
    setCurrentPlayer(data.player);
    setDeeds(prev => [data.deed, ...prev]);
  };

  // Simulate an IRL encounter from another player in the world
  const handleSimulateEncounter = async () => {
    if (!currentPlayer) return;
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate-encounter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPlayerId: currentPlayer.id }),
      });
      if (res.ok) {
        const newDeed = await res.json();
        setDeeds(prev => [newDeed, ...prev]);
      }
    } finally {
      setIsSimulating(false);
    }
  };

  // Quick bless a player
  const handleQuickBless = async (targetPlayerId: string) => {
    if (!currentPlayer) return;
    await handleSubmitDeed({
      polarity: 'VIRTUE',
      category: 'Random Act of Kindness',
      title: `Bestowed a Karmic Blessing upon ${players.find(p => p.id === targetPlayerId)?.displayName}`,
      description: `Bestowed a direct blessing of spiritual goodwill and encouragement during an in-person IRL encounter.`,
      impactTier: 'TRIVIAL',
      actorPlayerId: targetPlayerId,
      targetPlayerId: targetPlayerId,
      reporterPlayerId: currentPlayer.id,
      isSelfReport: false,
      location: currentPlayer.location,
    });
  };

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-cinzel font-bold text-amber-300">Synchronizing Cosmic Ledger...</h2>
        <p className="text-xs text-slate-500 font-mono mt-1">Connecting to IRL game nodes...</p>
      </div>
    );
  }

  // Dedicated Full-Page Login & Register Gateway
  if (!isAuthenticated && !isGuestMode) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={() => {
          setIsGuestMode(true);
          localStorage.setItem('karma_guest_mode', 'true');
          showToast('Browsing Cosmic Ledger as guest spectator', 'INFO');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce">
          <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 ${
            toast.polarity === 'VIRTUE'
              ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
              : toast.polarity === 'VICE'
              ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
              : 'bg-slate-900/90 border-slate-700 text-slate-200'
          }`}>
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              <Bell className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentPlayer={currentPlayer}
        players={players}
        onSelectPlayer={handleSelectPlayer}
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogModal={() => setIsLogModalOpen(true)}
        onOpenSigilModal={() => setIsSigilModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        isAuthenticated={isAuthenticated}
        isWsConnected={isWsConnected}
        soundMuted={soundMuted}
        setSoundMuted={setSoundMuted}
      />

      {/* Main Game Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Player Profile HUD */}
        <PlayerHud
          player={currentPlayer}
          onOpenSigilModal={() => setIsSigilModalOpen(true)}
          onSimulateEncounter={handleSimulateEncounter}
          onOpenAtonement={() => setActiveTab('quests')}
          isSimulating={isSimulating}
        />

        {/* Tab View Content */}
        {activeTab === 'feed' && (
          <CosmicFeed
            deeds={deeds}
            currentPlayer={currentPlayer}
            onVote={handleVote}
            onReact={handleReact}
            onAddComment={handleAddComment}
          />
        )}

        {activeTab === 'court' && (
          <KarmicCourt
            deeds={deeds}
            currentPlayer={currentPlayer}
            onVote={handleVote}
          />
        )}

        {activeTab === 'radar' && (
          <KarmicRadar
            currentPlayer={currentPlayer}
            players={players}
            deeds={deeds}
          />
        )}

        {activeTab === 'quests' && (
          <AtonementSanctuary
            quests={quests}
            currentPlayer={currentPlayer}
            onCompleteQuest={handleCompleteQuest}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            players={players}
            currentPlayer={currentPlayer}
          />
        )}
      </main>

      {/* Modals */}
      <LogDeedModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        currentPlayer={currentPlayer}
        players={players}
        onSubmitDeed={handleSubmitDeed}
      />

      <SigilScannerModal
        isOpen={isSigilModalOpen}
        onClose={() => setIsSigilModalOpen(false)}
        currentPlayer={currentPlayer}
        players={players}
        onQuickBless={handleQuickBless}
        onLogForTarget={(targetPlayer) => {
          setIsLogModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};
export default App;
