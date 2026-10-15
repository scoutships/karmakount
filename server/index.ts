import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Deed, Player, Quest, Alignment, KarmicStats } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'karmakount_cosmic_jwt_secret_2026';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to determine alignment based on score
function calculateAlignment(score: number): Alignment {
  if (score >= 1000) return 'CELESTIAL_ASCENDANT';
  if (score >= 250) return 'VIRTUOUS_GUARDIAN';
  if (score >= -99) return 'MORTAL_DRIFTER';
  if (score >= -500) return 'ROGUE_TRICKSTER';
  return 'INFERNAL_TITAN';
}

function calculateTitle(alignment: Alignment): string {
  switch (alignment) {
    case 'CELESTIAL_ASCENDANT': return 'Archon of Pure Light';
    case 'VIRTUOUS_GUARDIAN': return 'Sentinel of Benevolence';
    case 'MORTAL_DRIFTER': return 'Wayfarer of the Threshold';
    case 'ROGUE_TRICKSTER': return 'Harbinger of Mischief';
    case 'INFERNAL_TITAN': return 'Bane of the Cosmic Scales';
  }
}

// In-Memory Database with Rich Initial State
let players: Player[] = [
  {
    id: 'p-1',
    username: '@SaintSophia',
    displayName: 'Sophia Valerius',
    avatar: '🕊️',
    avatarColor: 'from-amber-400 to-yellow-600',
    bio: 'Dedicated to urban reforestation, blood donation, and returning misplaced grocery carts.',
    karmaScore: 1420,
    alignment: 'CELESTIAL_ASCENDANT',
    title: 'Archon of Pure Light',
    faction: 'LUMEN',
    level: 14,
    exp: 420,
    virtuesLogged: 38,
    vicesLogged: 2,
    deedsWitnessed: 89,
    juryAccuracy: 98,
    badges: [
      { id: 'b1', name: 'Halo of Truth', icon: '✨', description: 'Maintained 95%+ jury accuracy over 50 cases', unlockedAt: '2026-09-12' },
      { id: 'b2', name: 'Good Samaritan', icon: '💖', description: 'Logged 25 verified altruistic community acts', unlockedAt: '2026-09-28' },
      { id: 'b3', name: 'Solar Aegis', icon: '☀️', description: 'Achieved +1,000 pure Karma', unlockedAt: '2026-10-04' }
    ],
    location: { name: 'Metro Central District', lat: 37.7749, lng: -122.4194 },
    qrPayload: 'KARMA_USER:p-1:@SaintSophia',
    isOnline: true
  },
  {
    id: 'p-2',
    username: '@ShadowRebel',
    displayName: 'Kaelen Drake',
    avatar: '🦇',
    avatarColor: 'from-rose-600 to-purple-900',
    bio: 'Rules were made to be bent. I test the boundaries so the saints stay humble.',
    karmaScore: -340,
    alignment: 'ROGUE_TRICKSTER',
    title: 'Harbinger of Mischief',
    faction: 'CHAOS',
    level: 8,
    exp: 150,
    virtuesLogged: 5,
    vicesLogged: 22,
    deedsWitnessed: 41,
    juryAccuracy: 76,
    badges: [
      { id: 'b4', name: 'Agent of Chaos', icon: '🃏', description: 'Successfully survived 20 disputed reports', unlockedAt: '2026-10-01' },
      { id: 'b5', name: 'Nightcrawler', icon: '🌑', description: 'Logged 10 mischief deeds after midnight', unlockedAt: '2026-10-09' }
    ],
    location: { name: 'Industrial Arts District', lat: 37.7780, lng: -122.4080 },
    qrPayload: 'KARMA_USER:p-2:@ShadowRebel',
    isOnline: true
  },
  {
    id: 'p-3',
    username: '@ZenTao',
    displayName: 'Master Chen',
    avatar: '☯️',
    avatarColor: 'from-teal-400 to-cyan-700',
    bio: 'Action without attachment. The ledger balances all things in time.',
    karmaScore: 35,
    alignment: 'MORTAL_DRIFTER',
    title: 'Wayfarer of the Threshold',
    faction: 'EQUILIBRIUM',
    level: 11,
    exp: 280,
    virtuesLogged: 16,
    vicesLogged: 15,
    deedsWitnessed: 112,
    juryAccuracy: 95,
    badges: [
      { id: 'b6', name: 'True Neutral', icon: '⚖️', description: 'Kept Karma within ±50 points across 30 days', unlockedAt: '2026-08-30' },
      { id: 'b7', name: 'Supreme Arbiter', icon: '👁️', description: 'Voted on over 100 Karmic Court juries', unlockedAt: '2026-10-11' }
    ],
    location: { name: 'Bayside Promenade', lat: 37.7810, lng: -122.3920 },
    qrPayload: 'KARMA_USER:p-3:@ZenTao',
    isOnline: false
  },
  {
    id: 'p-4',
    username: '@ApexNovice',
    displayName: 'Jordan Walker',
    avatar: '⚡',
    avatarColor: 'from-amber-500 to-emerald-600',
    bio: 'Just downloaded Karma IRL! Trying to atone for stealing my roommate’s artisanal cheese.',
    karmaScore: 110,
    alignment: 'MORTAL_DRIFTER',
    title: 'Wayfarer of the Threshold',
    faction: 'LUMEN',
    level: 3,
    exp: 45,
    virtuesLogged: 6,
    vicesLogged: 4,
    deedsWitnessed: 12,
    juryAccuracy: 88,
    badges: [
      { id: 'b8', name: 'First Steps', icon: '🌱', description: 'Completed first self-confession and atonement', unlockedAt: '2026-10-13' }
    ],
    location: { name: 'Civic Center Plaza', lat: 37.7795, lng: -122.4170 },
    qrPayload: 'KARMA_USER:p-4:@ApexNovice',
    isOnline: true
  }
];

let deeds: Deed[] = [
  {
    id: 'd-101',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    polarity: 'VIRTUE',
    category: 'Community Uplift',
    title: 'Fixed elderly neighbor’s busted porch wheelchair ramp',
    description: 'Spent 3 hours replacing rusted bolts and leveling out the ramp angle so Mrs. Higgins can safely roll her wheelchair out.',
    impactTier: 'MAJOR',
    karmaValue: 120,
    actorPlayerId: 'p-1',
    actorPlayerName: 'Sophia Valerius (@SaintSophia)',
    actorAvatar: '🕊️',
    reporterPlayerId: 'p-4',
    reporterPlayerName: 'Jordan Walker (@ApexNovice)',
    isSelfReport: false,
    proofImage: null,
    location: { name: 'Sunset Residential Sector', lat: 37.7600, lng: -122.4850, distanceMeters: 420 },
    status: 'VERIFIED',
    juryVotes: {
      vouches: 5,
      caps: 0,
      voters: { 'p-3': 'VOUCH', 'p-4': 'VOUCH' }
    },
    reactions: {
      blessings: 14,
      caps: 0,
      fires: 9,
      userReactions: {}
    },
    comments: [
      {
        id: 'c-1',
        playerId: 'p-4',
        playerName: 'Jordan Walker',
        playerAvatar: '⚡',
        text: 'I saw her carrying the 2x4s and power tools down the avenue. Absolute saint.',
        timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString()
      }
    ]
  },
  {
    id: 'd-102',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    polarity: 'VICE',
    category: 'Petty Spite & Obstruction',
    title: 'Deliberately double-parked blocking 3 shared city bikes',
    description: 'Parked an electric scooter sideways across the public bike dock on 4th street so nobody could undock their bikes during rush hour.',
    impactTier: 'NOTABLE',
    karmaValue: -45,
    actorPlayerId: 'p-2',
    actorPlayerName: 'Kaelen Drake (@ShadowRebel)',
    actorAvatar: '🦇',
    reporterPlayerId: 'p-1',
    reporterPlayerName: 'Sophia Valerius (@SaintSophia)',
    isSelfReport: false,
    location: { name: 'Downtown Commuter Hub', lat: 37.7850, lng: -122.4010, distanceMeters: 850 },
    status: 'VERIFIED',
    juryVotes: {
      vouches: 4,
      caps: 1,
      voters: { 'p-1': 'VOUCH', 'p-3': 'VOUCH', 'p-2': 'CAP' }
    },
    reactions: {
      blessings: 0,
      caps: 12,
      fires: 7,
      userReactions: {}
    },
    comments: [
      {
        id: 'c-2',
        playerId: 'p-2',
        playerName: 'Kaelen Drake',
        playerAvatar: '🦇',
        text: 'The kickstand was broken! I was merely leaning it gracefully.',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString()
      },
      {
        id: 'c-3',
        playerId: 'p-3',
        playerName: 'Master Chen',
        playerAvatar: '☯️',
        text: 'Graceful obstruction remains obstruction. The scales do not lie.',
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString()
      }
    ]
  },
  {
    id: 'd-103',
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    polarity: 'VIRTUE',
    category: 'Altruism & Charity',
    title: 'Paid for stranger’s groceries when their card was declined',
    description: 'At Safeway market, a father with 2 toddlers was $42 short for milk and groceries. Covered the whole tab anonymously.',
    impactTier: 'NOTABLE',
    karmaValue: 50,
    actorPlayerId: 'p-4',
    actorPlayerName: 'Jordan Walker (@ApexNovice)',
    actorAvatar: '⚡',
    reporterPlayerId: 'p-4',
    reporterPlayerName: 'Jordan Walker (@ApexNovice)',
    isSelfReport: true,
    location: { name: 'Marina Fresh Market', lat: 37.8000, lng: -122.4360, distanceMeters: 1200 },
    status: 'PENDING_JURY',
    juryVotes: {
      vouches: 2,
      caps: 0,
      voters: { 'p-1': 'VOUCH' }
    },
    reactions: {
      blessings: 6,
      caps: 0,
      fires: 3,
      userReactions: {}
    },
    comments: []
  }
];

let quests: Quest[] = [
  {
    id: 'q-1',
    title: 'The Cart Return Protocol',
    description: 'Locate 3 stray shopping carts abandoned in a parking lot and return them to the proper collection bay.',
    category: 'DAILY_DISCIPLINE',
    karmaReward: 35,
    difficulty: 'EASY',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    completedBy: ['p-1'],
    icon: '🛒',
    locationHint: 'Any local supermarket parking lot'
  },
  {
    id: 'q-2',
    title: 'Micro-Sanitation Sprint',
    description: 'Pick up at least 10 pieces of discarded plastic/trash along your walking commute and place them in recycling bins.',
    category: 'COMMUNITY_BOUNTY',
    karmaReward: 60,
    difficulty: 'MEDIUM',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    completedBy: [],
    icon: '🧤',
    locationHint: 'Parks, bus stops, or riverfronts'
  },
  {
    id: 'q-3',
    title: 'Atonement: The Radical Apology',
    description: 'Reach out to someone you ghosted, spoke harshly to, or wronged in the past 6 months. Deliver a sincere, no-excuses apology.',
    category: 'ATONEMENT_RITUAL',
    karmaReward: 100,
    difficulty: 'HEROIC',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    completedBy: ['p-4'],
    icon: '🕯️',
    locationHint: 'In-person conversation or phone call'
  },
  {
    id: 'q-4',
    title: 'Pay It Forward Coffee Chain',
    description: 'Surprise the person behind you in line at a café or drive-thru by pre-paying for their beverage.',
    category: 'COMMUNITY_BOUNTY',
    karmaReward: 45,
    difficulty: 'EASY',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    completedBy: [],
    icon: '☕',
    locationHint: 'Local coffee roastery or tea shop'
  }
];

// Helper to broadcast WebSocket messages to all active clients
function broadcast(type: string, payload: unknown) {
  const message = JSON.stringify({ type, payload });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Persistent storage and credentials
let passwords: Record<string, string> = {
  'p-1': bcrypt.hashSync('password123', 10),
  'p-2': bcrypt.hashSync('password123', 10),
  'p-3': bcrypt.hashSync('password123', 10),
  'p-4': bcrypt.hashSync('password123', 10),
};

const DB_FILE = path.resolve('server/karma_db.json');

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ players, passwords, deeds, quests }, null, 2));
  } catch (err) {
    console.error('Error saving karma_db:', err);
  }
}

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (data.players && data.players.length > 0) players = data.players;
      if (data.passwords) passwords = { ...passwords, ...data.passwords };
      if (data.deeds && data.deeds.length > 0) deeds = data.deeds;
      if (data.quests && data.quests.length > 0) quests = data.quests;
      console.log(`[KARMA DB] Loaded ${players.length} players and ${deeds.length} deeds from disk.`);
    }
  } catch (err) {
    console.error('Error loading karma_db:', err);
  }
}
loadDb();

// ==================== AUTHENTICATION API ====================

// Register a new player
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, displayName, faction, avatar, locationName, bio } = req.body;

    if (!email || !username || !password || !displayName) {
      return res.status(400).json({ error: 'Email, username, password, and display name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanUsername = username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`;
    const cleanEmail = email.trim().toLowerCase();

    // Check unique username and email
    const existing = players.find(
      p => p.username.toLowerCase() === cleanUsername.toLowerCase() || p.email?.toLowerCase() === cleanEmail
    );
    if (existing) {
      return res.status(409).json({ error: 'A player with this username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newId = `p-${Date.now()}`;

    const newPlayer: Player = {
      id: newId,
      email: cleanEmail,
      username: cleanUsername,
      displayName: displayName.trim(),
      avatar: avatar || '⚡',
      avatarColor: 'from-amber-500 to-indigo-600',
      bio: bio?.trim() || 'A newly awakened soul navigating the Karmic Matrix.',
      karmaScore: 50,
      alignment: 'MORTAL_DRIFTER',
      title: 'Wayfarer of the Threshold',
      faction: faction || 'EQUILIBRIUM',
      level: 1,
      exp: 0,
      vicesLogged: 0,
      virtuesLogged: 0,
      deedsWitnessed: 0,
      juryAccuracy: 100,
      badges: [
        { id: `b-init-${Date.now()}`, name: 'Initiate of Fate', icon: '🌀', description: 'Joined the Cosmic Ledger', unlockedAt: new Date().toISOString() }
      ],
      location: { name: locationName?.trim() || 'Civic Square', lat: 37.7749, lng: -122.4194 },
      qrPayload: `KARMA_IRL:${newId}:${cleanUsername}`,
      isOnline: true
    };

    players.push(newPlayer);
    passwords[newId] = passwordHash;
    saveDb();

    broadcast('PLAYER_JOINED', newPlayer);

    const token = jwt.sign({ id: newPlayer.id, username: newPlayer.username }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ token, player: newPlayer });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error registering player' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email and password required' });
    }

    const clean = identifier.trim().toLowerCase();
    const player = players.find(p => 
      p.email?.toLowerCase() === clean || 
      p.username.toLowerCase() === clean ||
      p.username.toLowerCase() === (clean.startsWith('@') ? clean : `@${clean}`)
    );

    if (!player) {
      return res.status(401).json({ error: 'No player found with this username or email' });
    }

    const hash = passwords[player.id];
    let isValid = false;
    if (hash) {
      isValid = await bcrypt.compare(password, hash);
    } else if (password === 'password123') {
      isValid = true;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password. (Seed accounts use password123)' });
    }

    const token = jwt.sign({ id: player.id, username: player.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, player });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error logging in' });
  }
});

// Me (Check current session)
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const player = players.find(p => p.id === decoded.id);
    if (!player) return res.status(404).json({ error: 'Player account not found' });
    res.json({ player });
  } catch {
    res.status(401).json({ error: 'Session expired or invalid token' });
  }
});

// REST Endpoints
app.get('/api/players', (_req, res) => {
  res.json(players);
});

app.get('/api/players/:id', (req, res) => {
  const player = players.find(p => p.id === req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });
  res.json(player);
});

app.post('/api/players', (req, res) => {
  const { username, displayName, bio, avatar, faction, location } = req.body;
  if (!username || !displayName) {
    return res.status(400).json({ error: 'Username and display name required' });
  }

  const existing = players.find(p => p.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.json(existing);
  }

  const newPlayer: Player = {
    id: `p-${Date.now()}`,
    username: username.startsWith('@') ? username : `@${username}`,
    displayName,
    avatar: avatar || '⚡',
    avatarColor: 'from-amber-500 to-indigo-600',
    bio: bio || 'A newly awakened soul navigating the Karmic Matrix.',
    karmaScore: 50,
    alignment: 'MORTAL_DRIFTER',
    title: 'Wayfarer of the Threshold',
    faction: faction || 'EQUILIBRIUM',
    level: 1,
    exp: 0,
    vicesLogged: 0,
    virtuesLogged: 0,
    deedsWitnessed: 0,
    juryAccuracy: 100,
    badges: [
      { id: `b-init-${Date.now()}`, name: 'Initiate of Fate', icon: '🌀', description: 'Joined the IRL Karma Grid', unlockedAt: new Date().toISOString() }
    ],
    location: location || { name: 'Player Sanctuary', lat: 37.7749, lng: -122.4194 },
    qrPayload: `KARMA_USER:p-${Date.now()}:${username}`,
    isOnline: true
  };

  players.push(newPlayer);
  broadcast('PLAYER_JOINED', newPlayer);
  res.status(201).json(newPlayer);
});

app.get('/api/deeds', (_req, res) => {
  // Return deeds sorted newest first
  const sorted = [...deeds].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sorted);
});

// Submit a new deed (self or witnessed on someone else)
app.post('/api/deeds', (req, res) => {
  const {
    polarity,
    category,
    title,
    description,
    impactTier,
    actorPlayerId,
    targetPlayerId,
    reporterPlayerId,
    isSelfReport,
    proofImage,
    location
  } = req.body;

  if (!title || !description || !polarity || !actorPlayerId || !reporterPlayerId) {
    return res.status(400).json({ error: 'Missing required deed fields' });
  }

  // Base karma values by tier
  const tierValues: Record<string, number> = {
    TRIVIAL: 10,
    NOTABLE: 35,
    MAJOR: 100,
    MYTHIC: 300
  };

  const rawValue = tierValues[impactTier || 'NOTABLE'] || 35;
  const karmaValue = polarity === 'VIRTUE' ? rawValue : -rawValue;

  const actor = players.find(p => p.id === actorPlayerId);
  const reporter = players.find(p => p.id === reporterPlayerId);
  const target = targetPlayerId ? players.find(p => p.id === targetPlayerId) : null;

  if (!actor || !reporter) {
    return res.status(404).json({ error: 'Actor or reporter player not found' });
  }

  const newDeed: Deed = {
    id: `d-${Date.now()}`,
    createdAt: new Date().toISOString(),
    polarity,
    category: category || (polarity === 'VIRTUE' ? 'Altruism & Charity' : 'Public Deception'),
    title,
    description,
    impactTier: impactTier || 'NOTABLE',
    karmaValue,
    actorPlayerId,
    actorPlayerName: `${actor.displayName} (${actor.username})`,
    actorAvatar: actor.avatar,
    targetPlayerId: target ? target.id : null,
    targetPlayerName: target ? `${target.displayName} (${target.username})` : null,
    reporterPlayerId,
    reporterPlayerName: `${reporter.displayName} (${reporter.username})`,
    isSelfReport: Boolean(isSelfReport),
    proofImage: proofImage || null,
    location: location || { name: 'IRL Encounter Point', lat: 37.7749, lng: -122.4194, distanceMeters: 50 },
    // Minor deeds might auto-verify, but core deeds require peer jury!
    status: impactTier === 'TRIVIAL' && isSelfReport ? 'VERIFIED' : 'PENDING_JURY',
    juryVotes: {
      vouches: impactTier === 'TRIVIAL' && isSelfReport ? 1 : 0,
      caps: 0,
      voters: {}
    },
    reactions: {
      blessings: polarity === 'VIRTUE' ? 1 : 0,
      caps: 0,
      fires: 0,
      userReactions: {}
    },
    comments: []
  };

  // If auto-verified, update player karma immediately
  if (newDeed.status === 'VERIFIED') {
    actor.karmaScore += newDeed.karmaValue;
    actor.alignment = calculateAlignment(actor.karmaScore);
    actor.title = calculateTitle(actor.alignment);
    if (polarity === 'VIRTUE') actor.virtuesLogged += 1;
    else actor.vicesLogged += 1;
  }

  deeds.unshift(newDeed);
  saveDb();
  broadcast('DEED_CREATED', { deed: newDeed, actor });

  res.status(201).json(newDeed);
});

// Jury Vote on a pending deed (VOUCH or CAP)
app.post('/api/deeds/:id/vote', (req, res) => {
  const deedId = req.params.id;
  const { voterPlayerId, vote } = req.body; // 'VOUCH' | 'CAP'

  if (!voterPlayerId || !['VOUCH', 'CAP'].includes(vote)) {
    return res.status(400).json({ error: 'Invalid vote parameters' });
  }

  const deed = deeds.find(d => d.id === deedId);
  if (!deed) return res.status(404).json({ error: 'Deed not found' });

  const voter = players.find(p => p.id === voterPlayerId);
  if (!voter) return res.status(404).json({ error: 'Voter not found' });

  // Prevent voting on own deed
  if (deed.actorPlayerId === voterPlayerId) {
    return res.status(400).json({ error: 'You cannot vote on your own logged deed' });
  }

  // Check if voter already voted
  if (deed.juryVotes.voters[voterPlayerId]) {
    return res.status(400).json({ error: 'You have already cast a jury vote on this deed' });
  }

  // Register vote
  deed.juryVotes.voters[voterPlayerId] = vote as 'VOUCH' | 'CAP';
  if (vote === 'VOUCH') {
    deed.juryVotes.vouches += 1;
  } else {
    deed.juryVotes.caps += 1;
  }

  // Reward voter with Arbiter XP
  voter.deedsWitnessed += 1;
  voter.exp += 15;
  if (voter.exp >= voter.level * 100) {
    voter.level += 1;
    voter.exp = 0;
  }

  // Check consensus threshold (e.g. 2 vouches or 2 caps triggers verdict)
  const actor = players.find(p => p.id === deed.actorPlayerId);
  if (deed.status === 'PENDING_JURY') {
    if (deed.juryVotes.vouches >= 2 && deed.juryVotes.vouches > deed.juryVotes.caps) {
      deed.status = 'VERIFIED';
      if (actor) {
        actor.karmaScore += deed.karmaValue;
        actor.alignment = calculateAlignment(actor.karmaScore);
        actor.title = calculateTitle(actor.alignment);
        if (deed.polarity === 'VIRTUE') actor.virtuesLogged += 1;
        else actor.vicesLogged += 1;
      }
    } else if (deed.juryVotes.caps >= 2 && deed.juryVotes.caps > deed.juryVotes.vouches) {
      deed.status = 'CALL_CAP_DISPUTED';
      // If caught lying on a virtue report, actor gets hit with a penalty!
      if (deed.isSelfReport && actor) {
        actor.karmaScore -= 25; // Penalty for fraudulent log
        actor.alignment = calculateAlignment(actor.karmaScore);
        actor.title = calculateTitle(actor.alignment);
      }
    }
  }

  saveDb();
  broadcast('JURY_VOTED', { deed, voter, actor });
  res.json({ deed, voter, actor });
});

// React to a deed (bless, cap, fire)
app.post('/api/deeds/:id/react', (req, res) => {
  const deedId = req.params.id;
  const { playerId, reactionType } = req.body; // 'blessing' | 'cap' | 'fire'

  const deed = deeds.find(d => d.id === deedId);
  if (!deed) return res.status(404).json({ error: 'Deed not found' });

  if (reactionType === 'blessing') deed.reactions.blessings += 1;
  else if (reactionType === 'cap') deed.reactions.caps += 1;
  else if (reactionType === 'fire') deed.reactions.fires += 1;

  if (playerId) {
    deed.reactions.userReactions[playerId] = reactionType;
  }

  saveDb();
  broadcast('REACTION_ADDED', deed);
  res.json(deed);
});

// Add comment / testimony
app.post('/api/deeds/:id/comments', (req, res) => {
  const deedId = req.params.id;
  const { playerId, text } = req.body;

  if (!playerId || !text?.trim()) {
    return res.status(400).json({ error: 'Player ID and text required' });
  }

  const deed = deeds.find(d => d.id === deedId);
  if (!deed) return res.status(404).json({ error: 'Deed not found' });

  const player = players.find(p => p.id === playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const newComment = {
    id: `c-${Date.now()}`,
    playerId,
    playerName: player.displayName,
    playerAvatar: player.avatar,
    text: text.trim(),
    timestamp: new Date().toISOString()
  };

  deed.comments.push(newComment);
  saveDb();
  broadcast('COMMENT_ADDED', { deedId, comment: newComment });
  res.status(201).json(newComment);
});

// Quests
app.get('/api/quests', (_req, res) => {
  res.json(quests);
});

app.post('/api/quests/:id/complete', (req, res) => {
  const questId = req.params.id;
  const { playerId } = req.body;

  const quest = quests.find(q => q.id === questId);
  if (!quest) return res.status(404).json({ error: 'Quest not found' });

  const player = players.find(p => p.id === playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  if (quest.completedBy.includes(playerId)) {
    return res.status(400).json({ error: 'Quest already completed by this player' });
  }

  quest.completedBy.push(playerId);
  player.karmaScore += quest.karmaReward;
  player.exp += 50;
  player.virtuesLogged += 1;
  player.alignment = calculateAlignment(player.karmaScore);
  player.title = calculateTitle(player.alignment);

  // Auto-log a verified deed for this quest completion!
  const questDeed: Deed = {
    id: `d-quest-${Date.now()}`,
    createdAt: new Date().toISOString(),
    polarity: 'VIRTUE',
    category: quest.category === 'ATONEMENT_RITUAL' ? 'Atonement & Restoration' : 'Community Bounty',
    title: `Completed Quest: ${quest.title}`,
    description: quest.description,
    impactTier: quest.difficulty === 'HEROIC' ? 'MAJOR' : 'NOTABLE',
    karmaValue: quest.karmaReward,
    actorPlayerId: player.id,
    actorPlayerName: `${player.displayName} (${player.username})`,
    actorAvatar: player.avatar,
    reporterPlayerId: player.id,
    reporterPlayerName: 'The Cosmic Ledger',
    isSelfReport: true,
    location: { name: quest.locationHint || 'Local Community Grid', lat: player.location.lat, lng: player.location.lng, distanceMeters: 10 },
    status: 'VERIFIED',
    juryVotes: { vouches: 3, caps: 0, voters: { system: 'VOUCH' } },
    reactions: { blessings: 3, caps: 0, fires: 2, userReactions: {} },
    comments: []
  };

  deeds.unshift(questDeed);
  saveDb();

  broadcast('QUEST_COMPLETED', { quest, player, deed: questDeed });
  res.json({ quest, player, deed: questDeed });
});

// Stats
app.get('/api/stats', (_req, res) => {
  const totalKarma = players.reduce((sum, p) => sum + p.karmaScore, 0);
  const totalVirtues = deeds.filter(d => d.polarity === 'VIRTUE').length;
  const totalVices = deeds.filter(d => d.polarity === 'VICE').length;
  const activeCount = players.length;
  const purity = totalVirtues + totalVices > 0 ? Math.round((totalVirtues / (totalVirtues + totalVices)) * 100) : 50;

  const stats: KarmicStats = {
    totalKarmaInCirculation: totalKarma,
    totalVirtuesLogged: totalVirtues,
    totalVicesLogged: totalVices,
    activePlayersToday: activeCount,
    globalPurityPercent: purity
  };

  res.json(stats);
});

// Simulate an IRL encounter from another player in the world
app.post('/api/simulate-encounter', (req, res) => {
  const { targetPlayerId } = req.body;
  const target = players.find(p => p.id === targetPlayerId) || players[0];

  const scenarios = [
    {
      polarity: 'VIRTUE' as const,
      category: 'Unconditional Honesty',
      title: `Returned dropped wallet with \$80 cash to ${target.displayName}`,
      description: `Noticed ${target.displayName} drop their leather cardholder outside the transit station. Ran half a block to hand it back safely.`,
      impactTier: 'MAJOR' as const,
      karmaValue: 100,
      reporterName: 'CivicWitness_99'
    },
    {
      polarity: 'VICE' as const,
      category: 'Digital / IRL Toxicity',
      title: `Spilled boba tea on park bench and walked away without wiping`,
      description: `Sat down at the sunny park bench, knocked over half a cup of sticky brown sugar milk tea, and just walked off leaving it sticky for the next person.`,
      impactTier: 'NOTABLE' as const,
      karmaValue: -35,
      reporterName: 'ParkRanger_Kai'
    },
    {
      polarity: 'VIRTUE' as const,
      category: 'Altruism & Charity',
      title: `Helped push a stalled hybrid car out of the intersection`,
      description: `Traffic was completely snarled at 5th & Mission. Jumped out of the crosswalk and helped push the dead vehicle safely into the loading zone.`,
      impactTier: 'MAJOR' as const,
      karmaValue: 90,
      reporterName: 'TrafficWatcher_Dan'
    }
  ];

  const pick = scenarios[Math.floor(Math.random() * scenarios.length)];
  const newDeed: Deed = {
    id: `d-sim-${Date.now()}`,
    createdAt: new Date().toISOString(),
    polarity: pick.polarity,
    category: pick.category,
    title: pick.title,
    description: pick.description,
    impactTier: pick.impactTier,
    karmaValue: pick.karmaValue,
    actorPlayerId: target.id,
    actorPlayerName: `${target.displayName} (${target.username})`,
    actorAvatar: target.avatar,
    reporterPlayerId: 'sim-watcher',
    reporterPlayerName: pick.reporterName,
    isSelfReport: false,
    location: { name: 'Metropolitan Crossway', lat: target.location.lat + (Math.random() - 0.5) * 0.01, lng: target.location.lng + (Math.random() - 0.5) * 0.01, distanceMeters: Math.floor(Math.random() * 400 + 50) },
    status: 'PENDING_JURY',
    juryVotes: { vouches: 0, caps: 0, voters: {} },
    reactions: { blessings: 0, caps: 0, fires: 1, userReactions: {} },
    comments: []
  };

  deeds.unshift(newDeed);
  broadcast('DEED_CREATED', { deed: newDeed, actor: target });
  res.json(newDeed);
});

// WebSocket Connection handling
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'INIT_SYNC',
    payload: {
      players,
      deeds,
      quests
    }
  }));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message.toString());
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch {
      // Ignore invalid ws payloads
    }
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[KARMA SERVER] ⚖️ Cosmic Ledger Server active on http://localhost:${PORT}`);
  console.log(`[KARMA SERVER] ⚡ WebSocket stream ready at ws://localhost:${PORT}`);
});
