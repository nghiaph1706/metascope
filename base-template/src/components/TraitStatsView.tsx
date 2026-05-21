import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Layers, Activity, Trophy, BarChart2 } from 'lucide-react';
import { TRAITS } from '../data/champions';
import { useLanguage } from '../lib/LanguageContext';

export default function TraitStatsView() {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'winRate' | 'top4Rate' | 'avgPlace' | 'pickRate'>('winRate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Deterministically generate trait stats per breakpoint level
  const traitStats = useMemo(() => {
    const breakpoints = [
      { level: 'Bronze', threshold: 2 },
      { level: 'Silver', threshold: 4 },
      { level: 'Gold', threshold: 6 },
      { level: 'Prismatic', threshold: 8 },
    ];

    const results = [];

    TRAITS.forEach((trait, i) => {
      const seed = trait.length + i;
      
      // Usually traits have 2 to 3-4 breakpoints
      const numBreakpoints = 2 + (seed % 3); 
      
      for(let j=0; j < numBreakpoints; j++) {
        const bp = breakpoints[j];
        const winRateBase = 10 + j * 12 + (seed % 5);
        const top4RateBase = 35 + j * 15 + (seed % 10);
        const avgPlaceBase = 5.2 - j * 0.8 - (seed % 5) * 0.1;
        const pickRateBase = 15 - j * 3 - (seed % 3);

        results.push({
          id: `${trait}-${bp.threshold}`,
          name: trait,
          tierLevel: bp.level,
          count: bp.threshold,
          winRate: Math.min(100, Math.max(0, winRateBase)),
          top4Rate: Math.min(100, Math.max(0, top4RateBase)),
          avgPlace: Math.max(1.0, avgPlaceBase),
          pickRate: Math.max(0.1, pickRateBase)
        });
      }
    });

    return results;
  }, []);

  const sortedAndFiltered = useMemo(() => {
    let result = traitStats;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q));
    }

    result = result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [traitStats, searchQuery, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getTierColor = (tier: string) => {
     switch(tier) {
         case 'Bronze': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
         case 'Silver': return 'text-slate-300 bg-slate-400/10 border-slate-500/20';
         case 'Gold': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
         case 'Prismatic': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
         default: return 'text-slate-400 bg-slate-800/50 border-slate-700/50';
     }
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Thống Kê Tộc Hệ' : 'Trait Stats'}</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {lang === 'vi' ? 'Hiệu suất tỉ lệ thắng dựa trên cấp độ mốc kích hoạt.' : 'Winrate performance and placements per trait synergy breakpoint.'}
          </p>
        </div>

        <div className="flex items-center bg-[#131a2c] rounded-xl border border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all px-3 py-1.5 w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder={lang === 'vi' ? 'Tìm Tộc/Hệ...' : 'Search Trait...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white placeholder-slate-500 text-xs focus:outline-none w-full font-mono"
          />
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-[#111827]/75 border border-slate-800 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-slate-300 min-w-[600px]">
          <thead>
            <tr className="bg-[#172035]/65 border-b border-slate-800/80 font-mono text-slate-400 font-bold tracking-wider uppercase">
              <th className="py-3 px-6">{lang === 'vi' ? 'Tộc Hệ & Mốc' : 'Trait & Synergy'}</th>
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
                  {lang === 'vi' ? 'Tỷ Lệ Mở' : 'Pick Rate'}
                  {sortField === 'pickRate' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/65 font-medium">
            {sortedAndFiltered.map(trait => (
              <tr key={trait.id} className="hover:bg-[#152033]/45 transition-colors group">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-[#172036] border border-slate-700 font-bold uppercase text-[9px] font-mono text-slate-300">
                      {trait.name.substring(0, 3)}
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs group-hover:text-indigo-400 transition-colors tracking-wide">
                        {trait.name}
                      </p>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded font-mono text-[9px] uppercase border font-bold ${getTierColor(trait.tierLevel)}`}>
                        {trait.count} {trait.name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-center font-mono font-bold text-slate-200">#{trait.avgPlace.toFixed(2)}</td>
                <td className="py-4 px-4 text-center font-mono text-emerald-400 font-bold">{trait.winRate.toFixed(1)}%</td>
                <td className="py-4 px-4 text-center font-mono text-indigo-400 font-bold bg-[#152033]/15">{trait.top4Rate.toFixed(1)}%</td>
                <td className="py-4 px-4 text-center font-mono text-slate-400">{trait.pickRate.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedAndFiltered.length === 0 && (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            {lang === 'vi' ? 'Không tìm thấy tộc hệ nào!' : 'No traits matched your search.'}
          </div>
        )}
      </div>
    </div>
  );
}
