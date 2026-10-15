import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles, Flame, ExternalLink } from 'lucide-react';
import { soundManager } from '../services/sound';
import confetti from 'canvas-confetti';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text: string;
  url?: string;
  badgeText?: string;
  polarity?: 'VIRTUE' | 'VICE' | 'NEUTRAL';
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  text,
  url = 'https://karmakount.com',
  badgeText,
  polarity = 'NEUTRAL',
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedInsta, setCopiedInsta] = useState(false);

  if (!isOpen) return null;

  const fullShareText = `${text}\n\nTrack real-world deeds on KarmaKount: ${url} #KarmaKount #IRLGame #Karma`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    soundManager.playVirtueChime();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyInstagram = () => {
    navigator.clipboard.writeText(fullShareText);
    setCopiedInsta(true);
    soundManager.playVirtueChime();
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setCopiedInsta(false), 3000);
    // Open Instagram in new tab
    window.open('https://instagram.com', '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: fullShareText,
          url,
        });
        soundManager.playVirtueChime();
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  // Pre-formatted intent URLs
  const shareLinks = [
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      bgColor: 'bg-black hover:bg-neutral-900 border-neutral-700 text-white',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=KarmaKount,IRLGame,Karma`,
    },
    {
      name: 'Threads',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.004 0C5.373 0 0 5.373 0 12s5.373 12 12.004 12C18.627 24 24 18.627 24 12S18.627 0 12.004 0zm4.843 14.15c-.244 2.308-1.745 3.906-4.004 3.906-2.585 0-4.484-1.922-4.484-4.708 0-2.825 2.015-4.834 4.793-4.834 2.247 0 3.868 1.34 4.137 3.327h-1.637c-.24-1.163-1.254-1.89-2.5-1.89-1.848 0-3.13 1.385-3.13 3.397 0 1.99 1.25 3.332 3.016 3.332 1.314 0 2.22-.767 2.39-1.907h-2.39v-1.423h4.004v2.801z"/>
        </svg>
      ),
      bgColor: 'bg-neutral-900 hover:bg-black border-neutral-700 text-white',
      url: `https://www.threads.net/intent/post?text=${encodeURIComponent(fullShareText)}`,
    },
    {
      name: 'Bluesky',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566 1.01 0 1.868 0 5.097c0 3.228 1.246 8.528 5.485 10.865-3.32-.472-5.485-2.094-5.485-4.483 0-2.39 1.854-4.52 4.195-5.228 2.073-.628 4.298-.444 6.305.65C12.5 7.55 12 9.5 12 10.8zm0 0c1.087-2.114 4.046-6.053 6.798-7.995C21.434 1.01 24 1.868 24 5.097c0 3.228-1.246 8.528-5.485 10.865 3.32-.472 5.485-2.094 5.485-4.483 0-2.39-1.854-4.52-4.195-5.228-2.073-.628-4.298-.444-6.305.65C11.5 7.55 12 9.5 12 10.8z"/>
        </svg>
      ),
      bgColor: 'bg-sky-600 hover:bg-sky-500 border-sky-400 text-white',
      url: `https://bsky.app/intent/compose?text=${encodeURIComponent(fullShareText)}`,
    },
    {
      name: 'Reddit',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
        </svg>
      ),
      bgColor: 'bg-orange-600 hover:bg-orange-500 border-orange-400 text-white',
      url: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    },
    {
      name: 'Facebook',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      bgColor: 'bg-blue-600 hover:bg-blue-500 border-blue-400 text-white',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.476-.15-.677.15-.2.3-.776.978-.952 1.178-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.783-1.675-2.083-.176-.301-.019-.464.131-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.63-.927-2.233-.243-.587-.49-.508-.677-.517-.175-.01-.376-.01-.577-.01-.2 0-.526.075-.802.376-.275.301-1.052 1.028-1.052 2.507 0 1.48 1.077 2.908 1.228 3.109.15.2 2.12 3.237 5.136 4.54.717.31 1.277.495 1.713.633.72.229 1.376.197 1.895.12.578-.087 1.78-.727 2.03-1.43.251-.703.251-1.305.176-1.43-.075-.125-.276-.2-.577-.35z"/>
          <path d="M12.004 0C5.373 0 0 5.373 0 12a11.96 11.96 0 0 0 2.04 6.72L.05 24l5.44-1.99A11.95 11.95 0 0 0 12.004 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zm0 21.84a9.81 9.81 0 0 1-5.002-1.373l-.36-.213-3.714 1.36 1.386-3.62-.234-.372A9.82 9.82 0 1 1 12.004 21.84z"/>
        </svg>
      ),
      bgColor: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`,
    },
    {
      name: 'Telegram',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.945z"/>
        </svg>
      ),
      bgColor: 'bg-sky-500 hover:bg-sky-400 border-sky-300 text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    },
  ];

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
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Cosmic Broadcast
            </span>
          </div>
          <h2 className="text-2xl font-black font-cinzel text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-amber-400" />
            Share to Socials
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Broadcast this deed or player standing to X, Threads, Bluesky, Reddit, and your community.
          </p>
        </div>

        {/* Live Preview Card */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 mb-5 shadow-inner">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1 font-bold text-slate-300">
              {polarity === 'VIRTUE' ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              ) : polarity === 'VICE' ? (
                <Flame className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              )}
              Preview
            </span>
            {badgeText && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                polarity === 'VIRTUE' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans line-clamp-3">
            "{text}"
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>karmakount.com</span>
            <span>#KarmaKount</span>
          </div>
        </div>

        {/* Grid of Social Share Buttons */}
        <div className="mb-5">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
            Select Platform
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {shareLinks.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  soundManager.playVirtueChime();
                  confetti({ particleCount: 20, spread: 40 });
                }}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition shadow-sm hover:scale-[1.02] active:scale-95 ${p.bgColor}`}
              >
                {p.icon}
                <span className="truncate">{p.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Special Instagram Story / Post Helper */}
        <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-rose-950/30 to-amber-950/30 border border-purple-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Instagram Story / Post</div>
              <div className="text-[10px] text-slate-400">Copy pre-formatted bio/story caption & open app</div>
            </div>
          </div>

          <button
            onClick={handleCopyInstagram}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow"
          >
            {copiedInsta ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedInsta ? 'Copied!' : 'Copy & Open'}</span>
          </button>
        </div>

        {/* Copy Direct Link or Native Share */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={`${text} ${url}`}
              className="bg-transparent text-xs text-slate-300 font-mono flex-1 outline-none truncate px-1"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Mobile Share Sheet (iOS / Android)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
