import { PlayerProfile, LiveParticipant } from '../types';

export const PROFILES: PlayerProfile[] = [
  {
    summonerName: 'Hide on bush',
    tagLine: 'KR1',
    region: 'KR',
    rank: 'Challenger',
    lp: 1540,
    winRate: 24.2,
    top4Rate: 65.5,
    avgPlacement: 3.12,
    gamesPlayed: 250,
    lpHistory: [
      { matchIndex: 10, lp: 1420 },
      { matchIndex: 9, lp: 1460 },
      { matchIndex: 8, lp: 1440 },
      { matchIndex: 7, lp: 1485 },
      { matchIndex: 6, lp: 1450 },
      { matchIndex: 5, lp: 1490 },
      { matchIndex: 4, lp: 1530 },
      { matchIndex: 3, lp: 1515 },
      { matchIndex: 2, lp: 1500 },
      { matchIndex: 1, lp: 1540 }
    ],
    matches: [
      {
        id: 'kr_match_001',
        placement: 1,
        duration: '38:12',
        gameMode: 'Ranked TFT',
        timestamp: '1 hour ago',
        level: 9,
        traits: [
          { name: 'Arcanist', count: 6, tier: 'prismatic' },
          { name: 'Fated', count: 3, tier: 'bronze' },
          { name: 'Warden', count: 2, tier: 'bronze' },
          { name: 'Behemoth', count: 2, tier: 'bronze' }
        ],
        units: [
          { championId: 'syndra', starLevel: 2, items: ['blue_buff', 'jeweled_gauntlet', 'rabadons_deathcap'] },
          { championId: 'illaoi', starLevel: 3, items: ['warmogs_armor', 'bramble_vest', 'gargoyle_stoneplate'] },
          { championId: 'zoe', starLevel: 3, items: ['blue_buff', 'jeweled_gauntlet'] },
          { championId: 'thresh', starLevel: 2, items: ['ionic_spark'] },
          { championId: 'neeko', starLevel: 2, items: ['warmogs_armor'] },
          { championId: 'ahri', starLevel: 2, items: [] },
          { championId: 'lux', starLevel: 2, items: ['spear_of_shojin'] },
          { championId: 'lissandra', starLevel: 2, items: [] }
        ],
        damageStats: [
          { championId: 'syndra', damage: 85400 },
          { championId: 'zoe', damage: 52100 },
          { championId: 'lux', damage: 22400 },
          { championId: 'illaoi', damage: 8400 }
        ],
        tankStats: [
          { championId: 'illaoi', tanked: 94200 },
          { championId: 'thresh', tanked: 42100 },
          { championId: 'neeko', tanked: 32000 }
        ],
        healStats: [
          { championId: 'illaoi', healed: 18500 },
          { championId: 'neeko', healed: 9400 }
        ],
        lobby: [
          {
            summonerName: 'Hide on bush',
            tagLine: 'KR1',
            placement: 1,
            level: 9,
            goldLeft: 12,
            units: [
              { championId: 'syndra', starLevel: 2, items: ['blue_buff', 'jeweled_gauntlet', 'rabadons_deathcap'] },
              { championId: 'illaoi', starLevel: 3, items: ['warmogs_armor', 'bramble_vest', 'gargoyle_stoneplate'] },
              { championId: 'zoe', starLevel: 3, items: ['blue_buff', 'jeweled_gauntlet'] }
            ],
            activeTraits: [
              { name: 'Arcanist', count: 6, activeTier: 'prismatic' },
              { name: 'Fated', count: 3, activeTier: 'bronze' }
            ]
          },
          {
            summonerName: 'T1 Zeus',
            tagLine: 'KR2',
            placement: 2,
            level: 9,
            goldLeft: 3,
            units: [
              { championId: 'aphelios', starLevel: 3, items: ['guinsoos_rageblade', 'infinity_edge'] },
              { championId: 'thresh', starLevel: 3, items: ['warmogs_armor', 'bramble_vest'] }
            ],
            activeTraits: [
              { name: 'Fated', count: 5, activeTier: 'gold' },
              { name: 'Sniper', count: 2, activeTier: 'bronze' }
            ]
          },
          {
            summonerName: 'DK ShowMaker',
            tagLine: 'KR1',
            placement: 3,
            level: 8,
            goldLeft: 4,
            units: [
              { championId: 'lee_sin', starLevel: 2, items: ['bloodthirster', 'steraks_gage'] },
              { championId: 'yasuo', starLevel: 3, items: ['warmogs_armor'] }
            ],
            activeTraits: [
              { name: 'Duelist', count: 4, activeTier: 'silver' },
              { name: 'Dragonlord', count: 2, activeTier: 'bronze' }
            ]
          },
          {
            summonerName: 'GEN Kiin',
            tagLine: 'KR3',
            placement: 4,
            level: 8,
            goldLeft: 18,
            units: [
              { championId: 'gnar', starLevel: 3, items: ['bloodthirster', 'steraks_gage'] },
              { championId: 'kindred', starLevel: 3, items: ['blue_buff'] }
            ],
            activeTraits: [
              { name: 'Dryad', count: 4, activeTier: 'gold' },
              { name: 'Reaper', count: 2, activeTier: 'bronze' }
            ]
          }
        ]
      },
      {
        id: 'kr_match_002',
        placement: 3,
        duration: '34:25',
        gameMode: 'Ranked TFT',
        timestamp: '5 hours ago',
        level: 8,
        traits: [
          { name: 'Fated', count: 5, tier: 'gold' },
          { name: 'Sniper', count: 2, tier: 'bronze' },
          { name: 'Warden', count: 2, tier: 'bronze' }
        ],
        units: [
          { championId: 'aphelios', starLevel: 3, items: ['guinsoos_rageblade', 'infinity_edge', 'steraks_gage'] },
          { championId: 'thresh', starLevel: 3, items: ['bramble_vest', 'dragons_claw', 'gargoyle_stoneplate'] },
          { championId: 'sett', starLevel: 1, items: ['bloodthirster'] },
          { championId: 'kindred', starLevel: 2, items: [] },
          { championId: 'ahri', starLevel: 2, items: [] }
        ],
        damageStats: [
          { championId: 'aphelios', damage: 68900 },
          { championId: 'kindred', damage: 15400 }
        ],
        tankStats: [
          { championId: 'thresh', tanked: 74500 },
          { championId: 'sett', tanked: 21000 }
        ],
        healStats: [
          { championId: 'sett', healed: 8200 },
          { championId: 'thresh', healed: 2500 }
        ],
        lobby: []
      },
      {
        id: 'kr_match_003',
        placement: 5,
        duration: '29:40',
        gameMode: 'Ranked TFT',
        timestamp: '1 day ago',
        level: 8,
        traits: [
          { name: 'Duelist', count: 4, tier: 'silver' },
          { name: 'Dragonlord', count: 2, tier: 'bronze' }
        ],
        units: [
          { championId: 'lee_sin', starLevel: 2, items: ['bloodthirster', 'infinity_edge'] },
          { championId: 'yasuo', starLevel: 2, items: ['gargoyle_stoneplate'] },
          { championId: 'janna', starLevel: 2, items: ['spear_of_shojin'] },
          { championId: 'diana', starLevel: 2, items: [] }
        ],
        lobby: []
      }
    ]
  },
  {
    summonerName: 'EliteTactician',
    tagLine: 'NA1',
    region: 'NA',
    rank: 'Grandmaster',
    lp: 680,
    winRate: 18.2,
    top4Rate: 58.3,
    avgPlacement: 3.82,
    gamesPlayed: 120,
    lpHistory: [
      { matchIndex: 5, lp: 610 },
      { matchIndex: 4, lp: 652 },
      { matchIndex: 3, lp: 630 },
      { matchIndex: 2, lp: 695 },
      { matchIndex: 1, lp: 680 }
    ],
    matches: [
      {
        id: 'na_match_001',
        placement: 2,
        duration: '36:40',
        gameMode: 'Ranked TFT',
        timestamp: '3 hours ago',
        level: 9,
        traits: [
          { name: 'Fated', count: 5, tier: 'gold' },
          { name: 'Sniper', count: 2, tier: 'bronze' }
        ],
        units: [
          { championId: 'aphelios', starLevel: 3, items: ['guinsoos_rageblade', 'infinity_edge'] },
          { championId: 'thresh', starLevel: 2, items: ['bramble_vest', 'dragons_claw'] },
          { championId: 'sett', starLevel: 2, items: ['bloodthirster'] }
        ],
        lobby: []
      }
    ]
  }
];

export const LIVE_LOBBY: LiveParticipant[] = [
  { summonerName: 'Hide on bush', tagLine: 'KR1', rank: 'Challenger', lp: 1540, winRate: 24.2, hotStreak: 3, preferredTraits: ['Arcanist', 'Fated'], dangerLevel: 'High', predictedPlacement: 1 },
  { summonerName: 'T1 Gumayusi', tagLine: 'KR2', rank: 'Challenger', lp: 1310, winRate: 21.4, hotStreak: 1, preferredTraits: ['Sniper', 'Inkshadow'], dangerLevel: 'High', predictedPlacement: 3 },
  { summonerName: 'T1 Keria', tagLine: 'KR1', rank: 'Challenger', lp: 1250, winRate: 19.8, hotStreak: 0, preferredTraits: ['Storyweaver', 'Heavenly'], dangerLevel: 'Medium', predictedPlacement: 4 },
  { summonerName: 'GEN Chovy', tagLine: 'KR1', rank: 'Challenger', lp: 1810, winRate: 29.1, hotStreak: 5, preferredTraits: ['Sage', 'Dragonlord'], dangerLevel: 'High', predictedPlacement: 2 },
  { summonerName: 'DK Aiming', tagLine: 'KR4', rank: 'Grandmaster', lp: 890, winRate: 17.5, hotStreak: 0, preferredTraits: ['Trickshot', 'Bruiser'], dangerLevel: 'Medium', predictedPlacement: 6 },
  { summonerName: 'GEN Peyz', tagLine: 'KR5', rank: 'Grandmaster', lp: 780, winRate: 16.2, hotStreak: -1, preferredTraits: ['Duelist'], dangerLevel: 'Low', predictedPlacement: 7 },
  { summonerName: 'HLE Delight', tagLine: 'KR1', rank: 'Challenger', lp: 1120, winRate: 18.5, hotStreak: 2, preferredTraits: ['Behemoth', 'Dryad'], dangerLevel: 'Medium', predictedPlacement: 5 },
  { summonerName: 'T1 Oner', tagLine: 'KR2', rank: 'Grandmaster', lp: 650, winRate: 15.0, hotStreak: -2, preferredTraits: ['Porcelain', 'Warden'], dangerLevel: 'Low', predictedPlacement: 8 }
];
export const LIVE_TIPS = [
  "GEN Chovy is on a 5-match Hot Streak. Keep a close watch on his leveling intervals relative to stage transitions.",
  "Arcanist units are contested! Both 'Hide on bush' and 'Delight' are purchasing Lux and Neeko copies in Stage 2.",
  "Your current board placement is highly favored under Stage 3, but falling off. Roll slightly to secure critical frontline tier upgrades."
];
