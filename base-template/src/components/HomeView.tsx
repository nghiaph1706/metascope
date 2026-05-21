import React, { useState } from 'react';
import { Search, TrendingUp, Compass, Swords, Shield, Heart, Zap, Award, Flame, ChevronRight, MessageSquareCode, Percent, Laptop, Trophy, Sliders, Sparkles, BookOpen, Clock, Activity, Cpu, HelpCircle, User } from 'lucide-react';
import { motion } from 'motion/react';
import { Composition } from '../types';
import { getChampionImageUrl, getItemImageUrl } from '../data/champions';
import { useLanguage } from '../lib/LanguageContext';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  comps: Composition[];
  onSelectComp: (comp: Composition) => void;
  summonerQuery: string;
  setSummonerQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
}

export default function HomeView({
  onNavigate,
  comps,
  onSelectComp,
  summonerQuery,
  setSummonerQuery,
  onSearchSubmit
}: HomeViewProps) {
  const [selectedRegion, setSelectedRegion] = useState('VN');
  const { lang, t } = useLanguage();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (summonerQuery.trim()) {
      onSearchSubmit(summonerQuery);
      onNavigate('player_stats');
    }
  };

  // Top 3 popular comps
  const popularComps = comps.filter(c => c.tier === 'S' || c.tier === 'A').slice(0, 3);

  // Trending synergies
  const trendingSynergies = [
    { name: 'Fated Vertical', winRate: '56.4%', delta: '+12.4%', state: 'up', desc: lang === 'vi' ? 'Hiệu ứng Định Mệnh Syndra gánh team cực mạnh' : 'High vertical synergy centered on Syndra carry' },
    { name: 'Arcanist Mage', winRate: '58.2%', delta: '+8.6%', state: 'up', desc: lang === 'vi' ? 'Kích hoạt mốc cao Pháp Sư phóng phép dồn sát thương' : 'Burst AP setups scaling with mid-game power spikes' },
    { name: 'Sage Dragonlord', winRate: '52.1%', delta: '+4.2%', state: 'up', desc: lang === 'vi' ? 'Đội hình Hiền Giả tăng hút máu và hồi năng lượng' : 'End-game board featuring flex legendary frontline units' },
    { name: 'Porcelain Sniper', winRate: '50.1%', delta: '-3.8%', state: 'down', desc: lang === 'vi' ? 'Sứ Thanh Hoa giảm mốc chống chịu gián tiếp' : 'Durable backline snipers dealing armor shred damage' }
  ];

  // Spotlighted Champions
  const spotlightChamps = [
    { id: 'syndra', name: 'Syndra', cost: 4, traits: ['Fated', 'Arcanist'], tierRating: 'S+', winRate: '16.5%' },
    { id: 'diana', name: 'Diana', cost: 3, traits: ['Dragonlord', 'Sage'], tierRating: 'S', winRate: '14.2%' },
    { id: 'ashe', name: 'Ashe', cost: 4, traits: ['Porcelain', 'Sniper'], tierRating: 'A+', winRate: '12.8%' }
  ];

  // Spotlighted Items
  const spotlightItems = [
    { id: 'guinsoos_rageblade', name: "Guinsoo's Rageblade", recipe: ['recurve_bow', 'needlessly_large_rod'], desc: lang === 'vi' ? '+5% Tốc độ đánh cộng dồn vô hạn' : 'Infinite stacking attack speed per hit' },
    { id: 'shojin', name: "Spear of Shojin", recipe: ['bf_sword', 'tear_of_the_goddess'], desc: lang === 'vi' ? 'Tăng thêm 5 năng lượng mỗi đòn đánh' : 'Bonus mana gain per physical strike' }
  ];

  // Level odds preview values
  const rollingOddsSample = [
    { level: 7, 1: '19%', 2: '30%', 3: '35%', 4: '15%', 5: '1%' },
    { level: 8, 1: '18%', 2: '25%', 3: '32%', 4: '22%', 5: '3%' },
    { level: 9, 1: '10%', 2: '20%', 3: '25%', 4: '35%', 5: '10%' }
  ];

  // Top 3 Leaderboard mock players
  const topChallengers = [
    { rank: 1, name: 'Hide on bush', server: 'KR', lp: '1,894 LP', winRate: '21.5%', hot: true },
    { rank: 2, name: 'EliteTactician', server: 'NA', lp: '1,745 LP', winRate: '18.9%', hot: true },
    { rank: 3, name: 'TFT_Scouter', server: 'VN', lp: '1,680 LP', winRate: '19.2%', hot: false }
  ];

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none font-sans">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-radial from-indigo-950/20 via-[#070b13] to-[#070b13] border border-slate-800/80 px-6 py-12 md:py-16 text-center shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Glow Spheres */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 font-mono text-[10px] tracking-widest font-bold uppercase">
            <Flame className="w-3 h-3 text-pink-500 animate-bounce" />
            MetaScope Live Datastream Synced • Patch 14.6
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">
            {lang === 'vi' ? 'Đấu Trường' : 'Decipher'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">{lang === 'vi' ? 'Huyền Thoại Chân Lý' : 'The TFT Meta'}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            {t.homeHeroSub}
          </p>

          {/* Summoner Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto bg-[#111827]/90 p-1.5 rounded-2xl border border-slate-800 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/10 shadow-2xl mt-4 transition-all duration-300">
            <div className="flex items-center gap-2 px-3 border-b sm:border-b-0 sm:border-r border-slate-800 py-1.5">
              <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-widest uppercase">REG</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-1 hover:text-indigo-300 transition-colors"
              >
                <option value="VN" className="bg-[#111827] text-white">VN</option>
                <option value="KR" className="bg-[#111827] text-white">KR</option>
                <option value="NA" className="bg-[#111827] text-white">NA</option>
                <option value="EUW" className="bg-[#111827] text-white">EUW</option>
              </select>
            </div>
            
            <div className="flex-1 flex items-center px-2 relative py-1.5 sm:py-0">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder={lang === 'vi' ? 'Tìm Cao Thủ (ví dụ: Hide on bush #KR1)...' : 'Search Challenger (e.g., Hide on bush #KR1)...'}
                value={summonerQuery}
                onChange={(e) => setSummonerQuery(e.target.value)}
                className="w-full bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>
            
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-lg shadow-indigo-600/15 shrink-0"
            >
              {lang === 'vi' ? 'Tra Cứu' : 'Analyze'}
            </button>
          </form>

          {/* Quick Targets / Examples */}
          <div className="text-[10px] text-slate-500 flex flex-wrap items-center justify-center gap-2 font-mono">
            <span>{lang === 'vi' ? 'Hồ sơ mẫu xếp hạng:' : 'Click to instantly search:'}</span>
            <button
              type="button"
              onClick={() => { setSummonerQuery('Hide on bush #KR1'); onSearchSubmit('Hide on bush #KR1'); onNavigate('player_stats'); }}
              className="text-indigo-400 hover:text-white underline"
            >
              Hide on bush #KR1
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setSummonerQuery('EliteTactician #NA1'); onSearchSubmit('EliteTactician #NA1'); onNavigate('player_stats'); }}
              className="text-indigo-400 hover:text-white underline"
            >
              EliteTactician #NA1
            </button>
          </div>
        </div>
      </div>

      {/* Main Unified Bento Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Core Tools Division (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section Heading: Trending Comps */}
          <div className="flex justify-between items-center sm:pb-1">
            <div className="flex items-center gap-2">
              <Swords className="w-4.5 h-4.5 text-indigo-400" />
              <h2 className="text-sm font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Đội Hình Meta Đang Hot' : 'Trending S-Tier Comps'}</h2>
            </div>
            <button
              onClick={() => onNavigate('tier_list')}
              className="text-[11px] text-indigo-400 hover:text-white flex items-center gap-0.5 tracking-wider font-mono uppercase transition-colors"
            >
              {lang === 'vi' ? 'Xem đầy đủ' : 'View full Tier List'} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Comps Cards Matrix (Grid of 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularComps.map((comp, index) => (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => {
                  onSelectComp(comp);
                  onNavigate('guide_details');
                }}
                className="bg-[#111827]/70 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-4 cursor-pointer group active:scale-98 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/[0.02] rounded-bl-full pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider border ${
                      comp.tier === 'S' ? 'bg-pink-500/15 text-pink-400 border-pink-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                    }`}>
                      {comp.tier}-TIER
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">{lang === 'vi' ? 'Tỉ Lệ' : 'Win'} {comp.winRate}%</span>
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {comp.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                </div>
                
                <div className="mt-4 border-t border-slate-800/60 pt-3 flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {comp.carryChampions.slice(0, 3).map((c, i) => (
                      <div key={i} className="w-6.5 h-6.5 rounded-full border border-[#111827] bg-slate-800 overflow-hidden relative shadow-md" title={c}>
                        <img src={getChampionImageUrl(c)} alt={c} className="w-full h-full object-cover scale-[1.2] pb-[2px]" />
                      </div>
                    ))}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Informational Bento Widgets inside Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Level Roll Odds Instant Widget */}
            <div
              onClick={() => onNavigate('rolling_odds')}
              className="bg-[#111827]/70 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-4.5 cursor-pointer flex flex-col justify-between group active:scale-[0.99] transition-all shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-400">
                    <Percent className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-widest uppercase">{lang === 'vi' ? 'Xem Tỉ Lệ Cuộn Tướng' : 'Champion Level Odds'}</span>
                  </div>
                  <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">TFT Set 11</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {lang === 'vi' ? 'Bản tóm tắt xác suất lăn tướng theo cấp. Tối ưu thời điểm lên cấp 7, 8, 9.' : 'Instant chart showing probabilities. Master optimal leveling phases to roll for 4-cost and 5-cost champions.'}
                </p>

                {/* Micro Level Stats Grid */}
                <div className="bg-[#090e16] border border-slate-850 rounded-xl p-2.5 font-mono text-[10px] mt-2 space-y-1">
                  <div className="grid grid-cols-6 border-b border-slate-800/60 pb-1 text-slate-500 font-bold uppercase">
                    <div>LV</div>
                    <div className="text-center text-slate-400">1g</div>
                    <div className="text-center text-green-400">2g</div>
                    <div className="text-center text-blue-400">3g</div>
                    <div className="text-center text-purple-400">4g</div>
                    <div className="text-center text-amber-400">5g</div>
                  </div>
                  {rollingOddsSample.slice(1, 3).map((row, idx) => (
                    <div key={idx} className="grid grid-cols-6 py-0.5 text-slate-300 font-bold">
                      <div className="text-indigo-400 font-bold">Lv {row.level}</div>
                      <div className="text-center text-slate-500">{row[1]}</div>
                      <div className="text-center text-slate-500">{row[2]}</div>
                      <div className="text-center text-slate-400">{row[3]}</div>
                      <div className="text-center text-purple-400">{row[4]}</div>
                      <div className="text-center text-amber-400">{row[5]}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between text-[10px] font-mono font-bold text-indigo-400">
                <span className="uppercase">{lang === 'vi' ? 'Vận hành xác suất roll' : 'Open Odds Calculator'}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Item Cheat Sheet Mini Widget */}
            <div
              onClick={() => onNavigate('items_view')}
              className="bg-[#111827]/70 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-4.5 cursor-pointer flex flex-col justify-between group active:scale-[0.99] transition-all shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-indigo-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold tracking-widest uppercase">{lang === 'vi' ? 'Thư Viện Ghép Trang Bị' : 'TFT Items Cheat Sheet'}</span>
                  </div>
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold">HOT RECIPES</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {lang === 'vi' ? 'Công thức tổng hợp các trang bị lớn trấn phái cho tướng gánh kèo tốt nhất.' : 'View formulas and item stats. Master core item combinations for high vertical board winrates.'}
                </p>

                {/* Spotlights item recipes list */}
                <div className="bg-[#090e16] border border-slate-850 rounded-xl p-2.5 space-y-2 text-[10px] mt-2">
                  {spotlightItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={getItemImageUrl(item.id, item.name)} alt={item.name} className="w-5 h-5 rounded border border-slate-700" />
                        <span className="font-bold text-slate-200">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-slate-400 font-bold bg-[#131a26] px-1.5 py-0.5 rounded border border-slate-800">
                        {item.recipe.map((mat, mIdx) => (
                          <div key={mIdx} className="flex items-center">
                            {mIdx > 0 && <span className="mx-1 text-slate-600">+</span>}
                            <img src={getItemImageUrl(mat, mat)} alt={mat} className="w-3.5 h-3.5 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between text-[10px] font-mono font-bold text-indigo-400">
                <span className="uppercase">{lang === 'vi' ? 'Hiển thị sách ghép đồ' : 'Explore Item recipes'}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

          {/* Premium Utility Row */}
          <div className="bg-gradient-to-br from-[#101726]/60 to-[#0b101b] border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[9px] tracking-wider uppercase font-extrabold mb-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                MetaScope Live Combat Scouter
              </div>
              <h3 className="text-sm font-bold text-white">{lang === 'vi' ? 'Hộc Phép Đồng Bộ Hoạt Động Phòng Đấu' : 'Combat Scouting Companion Panel'}</h3>
              <p className="text-[11px] text-slate-400 max-w-xl mt-1.5 leading-relaxed">
                {lang === 'vi' ? 'Phân tích sảnh đấu thời thực để tìm hiểu lịch sử đấu bài, tỉ lệ Top 4 và rủi ro các đối thủ của bạn, giúp cải thiện xếp hạng trong ván chơi.' 
                              : 'Sync and scan active match lobbies. Instantly trace combat traits, view player stats on your boards, and view advanced win chance prediction feeds.'}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => onNavigate('live_tracker')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-colors active:scale-95 flex items-center gap-1 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                {lang === 'vi' ? 'Mở Trình Săn Phòng Đấu' : 'Sync Active Match Live'}
              </button>
              
              <button
                onClick={() => onNavigate('post_game')}
                className="bg-[#131d33] hover:bg-[#1b2847] border border-slate-700/80 text-white font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-colors active:scale-95 flex items-center gap-1"
              >
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                {lang === 'vi' ? 'Chạy Phân Tích AI' : 'Play AI Post-Game Analyst'}
              </button>
              
              <button
                onClick={() => onNavigate('creator_hub')}
                className="bg-transparent hover:bg-slate-800/40 text-slate-300 hover:text-white font-bold text-[10px] tracking-wider uppercase px-4 py-2 rounded-xl transition-colors active:scale-95 flex items-center gap-0.5"
              >
                <span>{lang === 'vi' ? 'Trung tâm Cẩm Nang' : 'Creator Sandbox Hub'}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

        </div>

        {/* Sidebar Space (1 Col) */}
        <div className="space-y-6">
          
          {/* Patch Focus Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">{lang === 'vi' ? 'Tiêu Điểm Bản Cập Nhật' : 'Patch Spotlight'}</h3>
            <div
              onClick={() => onNavigate('patch_notes')}
              className="bg-[#111827]/70 border border-slate-800 hover:border-indigo-500/30 rounded-2xl p-5 cursor-pointer relative overflow-hidden group hover:scale-[1.01] transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/5 rounded-bl-full pointer-events-none" />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-[9px] font-mono font-bold text-pink-400 tracking-wider">
                    VERS 14.6
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold">May 19, 2026</span>
                </div>
                
                <h4 className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors">
                  {lang === 'vi' ? 'Pháp Sư thăng tiến sát thương, giảm lực mốc Sứ Thanh Hoa.' : 'Arcanist AP Boosted, Porcelain Nerfed!'}
                </h4>
                
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  {lang === 'vi' ? 'Lượng SMPT đầu ra của Pháp Sư pháp kích được tăng nhẹ, trong khi chỉ số phòng ngự mốc Sứ Thanh Hoa bị nerf tương đối ổn định.' : 'Porcelain damage reduction values scaling are dialed down, while lower tier Arcanist ability power bonuses received early-stage calibrations.'}
                </p>

                <div className="text-[9px] font-mono text-indigo-400 font-extrabold flex items-center gap-0.5 uppercase pt-1">
                  {lang === 'vi' ? 'Theo Dõi Thay Đổi' : 'Explore Patch Impact'} <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Top Challenger Leaderboard Widget */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">{lang === 'vi' ? 'Bá Chủ Sảnh Đấu' : 'Top ELO Challengers'}</h3>
            <div className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="divide-y divide-slate-800/60 font-sans">
                {topChallengers.map((player) => (
                  <div key={player.rank} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                        player.rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        player.rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                        'bg-orange-500/10 text-orange-400'
                      }`}>
                        #{player.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white leading-none hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => { setSummonerQuery(`${player.name}#${player.server}1`); onSearchSubmit(`${player.name}#${player.server}1`); onNavigate('player_stats'); }}>
                            {player.name}
                          </p>
                          <span className="text-[8px] bg-slate-800 px-1 py-0.2 rounded text-slate-400 font-mono">{player.server}</span>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1 font-medium select-none">{player.lp}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] font-mono font-bold text-slate-300">{lang === 'vi' ? 'TL Thắng' : 'WinRate'} {player.winRate}</p>
                      {player.hot && <span className="inline-flex text-[8px] font-mono tracking-widest text-pink-400 uppercase font-bold animate-pulse">HOT</span>}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => onNavigate('leaderboard')}
                className="w-full bg-[#151f33] hover:bg-[#1c2c4a] text-slate-300 hover:text-white_badge text-[10px] tracking-widest font-mono font-bold uppercase py-2 rounded-xl transition-all border border-slate-800/80 active:scale-95"
              >
                {lang === 'vi' ? 'Xem Bảng Xếp Hạng Đầy Đủ' : 'View Leaderboard'}
              </button>
            </div>
          </div>

          {/* Trending Synergies Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">{lang === 'vi' ? 'Hệ Tộc Xu Hướng' : 'Vertical Overviews'}</h3>
              <TrendingUp className="w-4 h-4 text-slate-500" />
            </div>
            
            <div className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80 shadow-md">
              {trendingSynergies.map((trend, index) => (
                <div key={index} className="py-2.5 flex items-start justify-between first:pt-0 last:pb-0 gap-3">
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-white">
                      {lang === 'vi' && trend.name === 'Fated Vertical' ? 'Định Mệnh Lục Giác' : 
                       lang === 'vi' && trend.name === 'Arcanist Mage' ? 'Pháp Sư Dồn SMPT' : 
                       lang === 'vi' && trend.name === 'Sage Dragonlord' ? 'Hiền Giả Long Vương' : 
                       lang === 'vi' && trend.name === 'Porcelain Sniper' ? 'Xạ Thủ Sứ Thanh Hoa' : trend.name}
                    </h5>
                    <p className="text-[9px] text-slate-400 leading-normal line-clamp-1">{trend.desc}</p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-bold text-white">{trend.winRate}</p>
                    <span className={`inline-flex items-center text-[9px] font-mono font-bold ${
                      trend.state === 'up' ? 'text-emerald-400' : 'text-pink-400'
                    }`}>
                      {trend.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
