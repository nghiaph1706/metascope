export type Tier = 'S' | 'A' | 'B' | 'C';

export interface Champion {
  id: string;
  name: string;
  cost: number;
  traits: string[];
  imageUrl?: string;
}

export interface HexPosition {
  row: number; // 0 to 3
  col: number; // 0 to 6
  championId: string;
  starLevel?: number;
  items?: string[];
}

export interface Synergy {
  name: string;
  count: number;
  tier: 'bronze' | 'silver' | 'gold' | 'prismatic';
  activated: boolean;
  maxCount: number;
}

export interface Composition {
  id: string;
  name: string;
  tier: Tier;
  playstyle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  winRate: number;
  top4Rate: number;
  pickRate: number;
  avgPlace: number;
  carryChampions: string[]; // Champion Names or IDs
  tankChampions: string[]; // Champion Names or IDs
  traits: string[];
  positions: HexPosition[];
  earlyUnits: string[];
  midUnits: string[];
  carouselPriority: string[];
  description: string;
  author?: string;
  updatedAt: string;
}

export interface MatchPlayer {
  summonerName: string;
  tagLine: string;
  placement: number;
  level: number;
  goldLeft: number;
  units: {
    championId: string;
    starLevel: number;
    items: string[];
  }[];
  activeTraits: {
    name: string;
    count: number;
    activeTier: 'bronze' | 'silver' | 'gold' | 'prismatic' | 'none';
  }[];
}

export interface GameMatch {
  id: string;
  placement: number;
  duration: string;
  gameMode: string;
  timestamp: string;
  level: number;
  traits: { name: string; count: number; tier: 'bronze' | 'silver' | 'gold' | 'prismatic' }[];
  units: { championId: string; starLevel: number; items: string[] }[];
  lobby: MatchPlayer[];
  damageStats?: { championId: string; damage: number }[];
  tankStats?: { championId: string; tanked: number }[];
  healStats?: { championId: string; healed: number }[];
}

export interface PlayerProfile {
  summonerName: string;
  tagLine: string;
  region: string;
  rank: string;
  lp: number;
  winRate: number;
  top4Rate: number;
  avgPlacement: number;
  gamesPlayed: number;
  lpHistory: { matchIndex: number; lp: number }[];
  matches: GameMatch[];
}

export interface LiveParticipant {
  summonerName: string;
  tagLine: string;
  rank: string;
  lp: number;
  winRate: number;
  hotStreak: number;
  preferredTraits: string[];
  dangerLevel: 'Low' | 'Medium' | 'High';
  predictedPlacement: number;
}

export interface CreatorStats {
  views: number;
  upvotes: number;
  shares: number;
  copies: number;
  viewsHistory: { date: string; views: number }[];
  conversionHistory: { date: string; rate: number }[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface WalletState {
  totalEarnings: number;
  currentBalance: number;
  pendingBalance: number;
  nextPayoutDate: string;
  transactions: Transaction[];
  monthlyRevenueHistory: { month: string; amount: number }[];
}

export interface PatchItem {
  id: string;
  name: string;
  type: 'buff' | 'nerf' | 'adjust';
  category: 'champion' | 'trait' | 'item' | 'augment';
  desc: string;
  impactTips: string;
}

export interface PatchNote {
  version: string;
  title: string;
  releaseDate: string;
  summary: string;
  items: PatchItem[];
}
