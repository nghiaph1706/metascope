import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Swords, Activity, Trophy, BarChart2 } from 'lucide-react';
import { CHAMPIONS, getChampionImageUrl, getItemImageUrl, ITEMS } from '../data/champions';
import { useLanguage } from '../lib/LanguageContext';

export default function ChampionStatsView() {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'cost' | 'winRate' | 'top4Rate' | 'avgPlace' | 'pickRate'>('winRate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedCost, setSelectedCost] = useState<'All' | 1 | 2 | 3 | 4 | 5>('All');

  // Generate mock stats randomly but deterministically based on champion ID
  const championStats = useMemo(() => {
    return CHAMPIONS.map((champ, i) => {
      // Deterministic pseudo-random seed
      const seed = champ.id.charCodeAt(0) + champ.id.charCodeAt(champ.id.length - 1) + i;
      
      const winRate = (10 + (seed % 15) + (champ.cost * 0.5)).toFixed(1);
      const top4Rate = (45 + (seed % 20) + (champ.cost * 1.5)).toFixed(1);
      const avgPlace = (4.8 - (seed % 10) * 0.05 - (champ.cost * 0.1)).toFixed(2);
      const pickRate = (0.5 + (seed % 25) * 0.2 + (champ.cost * 0.3)).toFixed(1);

      // Best items mock
      const bestItems = [
        ITEMS[seed % 15].id, // Combined items usually
        ITEMS[(seed + 3) % 15].id,
        ITEMS[(seed + 6) % 15].id,
      ];

      return {
        ...champ,
        winRate: parseFloat(winRate),
        top4Rate: parseFloat(top4Rate),
        avgPlace: parseFloat(avgPlace),
        pickRate: parseFloat(pickRate),
        bestItems
      };
    });
  }, []);

  const sortedAndFiltered = useMemo(() => {
    let result = championStats;

    if (selectedCost !== 'All') {
      result = result.filter(c => c.cost === selectedCost);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.traits.some(t => t.toLowerCase().includes(q))
      );
    }

    result = result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [championStats, searchQuery, sortField, sortDir, selectedCost]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const costColors: Record<number, string> = {
    1: 'border-slate-500 bg-slate-500/20 text-slate-300',
    2: 'border-emerald-500 bg-emerald-500/20 text-emerald-400',
    3: 'border-blue-500 bg-blue-500/20 text-blue-400',
    4: 'border-purple-500 bg-purple-500/20 text-purple-400',
    5: 'border-amber-500 bg-amber-500/20 text-amber-400',
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Chỉ Số Tướng' : 'Champion Stats'}</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {lang === 'vi' ? 'Tỉ lệ thắng, trang bị khuyên dùng và xếp hạng thứ bậc cho từng cờ.' : 'Analyze win rates, top 4 placements, and best items for every unit.'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase mr-1">{lang === 'vi' ? 'Giá Vàng:' : 'Cost:'}</span>
          {(['All', 1, 2, 3, 4, 5] as const).map(cost => (
            <button
              key={cost}
              onClick={() => setSelectedCost(cost)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedCost === cost
                  ? 'bg-indigo-600 border border-indigo-500/40 text-white'
                  : 'bg-[#181f32]/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cost === 'All' ? (lang === 'vi' ? 'TẤT CẢ' : 'ALL') : `${cost}G`}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-[#131a2c] rounded-xl border border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all px-3 py-1.5 w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder={lang === 'vi' ? 'Tìm tướng hoặc tộc hệ...' : 'Search champion or trait...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white placeholder-slate-500 text-xs focus:outline-none w-full font-mono"
          />
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-[#111827]/75 border border-slate-800 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-slate-300 min-w-[700px]">
          <thead>
            <tr className="bg-[#172035]/65 border-b border-slate-800/80 font-mono text-slate-400 font-bold tracking-wider uppercase">
              <th className="py-3 px-4 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('cost')}>
                <div className="flex items-center gap-1">
                  {lang === 'vi' ? 'Tướng' : 'Champion'}
                  {sortField === 'cost' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-3 px-4 text-center cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('avgPlace')}>
                <div className="flex items-center justify-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  {lang === 'vi' ? 'Hạng TB' : 'Avg Place'}
                  {sortField === 'avgPlace' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-3 px-4 text-center cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('winRate')}>
                <div className="flex items-center justify-center gap-1 text-emerald-500/80">
                  <Trophy className="w-3.5 h-3.5" />
                  {lang === 'vi' ? 'Top 1 %' : 'Win %'}
                  {sortField === 'winRate' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-3 px-4 text-center cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('top4Rate')}>
                <div className="flex items-center justify-center gap-1 text-indigo-400/80">
                  <BarChart2 className="w-3.5 h-3.5" />
                  Top 4 %
                  {sortField === 'top4Rate' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-3 px-4 text-center cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('pickRate')}>
                <div className="flex items-center justify-center gap-1">
                  {lang === 'vi' ? 'Chọn %' : 'Pick %'}
                  {sortField === 'pickRate' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-3 px-4">{lang === 'vi' ? 'Trang Bị Lõi' : 'Core Items'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/65 font-medium">
            {sortedAndFiltered.map(champ => (
              <tr key={champ.id} className="hover:bg-[#152033]/45 transition-colors group">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 border rounded-lg overflow-hidden bg-slate-800 relative shadow-sm shrink-0 ${costColors[champ.cost]}`}>
                      <img src={getChampionImageUrl(champ.name)} alt={champ.name} className="w-full h-full object-cover scale-[1.2] pb-[1px]" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs group-hover:text-indigo-400 transition-colors uppercase tracking-wide">{champ.name}</p>
                      <div className="flex gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-mono px-1.5 rounded uppercase font-bold border ${costColors[champ.cost]}`}>
                          {champ.cost}G
                        </span>
                        {champ.traits.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="text-[9px] font-mono text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-center font-mono font-bold text-slate-200">#{champ.avgPlace.toFixed(2)}</td>
                <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">{champ.winRate.toFixed(1)}%</td>
                <td className="py-3 px-4 text-center font-mono text-indigo-400 font-bold bg-[#152033]/15">{champ.top4Rate.toFixed(1)}%</td>
                <td className="py-3 px-4 text-center font-mono text-slate-400">{champ.pickRate.toFixed(1)}%</td>
                <td className="py-3 px-4">
                  <div className="flex -space-x-1">
                    {champ.bestItems.map((item, i) => {
                      const itemData = ITEMS.find(it => it.id === item);
                      const itemName = itemData ? itemData.name : item;
                      return (
                        <div key={i} className="w-6 h-6 rounded border border-slate-700 bg-slate-800 overflow-hidden relative shadow-sm" title={itemName}>
                           <img src={getItemImageUrl(item, itemName)} alt={itemName} className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedAndFiltered.length === 0 && (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            {lang === 'vi' ? 'Không tìm thấy tướng nào!' : 'No champions matched your search.'}
          </div>
        )}
      </div>
    </div>
  );
}
