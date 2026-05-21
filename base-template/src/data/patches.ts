import { PatchNote } from '../types';

export const PATCH_NOTES: PatchNote[] = [
  {
    version: '14.6',
    title: 'Patch Notes 14.6: Porcelain & Arcanist Tuning',
    releaseDate: 'May 18, 2026',
    summary: 'Patch 14.6 introduces significant adjustments to Porcelain traits, reducing their raw damage reduction while boosting lower Arcanist brackets to smooth out early stage transits. A handful of 3-cost champions have been restructured to incentivize rerolling strategies.',
    items: [
      {
        id: 'p_001',
        name: 'Porcelain Trait',
        type: 'nerf',
        category: 'trait',
        desc: 'Damage reduction reduced from 20/35/60% to 15/30/55%. Attack Speed reduced accordingly.',
        impactTips: 'This curbs the dominant vertical Porcelain Ashe setups slightly, opening slots for Dragonlord and Fated flex options.'
      },
      {
        id: 'p_002',
        name: 'Arcanist Trait',
        type: 'buff',
        category: 'trait',
        desc: 'Ability power granted to Arcanists increased from 20/45/80/125 to 20/50/85/135.',
        impactTips: 'Directly buffs the early 4-Arcanist transitions. Vertical Arcanist Comps like Infinite Sorcerers gain substantial power spikes.'
      },
      {
        id: 'p_003',
        name: 'Syndra',
        type: 'buff',
        category: 'champion',
        desc: 'Mana pool adjusted from 0/40 to 0/35. Base health increased from 700 to 750.',
        impactTips: 'Syndra casts much quicker now, enabling higher damage capabilities. A premier carry choice for AP vertical rosters.'
      },
      {
        id: 'p_004',
        name: 'Gnar',
        type: 'adjust',
        category: 'champion',
        desc: 'Dryad health gain per unit death scaled down slightly. Base AD increased by 5.',
        impactTips: 'This stabilizes Gnar\'s early game pressure while keeping his super-lategame status reasonably balanced.'
      },
      {
        id: 'p_005',
        name: 'Jeweled Gauntlet',
        type: 'nerf',
        category: 'item',
        desc: 'AP granted reduced from 30 to 25. Critical strike chance increased from 15% to 20%.',
        impactTips: 'A shift towards reliability over sheer burst payload.'
      }
    ]
  }
];
