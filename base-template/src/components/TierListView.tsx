import React, { useState, useMemo } from 'react';
import { Layers, SlidersHorizontal, Search, Award, HelpCircle, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';
import { Composition, Tier } from '../types';
import { ITEMS, ItemData, getChampionImageUrl, getItemImageUrl } from '../data/champions';
import { useLanguage } from '../lib/LanguageContext';

interface TierListViewProps {
  comps: Composition[];
  onSelectComp: (comp: Composition) => void;
  onNavigate: (view: string) => void;
}

export default function TierListView({ comps, onSelectComp, onNavigate }: TierListViewProps) {
  const [activeTab, setActiveTab] = useState<'comps' | 'items'>('comps');
  
  const [selectedTier, setSelectedTier] = useState<Tier | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { lang, t } = useLanguage();

  // Filtering comps
  const filteredComps = useMemo(() => {
    return comps.filter(comp => {
      const matchTier = selectedTier === 'All' || comp.tier === selectedTier;
      const matchDiff = selectedDifficulty === 'All' || comp.difficulty === selectedDifficulty;
      const matchText = searchQuery === '' || 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.traits.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        comp.carryChampions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchTier && matchDiff && matchText;
    });
  }, [comps, selectedTier, selectedDifficulty, searchQuery]);

  // Filtering items
  const filteredItems = useMemo(() => {
    return ITEMS.filter(item => {
      const matchTier = selectedTier === 'All' || item.tier === selectedTier;
      const matchText = searchQuery === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchTier && matchText;
    });
  }, [selectedTier, searchQuery]);

  // Sorcerers / Fated backgrounds helper
  const getTierStyle = (tier: Tier) => {
    switch (tier) {
      case 'S': return 'bg-pink-500/15 text-pink-400 border border-pink-500/25 shadow-pink-500/5';
      case 'A': return 'bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-amber-500/5';
      case 'B': return 'bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-blue-500/5';
      case 'C': return 'bg-slate-500/15 text-slate-400 border border-slate-500/25';
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-black text-white tracking-widest uppercase">{t.tierMetaTitle}</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {t.tierMetaSub}
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>{lang === 'vi' ? 'BẢN CẬP NHẬT GẦN NHẤT: 2 giờ trước (Bản 14.6)' : 'LAST DEPLOYED UPDATE: 2 hours ago (Patch 14.6)'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-800/60 pb-4">
        <button
          onClick={() => setActiveTab('comps')}
          className={`pb-2 text-sm font-bold tracking-widest uppercase transition-all border-b-2 ${
            activeTab === 'comps' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          {lang === 'vi' ? 'Đội Hình Mẫu' : 'Compositions'}
        </button>
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-2 text-sm font-bold tracking-widest uppercase transition-all border-b-2 ${
            activeTab === 'items' ? 'text-indigo-400 border-indigo-400' : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          {lang === 'vi' ? 'Trang Bị & Ấn' : 'Items & Emblems'}
        </button>
      </div>

      {/* Roster Controls */}
      <div className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Tier filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase mr-1">{lang === 'vi' ? 'Hạng:' : 'Ranks:'}</span>
          {['All', 'S', 'A', 'B', 'C'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier as Tier | 'All')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedTier === tier
                  ? 'bg-indigo-600 border border-indigo-500/40 text-white'
                  : 'bg-[#181f32]/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {tier === 'All' ? (lang === 'vi' ? 'TẤT CẢ' : 'ALL') : `${tier}-TIER`}
            </button>
          ))}
        </div>

        {/* Other controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          
          {/* Difficulty selectivity */}
          {activeTab === 'comps' && (
            <div className="flex items-center bg-[#131a2c] rounded-xl border border-slate-800 hover:border-slate-600 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all px-3 py-1.5 w-full sm:w-auto">
              <span className="text-[10px] font-mono text-slate-400 uppercase pr-2 border-r border-slate-800 font-bold mr-2">{lang === 'vi' ? 'Khó:' : 'Diff:'}</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-4 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <option value="All" className="bg-[#111827] text-white">{lang === 'vi' ? 'Mọi cấp độ' : 'All Levels'}</option>
                <option value="Easy" className="bg-[#111827] text-white">{lang === 'vi' ? 'Dễ' : 'Easy'}</option>
                <option value="Medium" className="bg-[#111827] text-white">{lang === 'vi' ? 'Trung bình' : 'Medium'}</option>
                <option value="Hard" className="bg-[#111827] text-white">{lang === 'vi' ? 'Khó' : 'Hard'}</option>
              </select>
            </div>
          )}

          {/* Search bar */}
          <div className="flex items-center bg-[#131a2c] rounded-xl border border-slate-800 hover:border-slate-600 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all px-3 py-1.5 w-full sm:w-48 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder={activeTab === 'comps' ? t.tierSearchPlaceholder : (lang === 'vi' ? 'Tìm trang bị...' : 'Search items...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-slate-500 text-xs focus:outline-none w-full font-mono"
            />
          </div>
        </div>

      </div>

      {/* Main Stats Table & Mobile Cards */}
      <div>
        {activeTab === 'comps' && (
          filteredComps.length > 0 ? (
            <>
              {/* Desktop View Table */}
              <div className="hidden md:block bg-[#111827]/75 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full border-collapse text-left text-xs text-slate-300">
                  <thead>
                    <tr className="bg-[#172035]/65 border-b border-slate-800/80 font-mono text-slate-400 font-bold tracking-wider uppercase">
                      <th className="py-3 px-4 text-center w-16">{t.tierColumnTier}</th>
                      <th className="py-3 px-4">{t.tierColumnComp}</th>
                      <th className="py-3 px-4 text-center font-mono">{t.tierColumnAvg}</th>
                      <th className="py-3 px-4 text-center font-mono">{t.tierColumnWin}</th>
                      <th className="py-3 px-4 text-center font-mono font-bold text-white">{t.tierColumnTop4}</th>
                      <th className="py-3 px-4 text-center font-mono text-[11px]">{t.tierColumnPick}</th>
                      <th className="py-3 px-4">{t.tierColumnCarryTank}</th>
                      <th className="py-3 px-4 text-center">{lang === 'vi' ? 'LỰA CHỌN' : 'ACTION'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/65 font-medium">
                    {filteredComps.map((comp) => (
                      <tr
                        key={comp.id}
                        id={`comp-row-${comp.id}`}
                        onClick={() => {
                          onSelectComp(comp);
                          onNavigate('guide_details');
                        }}
                        className="hover:bg-[#152033]/45 transition-colors cursor-pointer group"
                      >
                        {/* Tier badge */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block py-1 rounded-lg text-xs font-black min-w-9 ${getTierStyle(comp.tier)}`}>
                            {comp.tier}
                          </span>
                        </td>
  
                        {/* Meta name / info */}
                        <td className="py-4 px-4 max-w-sm">
                          <div className="space-y-1">
                            <p className="font-bold text-white text-xs group-hover:text-indigo-400 transition-colors">
                              {lang === 'vi' && comp.id === 'c1' ? 'Định Mệnh Syndra Thể Độc Tôn' : 
                               lang === 'vi' && comp.id === 'c2' ? 'Sứ Thanh Hoa Thần Thoại Ashe Gánh Đội' : 
                               lang === 'vi' && comp.id === 'c3' ? 'U Tối Khả Ố Yone Đồ Sát Đấu Trường' : 
                               comp.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                                comp.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                                comp.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                'bg-pink-500/10 text-pink-400'
                              }`}>
                                {comp.difficulty === 'Easy' ? (lang === 'vi' ? 'Dễ' : 'Easy') : comp.difficulty === 'Medium' ? (lang === 'vi' ? 'Trung bình' : 'Medium') : (lang === 'vi' ? 'Khó' : 'Hard')}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">•</span>
                              {comp.traits.slice(0, 2).map((t, idx) => (
                                <span key={idx} className="text-[10px] font-mono text-indigo-300">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
  
                        {/* Placement analytics */}
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-200">
                          #{comp.avgPlace}
                        </td>
  
                        {/* Win percentage */}
                        <td className="py-4 px-4 text-center font-mono text-emerald-400 font-bold">
                          {comp.winRate}%
                        </td>
  
                        {/* Top 4 rate */}
                        <td className="py-4 px-4 text-center font-mono text-indigo-400 font-bold bg-[#152033]/15">
                          {comp.top4Rate}%
                        </td>
  
                        {/* Pick Rates */}
                        <td className="py-4 px-4 text-center font-mono text-slate-400">
                          {comp.pickRate}%
                        </td>
  
                        {/* Primary carries & tanks */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1.5 text-[10px]">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500 font-mono text-[9px] uppercase font-bold">{lang === 'vi' ? 'CHỦ LỰC:' : 'CARRY:'}</span>
                              <div className="flex -space-x-1">
                                {comp.carryChampions.map((c, i) => (
                                  <div key={i} className="w-5 h-5 rounded-full border border-[#111827] bg-slate-800 overflow-hidden relative shadow-[0_0_0_1px_rgba(244,114,182,0.2)]" title={c}>
                                    <img src={getChampionImageUrl(c)} alt={c} className="w-full h-full object-cover scale-[1.2] pb-[1px]" />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-slate-500 font-mono text-[9px] uppercase font-bold">{lang === 'vi' ? 'CHỐNG CHỊU:' : 'TANK:'}</span>
                              <div className="flex -space-x-1">
                                {comp.tankChampions.map((t, i) => (
                                  <div key={i} className="w-5 h-5 rounded-full border border-[#111827] bg-slate-800 overflow-hidden relative shadow-[0_0_0_1px_rgba(45,212,191,0.2)]" title={t}>
                                    <img src={getChampionImageUrl(t)} alt={t} className="w-full h-full object-cover scale-[1.2] pb-[1px]" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
  
                        {/* Actions button */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#1c2842] group-hover:bg-indigo-600 border border-slate-800 text-slate-400 group-hover:text-white transition-all">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
  
              {/* Mobile Touch-Friendly Card View */}
              <div className="block md:hidden space-y-4">
                {filteredComps.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => {
                      onSelectComp(comp);
                      onNavigate('guide_details');
                    }}
                    className="bg-[#111827]/85 border border-[#1e293b] rounded-2xl p-4 space-y-4 shadow-md hover:border-indigo-500/30 transition-all cursor-pointer active:scale-[0.98]"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <h3 className="text-sm font-black text-white uppercase tracking-normal line-clamp-1">
                          {lang === 'vi' && comp.id === 'c1' ? 'Định Mệnh Syndra Thể Độc Tôn' : 
                           lang === 'vi' && comp.id === 'c2' ? 'Sứ Thanh Hoa Thần Thoại Ashe Gánh Đội' : 
                           lang === 'vi' && comp.id === 'c3' ? 'U Tối Khả Ố Yone Đồ Sát Đấu Trường' : 
                           comp.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                            comp.difficulty === 'Easy' ? 'bg-emerald-500/15 text-emerald-400' :
                            comp.difficulty === 'Medium' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-pink-500/15 text-pink-400 font-semibold'
                          }`}>
                            {comp.difficulty === 'Easy' ? (lang === 'vi' ? 'Dễ' : 'Easy') : comp.difficulty === 'Medium' ? (lang === 'vi' ? 'T.Bình' : 'Medium') : (lang === 'vi' ? 'Khó' : 'Hard')}
                          </span>
                          <span className="text-[9px] text-slate-600">•</span>
                          {comp.traits.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="text-[10px] font-mono text-indigo-300 font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
  
                      <span className={`inline-block py-1 px-2.5 rounded-lg text-xs font-black shrink-0 ${getTierStyle(comp.tier)}`}>
                        {comp.tier}-TIER
                      </span>
                    </div>
  
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-4 gap-2 bg-[#172035]/30 border border-slate-800/80 p-2.5 rounded-xl text-center select-none">
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 font-bold uppercase leading-none block">{lang === 'vi' ? 'XẾP HẠNG TB' : 'AVG PLACE'}</span>
                        <span className="text-xs font-bold text-slate-200 block mt-1 font-mono">#{comp.avgPlace}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 font-bold uppercase leading-none block">{lang === 'vi' ? 'THẮNG %' : 'WIN %'}</span>
                        <span className="text-xs font-bold text-emerald-400 block mt-1 font-mono">{comp.winRate}%</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 font-bold uppercase leading-none block">TOP 4 %</span>
                        <span className="text-xs font-bold text-indigo-400 block mt-1 font-mono">{comp.top4Rate}%</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-slate-500 font-bold uppercase leading-none block">TỶ LỆ CHỌN</span>
                        <span className="text-xs font-bold text-slate-400 block mt-1 font-mono">{comp.pickRate}%</span>
                      </div>
                    </div>
  
                    {/* Carries list */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-800/60 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-mono text-[9px] uppercase font-black shrink-0">{lang === 'vi' ? 'GÁNH TEAM:' : 'CARRY:'}</span>
                        <div className="flex -space-x-1">
                          {comp.carryChampions.map((c, i) => (
                            <div key={i} className="w-5 h-5 rounded-full border border-[#111827] bg-slate-800 overflow-hidden relative shadow-[0_0_0_1px_rgba(244,114,182,0.2)]" title={c}>
                              <img src={getChampionImageUrl(c)} alt={c} className="w-full h-full object-cover scale-[1.2] pb-[1px]" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-mono text-[9px] uppercase font-black shrink-0">{lang === 'vi' ? 'CHỐNG CHỊU:' : 'TANK:'}</span>
                        <div className="flex -space-x-1">
                          {comp.tankChampions.map((t, i) => (
                            <div key={i} className="w-5 h-5 rounded-full border border-[#111827] bg-slate-800 overflow-hidden relative shadow-[0_0_0_1px_rgba(45,212,191,0.2)]" title={t}>
                              <img src={getChampionImageUrl(t)} alt={t} className="w-full h-full object-cover scale-[1.2] pb-[1px]" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-[#111827]/75 border border-slate-800 rounded-2xl py-12 text-center text-slate-400 space-y-2 select-none">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-200">{t.tierNoFallback}</p>
              <p className="text-xs">{t.tierAdjustFilters}</p>
            </div>
          )
        )}
        
        {activeTab === 'items' && (
          filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-[#111827]/75 border border-slate-800 rounded-2xl p-4 flex gap-4 hover:border-indigo-500/30 transition-all group">
                  <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-xl shrink-0 flex items-center justify-center font-bold text-[10px] text-slate-400 shadow-inner overflow-hidden relative">
                    <img src={getItemImageUrl(item.id, item.name)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-white">{item.name}</h4>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${getTierStyle(item.tier)}`}>
                        {item.tier}-TIER
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700">
                      {item.type}
                    </span>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#111827]/75 border border-slate-800 rounded-2xl py-12 text-center text-slate-400 space-y-2 select-none">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-200">{lang === 'vi' ? 'Không tìm thấy trang bị nào' : 'No items found'}</p>
              <p className="text-xs">{lang === 'vi' ? 'Hãy thử điều chỉnh bộ lọc tìm kiếm' : 'Try adjusting your search filters'}</p>
            </div>
          )
        )}
      </div>

    </div>
  );
}
