import React, { useState } from 'react';
import { Deed, Player, DeedPolarity, DeedStatus } from '../types';
import { 
  Sparkles, Flame, Shield, Check, XCircle, MessageSquare, 
  MapPin, Clock, Filter, Search, ThumbsUp, Send, UserCheck, AlertCircle, Share2, ShieldAlert 
} from 'lucide-react';
import { soundManager } from '../services/sound';
import { moderateContent } from '../services/moderator';
import { HeroBanner } from './HeroBanner';
import confetti from 'canvas-confetti';

interface CosmicFeedProps {
  deeds: Deed[];
  currentPlayer: Player;
  onVote: (deedId: string, vote: 'VOUCH' | 'CAP') => Promise<void>;
  onReact: (deedId: string, reaction: 'blessing' | 'cap' | 'fire') => Promise<void>;
  onAddComment: (deedId: string, text: string) => Promise<void>;
  onOpenShare?: (data: { title: string; text: string; polarity?: 'VIRTUE' | 'VICE' | 'NEUTRAL'; badgeText?: string }) => void;
  onOpenLogModal?: () => void;
  onOpenHowItWorks?: () => void;
  onOpenTokenomics?: () => void;
  isAuthenticated?: boolean;
  onRequireAuth?: (action?: string) => void;
}

export const CosmicFeed: React.FC<CosmicFeedProps> = ({
  deeds,
  currentPlayer,
  onVote,
  onReact,
  onAddComment,
  onOpenShare,
  onOpenLogModal,
  onOpenHowItWorks,
  onOpenTokenomics,
  isAuthenticated = false,
  onRequireAuth,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'VIRTUE' | 'VICE' | 'PENDING' | 'NEAR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>({});
  const [votingMap, setVotingMap] = useState<Record<string, boolean>>({});

  const filteredDeeds = deeds.filter((deed) => {
    // Filter type
    if (filter === 'VIRTUE' && deed.polarity !== 'VIRTUE') return false;
    if (filter === 'VICE' && deed.polarity !== 'VICE') return false;
    if (filter === 'PENDING' && deed.status !== 'PENDING_JURY') return false;
    if (filter === 'NEAR' && (deed.location.distanceMeters || 9999) > 1000) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        deed.title.toLowerCase().includes(q) ||
        deed.description.toLowerCase().includes(q) ||
        deed.actorPlayerName.toLowerCase().includes(q) ||
        deed.category.toLowerCase().includes(q) ||
        deed.location.name.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const toggleComments = (deedId: string) => {
    setOpenComments(prev => ({ ...prev, [deedId]: !prev[deedId] }));
  };

  const handleCastVote = async (deedId: string, vote: 'VOUCH' | 'CAP') => {
    if (!isAuthenticated && onRequireAuth) {
      onRequireAuth('Cast Peer Jury Vote');
      return;
    }
    setVotingMap(prev => ({ ...prev, [deedId]: true }));
    try {
      await onVote(deedId, vote);
      soundManager.playGavelStrike();
      if (vote === 'VOUCH') {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.7 }
        });
      }
    } finally {
      setVotingMap(prev => ({ ...prev, [deedId]: false }));
    }
  };

  const handleSendComment = async (deedId: string) => {
    if (!isAuthenticated && onRequireAuth) {
      onRequireAuth('Post a Witness Comment');
      return;
    }
    const text = commentInputs[deedId]?.trim();
    if (!text) return;

    // Client-side Auto-Mod check
    const modResult = moderateContent(text);
    if (!modResult.isValid) {
      soundManager.playViceRumble();
      setCommentErrors(prev => ({ 
        ...prev, 
        [deedId]: modResult.reason || 'Blocked by Auto-Mod. Please adhere to PG-13 community rules.' 
      }));
      setTimeout(() => {
        setCommentErrors(prev => {
          const next = { ...prev };
          delete next[deedId];
          return next;
        });
      }, 5500);
      return;
    }

    setCommentErrors(prev => {
      const next = { ...prev };
      delete next[deedId];
      return next;
    });

    await onAddComment(deedId, text);
    setCommentInputs(prev => ({ ...prev, [deedId]: '' }));
  };

  const formatTimeAgo = (isoString: string) => {
    const ms = Date.now() - new Date(isoString).getTime();
    const mins = Math.max(1, Math.floor(ms / (1000 * 60)));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Hero Explainer Banner */}
      {onOpenLogModal && onOpenHowItWorks && onOpenTokenomics && (
        <HeroBanner
          onOpenLogModal={onOpenLogModal}
          onOpenHowItWorks={onOpenHowItWorks}
          onOpenTokenomics={onOpenTokenomics}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* Controls Bar: Search & Category Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deed narrative, player handle, or city sector..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              filter === 'ALL'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Deeds ({deeds.length})
          </button>
          <button
            onClick={() => setFilter('VIRTUE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              filter === 'VIRTUE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Virtues</span>
          </button>
          <button
            onClick={() => setFilter('VICE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              filter === 'VICE'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Vices</span>
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              filter === 'PENDING'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>Jury Duty</span>
          </button>
          <button
            onClick={() => setFilter('NEAR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1 ${
              filter === 'NEAR'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Near Me</span>
          </button>
        </div>
      </div>

      {/* Deed Cards Feed */}
      {filteredDeeds.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-400 mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <p className="font-semibold text-sm text-slate-300">No deeds match this criteria</p>
          <p className="text-xs text-slate-500 mt-1">Try switching filters or log a new real-world action!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeeds.map((deed) => {
            const isVirtue = deed.polarity === 'VIRTUE';
            const userVote = deed.juryVotes.voters[currentPlayer.id];
            const isOwnDeed = deed.actorPlayerId === currentPlayer.id;
            const commentsOpen = openComments[deed.id];

            return (
              <div
                key={deed.id}
                className={`group relative overflow-hidden rounded-3xl transition-all duration-300 bg-slate-900/80 border p-5 sm:p-6 shadow-xl backdrop-blur-md ${
                  isVirtue
                    ? 'border-rose-500/20 hover:border-rose-500/40 hover:shadow-rose-500/5'
                    : 'border-slate-800 hover:border-rose-500/30'
                }`}
              >
                {/* Subtle side glow stripe */}
                <div 
                  className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    isVirtue ? 'bg-gradient-to-b from-rose-400 to-amber-400' : 'bg-slate-600'
                  }`} 
                />

                {/* Header Row: Actor, Time, Polarity Badge & Karma Value */}
                <div className="flex items-start justify-between gap-4">
                  {/* Actor details */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow">
                      {deed.actorAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">
                          {deed.actorPlayerName}
                        </span>
                        {deed.isSelfReport ? (
                          <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">
                            Self-Log
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-700/50 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-indigo-400" />
                            <span>Witnessed by {deed.reporterPlayerName.split(' ')[0]}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formatTimeAgo(deed.createdAt)}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{deed.location.name}</span>
                          {deed.location.distanceMeters && (
                            <span className="text-slate-500 font-mono">({deed.location.distanceMeters}m away)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Karma Points & Status */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className={`text-lg font-black font-mono tracking-tight ${
                          isVirtue ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {deed.karmaValue > 0 ? `+${deed.karmaValue}` : deed.karmaValue}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Karma</span>
                    </div>

                    {/* Status Pill */}
                    <div className="mt-1">
                      {deed.status === 'VERIFIED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-600/50 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> VERIFIED TRUTH
                        </span>
                      )}
                      {deed.status === 'PENDING_JURY' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-600/50 px-2 py-0.5 rounded-full animate-pulse">
                          <Shield className="w-3 h-3" /> JURY REVIEW ({deed.juryVotes.vouches}/2 VOUCHES)
                        </span>
                      )}
                      {deed.status === 'CALL_CAP_DISPUTED' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-300 bg-rose-950/60 border border-rose-600/40 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" /> Disputed by Community
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Deed Content */}
                <div className="mt-3.5 pl-3 border-l-2 border-rose-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold uppercase text-rose-300/80">
                      [{deed.category}]
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/50">
                      Tier: {deed.impactTier}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-rose-200 transition">
                    {deed.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {deed.description}
                  </p>
                </div>

                {/* Jury Voting Panel (Peer Review Mechanism) */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  {/* Left: Jury consensus actions */}
                  <div className="flex items-center gap-2">
                    {deed.status === 'PENDING_JURY' && (
                      <>
                        {isOwnDeed ? (
                          <div className="text-[11px] font-mono text-amber-300/90 italic flex items-center gap-1 bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-500/20">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Awaiting peer verification</span>
                          </div>
                        ) : userVote ? (
                          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                            <span>Your Vote:</span>
                            <strong className={userVote === 'VOUCH' ? 'text-emerald-400' : 'text-rose-400'}>
                              {userVote === 'VOUCH' ? 'Vouched (True)' : 'Called Cap'}
                            </strong>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleCastVote(deed.id, 'VOUCH')}
                              disabled={votingMap[deed.id]}
                              className="px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-600/50 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                              title="Vouch that this deed happened (+15 XP)"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Vouch</span>
                              <span className="text-[10px] font-mono bg-emerald-900/60 px-1.5 py-0.2 rounded-full">
                                {deed.juryVotes.vouches}
                              </span>
                            </button>

                            <button
                              onClick={() => handleCastVote(deed.id, 'CAP')}
                              disabled={votingMap[deed.id]}
                              className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900/90 text-rose-300 border border-rose-600/50 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                              title="Doubt or report false claim"
                            >
                              <span>🧢</span>
                              <span>Doubt</span>
                              <span className="text-[10px] font-mono bg-rose-900/60 px-1.5 py-0.2 rounded-full">
                                {deed.juryVotes.caps}
                              </span>
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {deed.status !== 'PENDING_JURY' && (
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-full border border-slate-800/60">
                        <span className="text-emerald-400 font-bold">{deed.juryVotes.vouches} Vouches</span>
                        <span>•</span>
                        <span className="text-rose-400 font-bold">{deed.juryVotes.caps} Caps</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Quick Reactions & Comment toggle */}
                  <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                    <button
                      onClick={() => onReact(deed.id, 'blessing')}
                      className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-rose-950/40 rounded-full border border-slate-800 hover:border-rose-500/40 text-xs text-slate-300 transition-all flex items-center gap-1 active:scale-95"
                      title="Send Love & Kudos"
                    >
                      <span className="text-sm">💖</span>
                      <span className="font-mono text-[11px] font-bold text-rose-300">
                        {deed.reactions.blessings}
                      </span>
                    </button>

                    <button
                      onClick={() => onReact(deed.id, 'cap')}
                      className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-indigo-950/40 rounded-full border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 transition-all flex items-center gap-1 active:scale-95"
                      title="Cap Alert"
                    >
                      <span className="text-sm">🧢</span>
                      <span className="font-mono text-[11px] font-bold text-indigo-300">
                        {deed.reactions.caps}
                      </span>
                    </button>

                    <button
                      onClick={() => onReact(deed.id, 'fire')}
                      className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-amber-950/40 rounded-full border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 transition-all flex items-center gap-1 active:scale-95"
                      title="Inspiring / Awesome"
                    >
                      <span className="text-sm">✨</span>
                      <span className="font-mono text-[11px] font-bold text-amber-300">
                        {deed.reactions.fires}
                      </span>
                    </button>

                    <button
                      onClick={() => toggleComments(deed.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
                        commentsOpen 
                          ? 'bg-rose-500/20 text-rose-200 border-rose-500/50 shadow-sm shadow-rose-500/20' 
                          : 'bg-slate-950/80 hover:bg-slate-800 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                      title="Kind Notes & Comments"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{deed.comments.length}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenShare) {
                          onOpenShare({
                            title: deed.title,
                            text: `💖 [KarmaKount IRL] ${deed.polarity === 'VIRTUE' ? '✨ Good Deed' : '⚠️ Vice'} Logged: "${deed.title}" by ${deed.actorPlayerName} (${deed.karmaValue > 0 ? `+${deed.karmaValue}` : deed.karmaValue} Karma)!`,
                            polarity: deed.polarity,
                            badgeText: `${deed.karmaValue > 0 ? `+${deed.karmaValue}` : deed.karmaValue} Karma`,
                          });
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-950/80 hover:bg-rose-950/30 rounded-full border border-slate-800 hover:border-rose-500/40 text-xs text-slate-400 hover:text-rose-300 transition-all flex items-center gap-1.5 active:scale-95"
                      title="Share to socials"
                    >
                      <Share2 className="w-3.5 h-3.5 text-rose-400" />
                      <span className="hidden sm:inline font-bold text-[11px]">Share</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Witness Testimonials & Comments */}
                {commentsOpen && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3 bg-slate-950/40 p-3 rounded-2xl">
                    <div className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-bold">
                      Kind Notes & Comments ({deed.comments.length})
                    </div>

                    {deed.comments.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No witness testimonies yet. Be the first to corroborate!</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {deed.comments.map((comment) => (
                          <div key={comment.id} className="text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/60">
                            <div className="flex items-center justify-between text-slate-400 mb-1">
                              <span className="font-bold text-amber-300 flex items-center gap-1">
                                <span>{comment.playerAvatar}</span>
                                <span>{comment.playerName}</span>
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {formatTimeAgo(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-slate-200">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Auto-Mod Comment Alert Banner */}
                    {commentErrors[deed.id] && (
                      <div className="bg-rose-950/80 border border-rose-500/50 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-rose-200 animate-pulse">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="font-mono">{commentErrors[deed.id]}</span>
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add your testimony or eyewitness report..."
                        value={commentInputs[deed.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [deed.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendComment(deed.id)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleSendComment(deed.id)}
                        className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition font-bold"
                        title="Submit testimony"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
