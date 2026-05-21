import { Champion } from '../types';

export const CHAMPIONS: Champion[] = [
  { id: 'ahri', name: 'Ahri', cost: 1, traits: ['Fated', 'Arcanist'] },
  { id: 'yasuo', name: 'Yasuo', cost: 1, traits: ['Fated', 'Duelist'] },
  { id: 'jax', name: 'Jax', cost: 1, traits: ['Inkshadow', 'Warden'] },
  { id: 'lux', name: 'Lux', cost: 2, traits: ['Porcelain', 'Arcanist'] },
  { id: 'neeko', name: 'Neeko', cost: 2, traits: ['Mythic', 'Heavenly', 'Arcanist'] },
  { id: 'janna', name: 'Janna', cost: 2, traits: ['Dragonlord', 'Invoker'] },
  { id: 'kindred', name: 'Kindred', cost: 2, traits: ['Fated', 'Dryad', 'Reaper'] },
  { id: 'gnar', name: 'Gnar', cost: 2, traits: ['Dryad', 'Warden'] },
  { id: 'zoe', name: 'Zoe', cost: 3, traits: ['Fortune', 'Storyweaver', 'Arcanist'] },
  { id: 'illaoi', name: 'Illaoi', cost: 3, traits: ['Ghostly', 'Arcanist', 'Warden'] },
  { id: 'thresh', name: 'Thresh', cost: 3, traits: ['Fated', 'Behemoth'] },
  { id: 'aphelios', name: 'Aphelios', cost: 3, traits: ['Fated', 'Sniper'] },
  { id: 'diana', name: 'Diana', cost: 3, traits: ['Dragonlord', 'Sage'] },
  { id: 'bard', name: 'Bard', cost: 3, traits: ['Mythic', 'Trickshot'] },
  { id: 'syndra', name: 'Syndra', cost: 4, traits: ['Fated', 'Arcanist'] },
  { id: 'lillia', name: 'Lillia', cost: 4, traits: ['Mythic', 'Invoker'] },
  { id: 'ashe', name: 'Ashe', cost: 4, traits: ['Porcelain', 'Sniper'] },
  { id: 'kaisa', name: 'Kai\'Sa', cost: 4, traits: ['Inkshadow', 'Trickshot'] },
  { id: 'galio', name: 'Galio', cost: 4, traits: ['Storyweaver', 'Bruiser'] },
  { id: 'nautilus', name: 'Nautilus', cost: 4, traits: ['Mythic', 'Warden'] },
  { id: 'lee_sin', name: 'Lee Sin', cost: 4, traits: ['Dragonlord', 'Duelist'] },
  { id: 'sett', name: 'Sett', cost: 5, traits: ['Fated', 'Umbral', 'Warden'] },
  { id: 'azir', name: 'Azir', cost: 5, traits: ['Dryad', 'Invoker'] },
  { id: 'hwei', name: 'Hwei', cost: 5, traits: ['Mythic', 'Artist'] },
  { id: 'lissandra', name: 'Lissandra', cost: 5, traits: ['Porcelain', 'Arcanist'] },
  { id: 'rakan', name: 'Rakan', cost: 5, traits: ['Dragonlord', 'Sage', 'Altruist'] },
  { id: 'wukong', name: 'Wukong', cost: 5, traits: ['Great', 'Sage', 'Heavenly'] }
];

export interface ItemData {
  id: string;
  name: string;
  desc: string;
  type: 'base' | 'combined' | 'emblem' | 'radiant' | 'artifact';
  tier: 'S' | 'A' | 'B' | 'C';
}

export const ITEMS: ItemData[] = [
  // Combined
  { id: 'blue_buff', name: 'Blue Buff', desc: 'Max mana reduced by 10. Grant 15% damage.', type: 'combined', tier: 'S' },
  { id: 'jeweled_gauntlet', name: 'Jeweled Gauntlet', desc: 'Holder magic damage can critically strike.', type: 'combined', tier: 'S' },
  { id: 'rabadons_deathcap', name: 'Rabadon\'s Deathcap', desc: 'Grant 50 bonus Ability Power.', type: 'combined', tier: 'A' },
  { id: 'warmogs_armor', name: 'Warmog\'s Armor', desc: 'Grant 600 bonus Health.', type: 'combined', tier: 'A' },
  { id: 'bramble_vest', name: 'Bramble Vest', desc: 'Grant 100 Armor. Negate critical strike bonus physical damage.', type: 'combined', tier: 'B' },
  { id: 'dragons_claw', name: 'Dragon\'s Claw', desc: 'Grant 100 Magic Resist. Regenerate health.', type: 'combined', tier: 'A' },
  { id: 'spear_of_shojin', name: 'Spear of Shojin', desc: 'Attacks grant bonus 5 Mana.', type: 'combined', tier: 'S' },
  { id: 'guinsoos_rageblade', name: 'Guinsoo\'s Rageblade', desc: 'Attacks grant 5% stacking Attack Speed.', type: 'combined', tier: 'S' },
  { id: 'infinity_edge', name: 'Infinity Edge', desc: 'Holder physical damage can critically strike.', type: 'combined', tier: 'S' },
  { id: 'bloodthirster', name: 'Bloodthirster', desc: 'Heal for 20% of damage dealt. Grant a shield.', type: 'combined', tier: 'A' },
  { id: 'gargoyle_stoneplate', name: 'Gargoyle Stoneplate', desc: 'Grant armor and magic resist based on targeters.', type: 'combined', tier: 'S' },
  { id: 'red_buff', name: 'Red Buff', desc: 'Dealt damage burns for 1% true damage and wounds healings.', type: 'combined', tier: 'A' },
  { id: 'ionic_spark', name: 'Ionic Spark', desc: 'Shred enemy Magic Resist within 2 hexes, shock on spell cast.', type: 'combined', tier: 'S' },
  { id: 'statikk_shiv', name: 'Statikk Shiv', desc: 'Every 3rd attack shocks 4 enemies shredding Magic Resist.', type: 'combined', tier: 'A' },
  { id: 'steraks_gage', name: 'Sterak\'s Gage', desc: 'Grant health and attack power when health drops below 60%.', type: 'combined', tier: 'B' },
  { id: 'titans_resolve', name: 'Titan\'s Resolve', desc: 'Grant 2% Attack Damage and 2 Ability Power when attacking or taking damage, stacking up to 25 times. At full stacks, grant 20 Armor and Magic Resist.', type: 'combined', tier: 'S' },
  { id: 'giant_slayer', name: 'Giant Slayer', desc: 'Grant 15% bonus Attack Damage and 15 bonus Ability Power. Abilities and attacks deal 25% more damage to enemies with more than 1600 maximum Health.', type: 'combined', tier: 'S' },

  // Base
  { id: 'bf_sword', name: 'B.F. Sword', desc: '+10% Attack Damage', type: 'base', tier: 'A' },
  { id: 'recurve_bow', name: 'Recurve Bow', desc: '+10% Attack Speed', type: 'base', tier: 'S' },
  { id: 'needlessly_large_rod', name: 'Needlessly Large Rod', desc: '+10 Ability Power', type: 'base', tier: 'A' },
  { id: 'tear_of_the_goddess', name: 'Tear of the Goddess', desc: '+15 Mana', type: 'base', tier: 'S' },
  { id: 'chain_vest', name: 'Chain Vest', desc: '+20 Armor', type: 'base', tier: 'B' },
  { id: 'negatron_cloak', name: 'Negatron Cloak', desc: '+20 Magic Resist', type: 'base', tier: 'B' },
  { id: 'giants_belt', name: 'Giant\'s Belt', desc: '+150 Health', type: 'base', tier: 'B' },
  { id: 'sparring_gloves', name: 'Sparring Gloves', desc: '+20% Critical Strike Chance', type: 'base', tier: 'S' },
  { id: 'spatula', name: 'Spatula', desc: 'It must do something...', type: 'base', tier: 'S' },

  // Emblems
  { id: 'arcanist_emblem', name: 'Arcanist Emblem', desc: 'Holder gains the Arcanist trait.', type: 'emblem', tier: 'S' },
  { id: 'fated_emblem', name: 'Fated Emblem', desc: 'Holder gains the Fated trait.', type: 'emblem', tier: 'S' },
  { id: 'porcelain_emblem', name: 'Porcelain Emblem', desc: 'Holder gains the Porcelain trait.', type: 'emblem', tier: 'S' },
  { id: 'mythic_emblem', name: 'Mythic Emblem', desc: 'Holder gains the Mythic trait.', type: 'emblem', tier: 'A' },
  { id: 'dragonlord_emblem', name: 'Dragonlord Emblem', desc: 'Holder gains the Dragonlord trait.', type: 'emblem', tier: 'A' },
  { id: 'storyweaver_emblem', name: 'Storyweaver Emblem', desc: 'Holder gains the Storyweaver trait.', type: 'emblem', tier: 'B' },
  { id: 'sniper_emblem', name: 'Sniper Emblem', desc: 'Holder gains the Sniper trait.', type: 'emblem', tier: 'S' },
  
  // Artifacts
  { id: 'zhonyas_paradox', name: 'Zhonya\'s Paradox', desc: 'Once per combat at 40% Health, become invulnerable for 3 seconds.', type: 'artifact', tier: 'S' },
  { id: 'deaths_defiance', name: 'Death\'s Defiance', desc: 'Grant 25% Omnivamp. 50% of damage taken is instead dealt over 4 seconds as non-lethal damage.', type: 'artifact', tier: 'S' },
  { id: 'blacksmiths_gloves', name: 'Blacksmith\'s Gloves', desc: 'Each round: Equip 2 random Ornn Artifacts.', type: 'artifact', tier: 'S' },

  // Radiant
  { id: 'rabadons_ascended_deathcap', name: 'Rabadon\'s Ascended Deathcap', desc: 'Grant 70 bonus Ability Power and 20% bonus damage.', type: 'radiant', tier: 'S' },
  { id: 'zenith_edge', name: 'Zenith Edge', desc: 'Holder physical damage can critically strike. Grant 50% bonus Critical Strike Damage.', type: 'radiant', tier: 'S' }
];

export const TRAITS = [
  'Arcanist', 'Fated', 'Mythic', 'Dryad', 'Porcelain', 'Dragonlord', 'Storyweaver', 'Invoker', 'Warden', 'Sage', 'Trickshot', 'Duelist', 'Behemoth', 'Bruiser', 'Gold'
];

export const getChampionImageUrl = (name: string) => {
  const overrides: Record<string, string> = {
    'Wukong': 'MonkeyKing',
    'Kog\'Maw': 'KogMaw',
    'Rek\'Sai': 'RekSai',
    'Cho\'Gath': 'Chogath',
    'Kha\'Zix': 'Khazix',
    'Vel\'Koz': 'Velkoz',
    'Kai\'Sa': 'Kaisa',
    'Bel\'Veth': 'Belveth',
    'Nunu & Willump': 'Nunu',
    'Tahm Kench': 'TahmKench',
    'Lee Sin': 'LeeSin',
    'Xin Zhao': 'XinZhao',
    'Aurelion Sol': 'AurelionSol',
    'Jarvan IV': 'JarvanIV',
    'Dr. Mundo': 'DrMundo',
    'Master Yi': 'MasterYi',
    'Miss Fortune': 'MissFortune',
    'Renata Glasc': 'Renata',
    'Twisted Fate': 'TwistedFate'
  };
  const cleanName = overrides[name] || name.replace(/[^a-zA-Z0-9]/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${cleanName}.png`;
};

export const getItemImageUrl = (id: string, name: string) => {
  const map: Record<string, string> = {
    'bf_sword': '1038',
    'recurve_bow': '1043',
    'needlessly_large_rod': '1058',
    'tear_of_the_goddess': '1070',
    'chain_vest': '1031',
    'negatron_cloak': '1053',
    'giants_belt': '1011',
    'bloodthirster': '3072',
    'rabadons_deathcap': '3089',
    'guinsoos_rageblade': '3124',
    'infinity_edge': '3031',
    'warmogs_armor': '3083',
    'statikk_shiv': '3087',
    'zhonyas_paradox': '3157',
    'steraks_gage': '3053',
    'gargoyle_stoneplate': '3193',
    'bramble_vest': '3076',
    'giant_slayer': '3036'
  };
  if (map[id]) {
    return `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/item/${map[id]}.png`;
  }
  return `https://ui-avatars.com/api/?name=${name.replace(/ /g, '+')}&background=1e293b&color=c7d2fe&bold=true`;
};

