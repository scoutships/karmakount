import React, { useState, useEffect } from 'react';
import { Player, FaucetClaim, FaucetNetwork } from '../types';
import { 
  X, Droplets, Sparkles, Flame, Shield, ArrowUpRight, Copy, Check, 
  ExternalLink, Clock, Wallet, CheckCircle2, AlertTriangle, Zap, Share2
} from 'lucide-react';
import { soundManager } from '../services/sound';
import confetti from 'canvas-confetti';

interface CryptoFaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player | null;
  onOpenShare?: (data: { title: string; text: string; polarity?: 'VIRTUE' | 'VICE' | 'NEUTRAL'; badgeText?: string }) => void;
}

interface NetworkConfig {
  id: FaucetNetwork;
  name: string;
  symbol: string;
  icon: string;
  explorerBaseUrl: string;
  badgeColor: string;
  rpcType: 'EVM' | 'SOLANA';
}

const NETWORKS: NetworkConfig[] = [
  {
    id: 'BASE_SEPOLIA',
    name: 'Base Sepolia',
    symbol: '$KARMA',
    icon: '🔵',
    explorerBaseUrl: 'https://sepolia.basescan.org/tx/',
    badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-950/40',
    rpcType: 'EVM'
  },
  {
    id: 'POLYGON_AMOY',
    name: 'Polygon Amoy',
    symbol: '$KARMA',
    icon: '💜',
    explorerBaseUrl: 'https://amoy.polygonscan.com/tx/',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-950/40',
    rpcType: 'EVM'
  },
  {
    id: 'ARBITRUM_SEPOLIA',
    name: 'Arbitrum Sepolia',
    symbol: '$KARMA',
    icon: '🔷',
    explorerBaseUrl: 'https://sepolia.arbiscan.io/tx/',
    badgeColor: 'border-sky-500/40 text-sky-300 bg-sky-950/40',
    rpcType: 'EVM'
  },
  {
    id: 'SOLANA_DEVNET',
    name: 'Solana Devnet',
    symbol: '$KARMA',
    icon: '🟣',
    explorerBaseUrl: 'https://explorer.solana.com/tx/?cluster=devnet',
    badgeColor: 'border-teal-500/40 text-teal-300 bg-teal-950/40',
    rpcType: 'SOLANA'
  },
  {
    id: 'KARMA_CHAIN',
    name: 'Karma Chain L2',
    symbol: '$KARMA',
    icon: '⚡',
    explorerBaseUrl: 'https://karmakount.com/explorer/tx/',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
    rpcType: 'EVM'
  }
];

export const CryptoFaucetModal: React.FC<CryptoFaucetModalProps> = ({
  isOpen,
  onClose,
  currentPlayer,
  onOpenShare,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<FaucetNetwork>('BASE_SEPOLIA');
  const [recipientAddress, setRecipientAddress] = useState<string>(() => {
    return localStorage.getItem('karma_saved_wallet') || 
           currentPlayer?.walletAddress || 
           (currentPlayer ? `0x${currentPlayer.id.replace(/[^a-f0-9]/gi, '')}9bF390c5e3a8d4E` : '');
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [isDebtLocked, setIsDebtLocked] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [totalClaimable, setTotalClaimable] = useState<number>(25);
  const [recentClaims, setRecentClaims] = useState<FaucetClaim[]>([]);
  const [latestReceipt, setLatestReceipt] = useState<FaucetClaim | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch status on open
  useEffect(() => {
    if (!isOpen || !currentPlayer) return;

    const fetchStatus = async () => {
      setStatusLoading(true);
      try {
        const res = await fetch(`/api/faucet/status/${currentPlayer.id}`);
        if (res.ok) {
          const data = await res.json();
          setCooldownRemaining(data.cooldownSecondsRemaining);
          setIsDebtLocked(data.isDebtLocked);
          setMultiplier(data.multiplier);
          setTotalClaimable(data.totalClaimable);
          setRecentClaims(data.recentClaims || []);
          if (data.walletAddress && !recipientAddress) {
            setRecipientAddress(data.walletAddress);
          }
        }
      } catch (err) {
        console.error('Failed to load faucet status:', err);
      } finally {
        setStatusLoading(false);
      }
    };

    fetchStatus();
  }, [isOpen, currentPlayer?.id]);

  // Live countdown timer for cooldown
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  if (!isOpen || !currentPlayer) return null;

  const currentNetworkConfig = NETWORKS.find(n => n.id === selectedNetwork) || NETWORKS[0];

  const formatCountdown = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const handleClaim = async () => {
    if (cooldownRemaining > 0 || isDebtLocked || claimLoading) return;
    setClaimLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/faucet/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayer.id,
          walletAddress: recipientAddress.trim(),
          network: selectedNetwork
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim tokens from faucet');
      }

      setLatestReceipt(data.claim);
      setRecentClaims(prev => [data.claim, ...prev.slice(0, 14)]);
      setCooldownRemaining(12 * 60 * 60); // 12h
      localStorage.setItem('karma_saved_wallet', recipientAddress.trim());

      soundManager.playAscensionFanfare();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#f59e0b', '#8b5cf6', '#10b981']
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Faucet claim failed. Please try again.');
      soundManager.playViceRumble();
    } finally {
      setClaimLoading(false);
    }
  };

  const handleCopyTx = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    setCopiedTx(true);
    soundManager.playVirtueChime();
    setTimeout(() => setCopiedTx(false), 2000);
  };

  const handleCopyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    soundManager.playVirtueChime();
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleAutoFillMetaMask = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setRecipientAddress(accounts[0]);
          localStorage.setItem('karma_saved_wallet', accounts[0]);
          soundManager.playVirtueChime();
        }
      } catch (err) {
        console.error('MetaMask connection failed:', err);
      }
    } else {
      setErrorMsg('No Web3 wallet browser extension detected. Using built-in Soul Vault address.');
    }
  };

  const handleUseSoulVault = () => {
    const soulAddress = `0x${currentPlayer.id.replace(/[^a-f0-9]/gi, '')}9bF390c5e3a8d4E`;
    setRecipientAddress(soulAddress);
    localStorage.setItem('karma_saved_wallet', soulAddress);
    soundManager.playVirtueChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400 animate-bounce" />
              <span>Cosmic Web3 Faucet</span>
            </span>
            <span className="text-[10px] uppercase font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Zero-Gas Sponsored</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-white tracking-wide flex items-center gap-2">
            <span>$KARMA Token Dispenser</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Claim free testnet $KARMA crypto tokens to corroborate IRL deeds, sponsor bounties, and stake on jury trials.
          </p>
        </div>

        {/* Karmic Tier Multiplier Card */}
        <div className="mb-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-inner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl select-none">
              {currentPlayer.avatar}
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400">
                Arbiter Standing: <strong className="text-amber-300">{currentPlayer.alignment.replace(/_/g, ' ')}</strong>
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                <span>Score: {currentPlayer.karmaScore > 0 ? `+${currentPlayer.karmaScore}` : currentPlayer.karmaScore} PTS</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400 font-mono text-xs">{multiplier}x Drip Multiplier</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Claimable</span>
            <span className="text-xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-300">
              {totalClaimable} $KARMA
            </span>
          </div>
        </div>

        {/* Network Selection */}
        <div className="mb-5">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
            Target Blockchain Network
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {NETWORKS.map((net) => (
              <button
                key={net.id}
                type="button"
                onClick={() => setSelectedNetwork(net.id)}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                  selectedNetwork === net.id
                    ? `${net.badgeColor} ring-1 ring-cyan-400/50 shadow-md`
                    : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-lg">{net.icon}</span>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold truncate text-slate-200">{net.name}</div>
                  <div className="text-[10px] font-mono text-slate-500">{net.rpcType} Token</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Wallet Address Input & Presets */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Recipient Wallet Address
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUseSoulVault}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline"
              >
                Use Soul Vault
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={handleAutoFillMetaMask}
                className="text-[10px] font-mono text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
              >
                <Wallet className="w-3 h-3" /> Connect Web3
              </button>
            </div>
          </div>

          <div className="relative">
            <Wallet className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x... or Solana public key"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-20 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
            {recipientAddress && (
              <button
                type="button"
                onClick={() => handleCopyAddress(recipientAddress)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
                title="Copy Address"
              >
                {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Transaction Receipt Card */}
        {latestReceipt && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Tokens Dispensed Successfully! (+{latestReceipt.amount} {latestReceipt.tokenSymbol})</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80">Confirmed On-Chain</span>
            </div>

            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-emerald-900/50 font-mono text-[11px] text-slate-300 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="text-slate-500 mr-2">Tx Hash:</span>
                <span className="text-emerald-400">{latestReceipt.txHash}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyTx(latestReceipt.txHash)}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copy Transaction Hash"
                >
                  {copiedTx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <a
                  href={`${currentNetworkConfig.explorerBaseUrl}${latestReceipt.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 text-slate-400 hover:text-emerald-400"
                  title="View on Block Explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {onOpenShare && (
              <button
                type="button"
                onClick={() => {
                  onOpenShare({
                    title: `Claimed ${latestReceipt.amount} $KARMA on ${currentNetworkConfig.name}`,
                    text: `🚰 Just claimed ${latestReceipt.amount} $KARMA crypto tokens from the KarmaKount Cosmic Faucet! Track real-world deeds and earn on-chain $KARMA at https://karmakount.com #Web3 #KarmaKount #Crypto`,
                    polarity: 'VIRTUE',
                    badgeText: `+${latestReceipt.amount} $KARMA`
                  });
                }}
                className="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Token Claim to X, Threads, Bluesky ➔</span>
              </button>
            )}
          </div>
        )}

        {/* Claim Action Button */}
        <div className="mb-6">
          {isDebtLocked ? (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-center text-xs text-rose-300">
              <Flame className="w-4 h-4 text-rose-400 inline mr-1.5 mb-0.5" />
              <strong>Faucet Locked by Karmic Debt:</strong> Complete an Atonement Bounty to restore standing and unlock crypto faucet drips.
            </div>
          ) : cooldownRemaining > 0 ? (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Cooldown Active: Next drop ready in <strong className="text-amber-300">{formatCountdown(cooldownRemaining)}</strong></span>
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClaim}
              disabled={claimLoading || !recipientAddress.trim()}
              className="w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition shadow-2xl active:scale-[0.98] flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-slate-950 shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Droplets className={`w-4 h-4 ${claimLoading ? 'animate-bounce' : ''}`} />
              <span>{claimLoading ? 'Mining Block on Chain...' : `Dispense ${totalClaimable} $KARMA Tokens`}</span>
            </button>
          )}
        </div>

        {/* Community Live Claims Feed */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono uppercase text-slate-400 mb-2.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Global Faucet Activity</span>
            </span>
            <span className="text-[10px] text-slate-500">Real-Time Drips</span>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {recentClaims.map((claim) => (
              <div
                key={claim.id}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 flex items-center justify-between text-xs text-slate-300"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{claim.playerAvatar}</span>
                  <div className="truncate">
                    <span className="font-bold text-white mr-1.5">{claim.playerDisplayName}</span>
                    <span className="text-[10px] font-mono text-slate-500 truncate">{claim.recipientAddress.slice(0, 6)}...{claim.recipientAddress.slice(-4)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-bold">
                    +{claim.amount} {claim.tokenSymbol}
                  </span>
                  <a
                    href={`${NETWORKS.find(n => n.id === claim.network)?.explorerBaseUrl || 'https://sepolia.basescan.org/tx/'}${claim.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-cyan-400"
                    title="View Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CryptoFaucetModal;
