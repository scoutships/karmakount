export type DeedPolarity = 'VIRTUE' | 'VICE';

export type ImpactTier = 'TRIVIAL' | 'NOTABLE' | 'MAJOR' | 'MYTHIC';

export type DeedStatus = 'PENDING_JURY' | 'VERIFIED' | 'CALL_CAP_DISPUTED' | 'PARDONED';

export type Alignment = 
  | 'CELESTIAL_ASCENDANT' // +1000 and above
  | 'VIRTUOUS_GUARDIAN'   // +250 to +999
  | 'MORTAL_DRIFTER'      // -99 to +249
  | 'ROGUE_TRICKSTER'     // -500 to -100
  | 'INFERNAL_TITAN';     // below -500

export type Faction = 'LUMEN' | 'CHAOS' | 'EQUILIBRIUM';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: string;
}

export interface Player {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  karmaScore: number;
  alignment: Alignment;
  title: string;
  faction: Faction;
  level: number;
  exp: number;
  vicesLogged: number;
  virtuesLogged: number;
  deedsWitnessed: number;
  juryAccuracy: number;
  badges: Badge[];
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  email?: string;
  qrPayload: string;
  isOnline: boolean;
  avatarColor: string;
}

export interface AuthResponse {
  token: string;
  player: Player;
}

export interface DeedComment {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  text: string;
  timestamp: string;
}

export interface Deed {
  id: string;
  createdAt: string;
  polarity: DeedPolarity;
  category: string;
  title: string;
  description: string;
  impactTier: ImpactTier;
  karmaValue: number;
  actorPlayerId: string;
  actorPlayerName: string;
  actorAvatar: string;
  targetPlayerId?: string | null;
  targetPlayerName?: string | null;
  reporterPlayerId: string;
  reporterPlayerName: string;
  isSelfReport: boolean;
  proofImage?: string | null;
  location: {
    name: string;
    lat: number;
    lng: number;
    distanceMeters?: number;
  };
  status: DeedStatus;
  juryVotes: {
    vouches: number;
    caps: number;
    voters: Record<string, 'VOUCH' | 'CAP'>;
  };
  reactions: {
    blessings: number;
    caps: number;
    fires: number;
    userReactions: Record<string, string>;
  };
  comments: DeedComment[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'COMMUNITY_BOUNTY' | 'DAILY_DISCIPLINE' | 'ATONEMENT_RITUAL';
  karmaReward: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HEROIC';
  expiresAt: string;
  completedBy: string[];
  icon: string;
  locationHint?: string;
}

export interface KarmicStats {
  totalKarmaInCirculation: number;
  totalVirtuesLogged: number;
  totalVicesLogged: number;
  activePlayersToday: number;
  globalPurityPercent: number;
}
