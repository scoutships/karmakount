import React, { useState } from 'react';
import { 
  HelpCircle, ChevronDown, ChevronUp, Sparkles, Shield, Coins, 
  HeartHandshake, Search, ExternalLink, ArrowRight, UserCheck, Flame 
} from 'lucide-react';
import { soundManager } from '../services/sound';

interface FAQItem {
  id: string;
  category: 'basics' | 'gameplay' | 'jury' | 'crypto';
  question: string;
  answer: string | React.ReactNode;
}

interface FAQSectionProps {
  onOpenLogModal: () => void;
  onOpenTokenomics: () => void;
  onOpenAuthModal?: () => void;
  isAuthenticated?: boolean;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  onOpenLogModal,
  onOpenTokenomics,
  onOpenAuthModal,
  isAuthenticated = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'basics' | 'gameplay' | 'jury' | 'crypto'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'what-is-it': true,
    'do-i-need-signup': true,
    'is-it-real-money': true,
  });

  const toggleItem = (id: string) => {
    soundManager.playVirtueChime();
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    faqData.forEach(item => { allIds[item.id] = true; });
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  const CONTRACT_ADDRESS = '0x86B544dE599644F616B722738b5702692C12dC6D';
  const PAIR_ADDRESS = '0x26488Ef547cB8C7442a349e47f8f5a346a4F29bc';
  const DEXSCREENER_URL = `https://dexscreener.com/base/${PAIR_ADDRESS}`;
  const UNISWAP_URL = `https://app.uniswap.org/swap?chain=base&outputCurrency=${CONTRACT_ADDRESS}`;
  const BASESCAN_URL = `https://basescan.org/token/${CONTRACT_ADDRESS}`;

  const faqData: FAQItem[] = [
    // --- BASICS ---
    {
      id: 'what-is-it',
      category: 'basics',
      question: 'What is KarmaKount, and what is it for?',
      answer: (
        <div className="space-y-2">
          <p>
            <strong>KarmaKount</strong> is the world's first Massively Multiplayer IRL (In Real Life) Game of Good Deeds.
          </p>
          <p>
            Instead of spending hours playing games where achievements stay locked inside a screen, KarmaKount rewards you for doing <strong>real-world positive actions</strong>—like helping an elderly neighbor, cleaning up a park, donating to a food drive, or returning a lost pet.
          </p>
          <p>
            Your deeds are logged to a public community feed, verified by a peer jury, and rewarded with Karma Points, rank progression, and real on-chain <strong>$KARMA crypto tokens</strong> deployed on Base.
          </p>
        </div>
      ),
    },
    {
      id: 'do-i-need-signup',
      category: 'basics',
      question: 'Do I have to sign up or create an account just to browse?',
      answer: (
        <div className="space-y-2">
          <p>
            <strong>No!</strong> KarmaKount is 100% open to browse. You can explore the live feed, check the global leaderboard, read verified stories, and view the live market charts without signing up.
          </p>
          <p>
            You only need to create an account (which takes 10 seconds with just a username and password) when you want to <strong>post your own deeds</strong>, <strong>vote on the peer jury</strong>, or <strong>claim $KARMA rewards</strong>.
          </p>
        </div>
      ),
    },
    {
      id: 'is-it-free',
      category: 'basics',
      question: 'Is KarmaKount free to play?',
      answer: (
        <p>
          <strong>Yes, completely 100% free.</strong> There are no paywalls, no subscriptions, and no hidden fees. Anyone in the world can join, log good deeds, and earn rewards without spending a penny.
        </p>
      ),
    },
    {
      id: 'what-deeds-count',
      category: 'basics',
      question: 'What kind of good deeds can I post?',
      answer: (
        <div className="space-y-2">
          <p>Any positive act that improves someone’s life, your community, or the environment qualifies! Popular examples include:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>🌱 <strong>Environmental:</strong> Picking up trash, planting trees, beach cleanups, recycling.</li>
            <li>🤝 <strong>Community & Kindness:</strong> Helping a stranded motorist, paying for a stranger’s coffee, returning misplaced shopping carts.</li>
            <li>❤️ <strong>Charity & Giving:</strong> Donating clothes/food, volunteering at an animal shelter, donating blood.</li>
            <li>🛠️ <strong>Helping Others:</strong> Mowing an elderly neighbor's lawn, mentoring a student, holding an elevator.</li>
          </ul>
        </div>
      ),
    },

    // --- GAMEPLAY ---
    {
      id: 'how-to-post-deed',
      category: 'gameplay',
      question: 'How do I post a deed and earn points?',
      answer: (
        <div className="space-y-2">
          <p>It takes less than 30 seconds:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Click the gold <strong>"+ Post Deed"</strong> button at the top of the page.</li>
            <li>Pick a category and write a quick 1-2 sentence description of what you did.</li>
            <li>(Optional but recommended) Upload a photo as proof.</li>
            <li>Hit <strong>Submit</strong>! Your deed is immediately broadcast to the live public ledger.</li>
          </ol>
        </div>
      ),
    },
    {
      id: 'karma-points-vs-tokens',
      category: 'gameplay',
      question: 'What is the difference between Karma Points and $KARMA Tokens?',
      answer: (
        <div className="space-y-2">
          <p>
            <strong>Karma Points (PTS):</strong> Your social standing, reputation, and leaderboard score inside the game. The higher your score, the higher your title (e.g. <em>Virtuous Guardian</em>, <em>Archon of Pure Light</em>).
          </p>
          <p>
            <strong>$KARMA Tokens:</strong> Real crypto coins deployed on the Base blockchain (Ethereum Layer 2). You can hold them, trade them for real money (ETH/USDC) on Uniswap, or use them to unlock in-game perks.
          </p>
        </div>
      ),
    },
    {
      id: 'what-is-qr-sigil',
      category: 'gameplay',
      question: 'What is the "IRL QR" button in the menu?',
      answer: (
        <p>
          Each player has a unique <strong>Karmic QR Sigil</strong>. When you meet another KarmaKount player in person at a volunteer event or in public, they can scan your QR code with their phone to verify your in-person deed, give you an instant "Karmic Blessing", or witness your positive impact!
        </p>
      ),
    },

    // --- JURY & RULES ---
    {
      id: 'how-jury-works',
      category: 'jury',
      question: 'How do you prevent cheating, fakes, or spam?',
      answer: (
        <div className="space-y-2">
          <p>
            We use a decentralized <strong>Peer Jury System</strong> (The Karmic Court).
          </p>
          <p>
            When a deed is submitted, it enters the <strong>"Peer Jury"</strong> tab. Other active players review the photo and description and cast a vote:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            <li>🕊️ <strong>Vouch:</strong> The deed is genuine and helpful. Once approved, the submitter receives their full Karma & $KARMA tokens.</li>
            <li>🧢 <strong>Cap (Dispute):</strong> The submission is fake, stolen from the internet, or fraudulent. If confirmed fake, the submitter loses Karma points!</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'can-i-be-a-juror',
      category: 'jury',
      question: 'Can I be a juror and earn rewards for reviewing deeds?',
      answer: (
        <p>
          <strong>Yes!</strong> Any registered player can visit the <strong>"Peer Jury"</strong> tab and review pending deeds. Honest jurors who consistently vote with consensus earn bonus $KARMA tokens and reputation points for keeping the ledger honest.
        </p>
      ),
    },

    // --- CRYPTO & $KARMA ---
    {
      id: 'is-it-real-money',
      category: 'crypto',
      question: 'Is $KARMA a real cryptocurrency with monetary value?',
      answer: (
        <div className="space-y-2">
          <p>
            <strong>Yes!</strong> $KARMA is a verified, live ERC-20 smart contract deployed on <strong>Base Mainnet</strong> (Coinbase's Layer 2 network).
          </p>
          <p>
            It has an active decentralized liquidity pool on <strong>Uniswap v3</strong> paired with Ethereum (WETH). You can view the live price, candlestick charts, and market cap anytime on DexScreener.
          </p>
          <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30 flex flex-wrap items-center gap-3 mt-2 text-xs">
            <span className="font-mono text-amber-300 font-bold">Contract: 0x86B5...dC6D</span>
            <a 
              href={DEXSCREENER_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>DexScreener Chart</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a 
              href={UNISWAP_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-pink-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Trade on Uniswap</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ),
    },
    {
      id: 'do-i-need-wallet',
      category: 'crypto',
      question: 'Do I need a Web3 wallet (Coinbase Wallet / MetaMask) to play?',
      answer: (
        <p>
          <strong>No!</strong> You can play, log deeds, level up, and accumulate $KARMA in your in-game vault without ever touching crypto. When you are ready to cash out or withdraw your tokens to your personal self-custody wallet, you can connect your Coinbase Smart Wallet or MetaMask with 1 click!
        </p>
      ),
    },
    {
      id: 'daily-faucet',
      category: 'crypto',
      question: 'What is the "Faucet" button in the menu?',
      answer: (
        <p>
          The Daily Faucet dispenses <strong>free $KARMA tokens</strong> every 24 hours to registered players from the 200,000,000 community rewards reserve. It’s our way of thanking active arbiters for participating in the ecosystem!
        </p>
      ),
    },
  ];

  const filteredFaqs = faqData.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        item.question.toLowerCase().includes(q) ||
        (typeof item.answer === 'string' && item.answer.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Help Center & Knowledge Base</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Everything you need to know about KarmaKount, logging real-world deeds, community jury verification, and earning real <strong>$KARMA tokens</strong>.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-5 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. 'free', 'money', 'fake', 'wallet', 'points')..."
            className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner font-medium"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              All Questions ({faqData.length})
            </button>
            <button
              onClick={() => setActiveCategory('basics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeCategory === 'basics'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Basics</span>
            </button>
            <button
              onClick={() => setActiveCategory('gameplay')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeCategory === 'gameplay'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gameplay</span>
            </button>
            <button
              onClick={() => setActiveCategory('jury')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeCategory === 'jury'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Peer Jury</span>
            </button>
            <button
              onClick={() => setActiveCategory('crypto')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeCategory === 'crypto'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>$KARMA Token</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={expandAll}
              className="hover:text-amber-400 transition underline"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="hover:text-amber-400 transition underline"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 p-6">
            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-300">No matching questions found</h3>
            <p className="text-xs text-slate-500 mt-1">Try searching for keywords like "money", "free", "fake", or "points".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-amber-400 hover:bg-slate-700 transition"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          filteredFaqs.map((item) => {
            const isExpanded = !!expandedIds[item.id];
            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isExpanded
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 transition"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base select-none shrink-0">
                      {item.category === 'basics' && '🌟'}
                      {item.category === 'gameplay' && '🎮'}
                      {item.category === 'jury' && '⚖️'}
                      {item.category === 'crypto' && '🪙'}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-100 hover:text-amber-300 transition">
                      {item.question}
                    </span>
                  </div>
                  <div className={`p-1 rounded-lg text-slate-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180 text-amber-400' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 animate-fade-in">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Call to Action Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <div>
          <h3 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Ready to join the real-world game?</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            Log your first good deed today, climb the leaderboard, and start earning $KARMA tokens on Base.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
          {!isAuthenticated && onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2.5 rounded-xl border border-indigo-500/50 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <span>Join / Sign In (10s)</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playVirtueChime();
              onOpenLogModal();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <span>+ Post a Deed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
