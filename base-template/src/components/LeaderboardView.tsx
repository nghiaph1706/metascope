import React, { useState, useMemo } from 'react';
import { Trophy, Search, ChevronDown, ChevronUp, Globe, Activity, Award } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface LeaderboardEntry {
  rank: number;
  summonerName: string;
  tagLine: string;
  lp: number;
  winRate: number;
  top4Rate: number;
  matchesPlayed: number;
  tier: string;
}

export default function LeaderboardView() {
  const { lang } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState<'Global' | 'KR' | 'NA' | 'EUW' | 'VN'>('Global');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof LeaderboardEntry>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Deterministically generate a mock leaderboard
  const generatedLeaderboard = useMemo(() => {
    const list: LeaderboardEntry[] = [];
    const prefixes = ['T1', 'EDG', 'RNG', 'G2', 'C9', 'Liquid', 'TSM', 'FNC', 'GEN', 'DK', 'DRX'];
    const names = ['Faker', 'ShowMaker', 'Chovy', 'Ruler', 'Deft', 'Viper', 'Caps', 'Perkz', 'Doublelift', 'Bjergsen', 'Levi', 'SofM'];
    
    // Create 150 entries
    for (let i = 1; i <= 150; i++) {
       const prefixIdx = (i * 13) % prefixes.length;
       const nameIdx = (i * 7) % names.length;
       const name = `${prefixes[prefixIdx]} ${names[nameIdx]} ${i}`;
       
       let region: 'KR'|'NA'|'EUW'|'VN' = 'KR';
       if (i % 4 === 1) region = 'NA';
       else if (i % 4 === 2) region = 'EUW';
       else if (i % 4 === 3) region = 'VN';

       list.push({
         rank: 0, // Assigned later
         summonerName: name,
         tagLine: region === 'VN' ? 'VN2' : `${region}1`,
         lp: Math.floor(2500 - Math.log(i) * 300), // Logarithmic LP distribution
         winRate: parseFloat((12 + (i % 15) * 0.5 + 4).toFixed(1)),
         top4Rate: parseFloat((50 + (i % 25) * 0.8).toFixed(1)),
         matchesPlayed: 150 + (i * 11) % 400,
         tier: i <= 50 ? 'Challenger' : i <= 110 ? 'Grandmaster' : 'Master'
       });
    }

    // Sort by LP descending
    return list.sort((a, b) => b.lp - a.lp).map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = generatedLeaderboard;

    if (selectedRegion !== 'Global') {
      result = result.filter(r => r.tagLine.includes(selectedRegion));
      // Re-rank for the region
      result = result.map((r, i) => ({ ...r, rank: i + 1 }));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.summonerName.toLowerCase().includes(q) || 
        r.tagLine.toLowerCase().includes(q)
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
  }, [generatedLeaderboard, selectedRegion, searchQuery, sortField, sortDir]);

  const toggleSort = (field: keyof LeaderboardEntry) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827]/70 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-widest uppercase">
              {lang === 'vi' ? 'Bảng Xếp Hạng' : 'Leaderboard'}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'vi' ? 'Top những kỳ thủ xuất sắc nhất toàn cầu.' : 'Top ranked players across all regions.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center bg-[#131a2c] rounded-xl border border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all px-3 py-2 w-full sm:w-auto">
            <Globe className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as any)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-4 hover:text-indigo-300 transition-colors"
            >
              <option value="Global" className="bg-[#111827] text-white">GLOBAL RECORD</option>
              <option value="KR" className="bg-[#111827] text-white">KOREA</option>
              <option value="NA" className="bg-[#111827] text-white">NORTH AMERICA</option>
              <option value="EUW" className="bg-[#111827] text-white">EUROPE WEST</option>
              <option value="VN" className="bg-[#111827] text-white">VIETNAM</option>
            </select>
          </div>

          <div className="flex items-center bg-[#131a2c] rounded-xl border border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all px-3 py-2 w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder={lang === 'vi' ? 'Tìm người chơi...' : 'Search player...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-slate-500 text-xs focus:outline-none w-full font-mono"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/75 border border-slate-800 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-slate-300 min-w-[700px]">
          <thead>
            <tr className="bg-[#172035]/65 border-b border-slate-800/80 font-mono text-slate-400 font-bold tracking-wider uppercase">
              <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors w-24 text-center" onClick={() => toggleSort('rank')}>
                <div className="flex items-center justify-center gap-1">
                  #
                  {sortField === 'rank' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-4 px-6 cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('summonerName')}>
                <div className="flex items-center gap-1">
                  {lang === 'vi' ? 'Kỳ Thủ' : 'Summoner'}
                  {sortField === 'summonerName' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-4 px-6 text-center cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('lp')}>
                <div className="flex items-center justify-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  LP
                  {sortField === 'lp' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-4 px-6 text-center cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('winRate')}>
                <div className="flex items-center justify-center gap-1 text-emerald-500/80">
                  {lang === 'vi' ? 'Thắng %' : 'Win %'}
                  {sortField === 'winRate' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-4 px-6 text-center cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('top4Rate')}>
                <div className="flex items-center justify-center gap-1 text-indigo-400/80">
                  <Activity className="w-3.5 h-3.5" />
                  Top 4 %
                  {sortField === 'top4Rate' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-4 px-6 text-center cursor-pointer hover:text-white transition-colors" onClick={() => toggleSort('matchesPlayed')}>
                <div className="flex items-center justify-center gap-1">
                  {lang === 'vi' ? 'Số Trận' : 'Matches'}
                  {sortField === 'matchesPlayed' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/65 font-medium">
            {filteredAndSorted.map(entry => (
              <tr key={`${entry.summonerName}-${entry.tagLine}`} className="hover:bg-[#152033]/45 transition-colors group">
                <td className="py-4 px-6 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black font-mono shadow-sm ${
                    entry.rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    entry.rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                    entry.rank === 3 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' :
                    'bg-slate-800/50 text-slate-500 border border-slate-800'
                  }`}>
                    {entry.rank}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{entry.summonerName}</span>
                      <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 rounded uppercase">
                        #{entry.tagLine}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold mt-1 inline-block uppercase tracking-wider text-amber-400/80">
                      {entry.tier}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center font-mono font-black text-amber-400 tracking-wider">
                  {entry.lp.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-center font-mono text-emerald-400 font-bold">{entry.winRate.toFixed(1)}%</td>
                <td className="py-4 px-6 text-center font-mono text-indigo-400 font-bold bg-[#152033]/15">{entry.top4Rate.toFixed(1)}%</td>
                <td className="py-4 px-6 text-center font-mono text-slate-400">{entry.matchesPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAndSorted.length === 0 && (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            {lang === 'vi' ? 'Không tìm thấy kết quả nào mong muốn.' : 'No players found matching your criteria.'}
          </div>
        )}
      </div>
    </div>
  );
}
