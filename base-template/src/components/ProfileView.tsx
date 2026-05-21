import React, { useState, useEffect } from 'react';
import { User, Award, ShieldAlert, Swords, Heart, Zap, Play, Search, TrendingUp, ChevronDown, ChevronUp, Clock, Grid, BarChart3, HelpCircle, Lock, Activity } from 'lucide-react';
import { PlayerProfile, GameMatch, MatchPlayer } from '../types';
import { CHAMPIONS, getChampionImageUrl } from '../data/champions';
import { useLanguage } from '../lib/LanguageContext';

interface ProfileViewProps {
  profile: PlayerProfile;
  onNavigate: (view: string) => void;
  summonerSearchQuery: string;
  setSummonerSearchQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  profilesList: PlayerProfile[];
  onSelectProfile: (profile: PlayerProfile) => void;
  isAuthenticated?: boolean;
  onUpgrade?: () => void;
  isLoading?: boolean;
}

export default function ProfileView({
  profile,
  onNavigate,
  summonerSearchQuery,
  setSummonerSearchQuery,
  onSearchSubmit,
  profilesList,
  onSelectProfile,
  isAuthenticated = false,
  onUpgrade,
  isLoading = false
}: ProfileViewProps) {
  const { lang, t } = useLanguage();
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'lobby' | 'combat' | 'synergy'>('lobby');

  // Trigger skeleton loader artificially if isLoading prop updates
  const [internalLoading, setInternalLoading] = useState(isLoading);

  useEffect(() => {
    setInternalLoading(isLoading);
  }, [isLoading]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (summonerSearchQuery.trim()) {
      onSearchSubmit(summonerSearchQuery);
    }
  };

  const findChampName = (id: string) => {
    const champ = CHAMPIONS.find(c => c.id === id);
    return champ ? champ.name : 'Unknown';
  };

  // Helper: LP graph coordinates
  const lpPoints = profile.lpHistory;
  const lpMax = Math.max(...lpPoints.map(p => p.lp)) + 50;
  const lpMin = Math.min(...lpPoints.map(p => p.lp)) - 50;
  const chartWidth = 600;
  const chartHeight = 150;

  const pointsString = lpPoints.map((p, i) => {
    const x = (i / (lpPoints.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - ((p.lp - lpMin) / (lpMax - lpMin)) * (chartHeight - 40) - 20;
    return `${x},${y}`;
  }).join(' ');

  const getPlacementColor = (placing: number) => {
    switch (placing) {
      case 1: return 'border-amber-500 text-amber-400 bg-amber-500/10';
      case 2: return 'border-slate-300 text-slate-300 bg-slate-300/10';
      case 3: return 'border-orange-600 text-orange-500 bg-orange-600/10';
      case 4: return 'border-indigo-400 text-indigo-400 bg-indigo-400/10';
      default: return 'border-slate-800 text-slate-500 bg-slate-900/40';
    }
  };

  if (internalLoading) {
    return (
      <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none animate-pulse">
        <div className="h-28 bg-[#111827] rounded-3xl border border-slate-800 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 grid grid-cols-2 gap-4">
            {[1,2,3,4].map(idx => <div key={idx} className="h-28 bg-[#111827] rounded-2xl border border-slate-800" />)}
          </div>
          <div className="lg:col-span-2 h-64 bg-[#111827] rounded-3xl border border-slate-800" />
        </div>
        <div className="space-y-4">
          {[1,2,3].map(idx => <div key={idx} className="h-20 bg-[#111827] rounded-3xl border border-slate-800 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Summoner profiling search heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111827]/70 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-indigo-500/20">
            {profile.summonerName[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wide uppercase">{profile.summonerName}</h1>
              <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md font-bold">
                #{profile.tagLine}
              </span>
              <span className="font-mono text-xs text-slate-500">{profile.region}</span>
            </div>
            
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="text-amber-500 font-bold font-mono">{profile.rank === 'Challenger' && lang === 'vi' ? 'Thách Đấu' : profile.rank === 'Grandmaster' && lang === 'vi' ? 'Đại Cao Thủ' : profile.rank} {profile.lp} LP</span>
              <span className="text-slate-500 font-bold">•</span>
              <span className="text-slate-400 font-semibold">{profile.gamesPlayed} {lang === 'vi' ? 'Trận đấu đã chơi' : 'Matches Played'}</span>
            </div>
          </div>
        </div>

        {/* Change profile shortcut / select form */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="bg-[#131a2c] rounded-xl border border-slate-800 hover:border-slate-600 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all px-3 py-2 w-full sm:w-auto">
            <span className="text-[10px] text-slate-400 font-bold font-mono mr-2">{lang === 'vi' ? 'CHUYỂN:' : 'SWAP:'}</span>
            <select
              onChange={(e) => {
                const selected = profilesList.find(p => p.summonerName === e.target.value);
                if (selected) onSelectProfile(selected);
              }}
              value={profile.summonerName}
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer pr-4 hover:text-indigo-300 transition-colors"
            >
              {profilesList.map(p => (
                <option key={p.summonerName} value={p.summonerName} className="bg-[#111827] text-white">
                  {p.summonerName} #{p.tagLine}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex relative w-full sm:w-60">
            <input
              type="text"
              placeholder={lang === 'vi' ? 'Tìm kỳ thủ...' : 'Search Profile...'}
              value={summonerSearchQuery}
              onChange={(e) => setSummonerSearchQuery(e.target.value)}
              className="w-full bg-[#131a2c] text-white text-xs px-4 py-2 pl-9 rounded-xl border border-slate-800 hover:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </form>
        </div>
      </div>

      {/* Grid: Stat metrics & LP Evolution Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core numbers */}
        <div className="lg:col-span-1 grid grid-cols-2 gap-4">
          <div className="bg-[#111827]/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
            <div className="text-[10px] font-mono leading-none tracking-widest text-slate-500 uppercase font-bold">{lang === 'vi' ? 'TỶ LỆ THẮNG' : 'WIN RATE'}</div>
            <p className="text-3xl font-mono font-black text-emerald-400 mt-2">{profile.winRate}%</p>
            <p className="text-[10px] text-slate-400 mt-1">{lang === 'vi' ? 'Chỉ số lọt top vàng' : 'S-Tier placement index'}</p>
          </div>

          <div className="bg-[#111827]/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
            <div className="text-[10px] font-mono leading-none tracking-widest text-slate-500 uppercase font-bold">{lang === 'vi' ? 'TỶ LỆ TOP 4' : 'TOP 4 RATE'}</div>
            <p className="text-3xl font-mono font-black text-indigo-400 mt-2">{profile.top4Rate}%</p>
            <p className="text-[10px] text-slate-400 mt-1">{lang === 'vi' ? 'Định vị thứ hạng sảnh' : 'Lobby priority hold'}</p>
          </div>

          <div className="bg-[#111827]/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
            <div className="text-[10px] font-mono leading-none tracking-widest text-slate-500 uppercase font-bold">{lang === 'vi' ? 'HẠNG TRUNG BÌNH' : 'AVG PLACEMENT'}</div>
            <p className="text-3xl font-mono font-black text-white mt-2">#{profile.avgPlacement}</p>
            <p className="text-[10px] text-slate-400 mt-1">{lang === 'vi' ? 'Mức tích lũy ổn định' : 'Steady climbing standard'}</p>
          </div>

          <div className="bg-[#111827]/70 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
            <div className="text-[10px] font-mono leading-none tracking-widest text-slate-500 uppercase font-bold">{lang === 'vi' ? 'RANK HIỆN TẠI' : 'ACTIVE RANK'}</div>
            <p className="text-[12px] font-black text-amber-500 mt-3 uppercase tracking-wider">{profile.rank === 'Challenger' && lang === 'vi' ? 'Thách Đấu' : profile.rank === 'Grandmaster' && lang === 'vi' ? 'Đại Cao Thủ' : profile.rank}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-1">{profile.lp} LP Server</p>
          </div>
        </div>

        {/* Dynamic inline SVG LP graph (2/3 width) */}
        <div className="lg:col-span-2 bg-[#111827]/70 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1.5 font-bold">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Tiến Trình Tích Lũy Điểm LP' : 'League Points LP Progression'}</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{lang === 'vi' ? 'BIỂU ĐỒ 10 TRẬN GẦN NHẤT' : 'RECENT 10 GAMES CLIMBING'}</span>
          </div>

          {/* Precision SVG Line Graph */}
          <div className="relative h-40 w-full overflow-hidden select-none">
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="lp-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 1, 2, 3].map((g, idx) => {
                const y = (idx / 3) * (chartHeight - 40) + 20;
                return (
                  <line
                    key={idx}
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke="#1e293b"
                    strokeWidth="0.8"
                    strokeDasharray="4,4"
                  />
                );
              })}

              {/* Area filled */}
              <path
                d={`M 20,${chartHeight - 20} L ${pointsString} L ${chartWidth - 20},${chartHeight - 20} Z`}
                fill="url(#lp-gradient)"
                opacity="0.6"
              />

              {/* The Line trajectory path */}
              <path
                d={`M ${pointsString}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Circle Nodes */}
              {lpPoints.map((p, idx) => {
                const x = (idx / (lpPoints.length - 1)) * (chartWidth - 40) + 20;
                const y = chartHeight - ((p.lp - lpMin) / (lpMax - lpMin)) * (chartHeight - 40) - 20;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#818cf8"
                      stroke="#0f172a"
                      strokeWidth="2.0"
                    />
                    <text
                      x={x}
                      y={y - 10}
                      fill="#e2e8f0"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="font-bold hidden group-hover:block pointer-events-none"
                    >
                      {p.lp} LP
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

      </div>

      {/* Player Insights */}
      <div className="relative">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111827]/70 border border-slate-800 p-6 rounded-3xl ${!isAuthenticated ? 'blur-[8px] pointer-events-none opacity-50' : ''}`}>
          <div className="space-y-3">
             <h3 className="text-xs font-black text-emerald-400 tracking-widest uppercase flex items-center gap-2">
               <Activity className="w-4 h-4" />
               {lang === 'vi' ? 'Điểm Mạnh (AI Phân Tích)' : 'Strengths (AI Insights)'}
             </h3>
             <ul className="text-sm font-medium text-slate-300 space-y-2.5">
               <li className="flex items-start gap-2">
                 <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                 {lang === 'vi' ? 'Tỉ lệ giữ chuỗi thắng ấn tượng (Giai đoạn đầu trận)' : 'High win-streak capitalization (Early Game)'}
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                 {lang === 'vi' ? 'Rất linh hoạt xoay bài quanh khung Đấu Sĩ / Cảnh Vệ' : 'Highly flexible pivoting around Bruiser / Warden core'}
               </li>
             </ul>
          </div>
          <div className="space-y-3">
             <h3 className="text-xs font-black text-red-400 tracking-widest uppercase flex items-center gap-2">
               <ShieldAlert className="w-4 h-4" />
               {lang === 'vi' ? 'Điểm Yếu (Cần Khắc Phục)' : 'Weaknesses (To Improve)'}
             </h3>
             <ul className="text-sm font-medium text-slate-300 space-y-2.5">
               <li className="flex items-start gap-2">
                 <span className="text-red-500 font-bold mt-0.5">✗</span>
                 {lang === 'vi' ? 'Thường để thủng máu nặng vòng 3.1 - 3.3 (Do tham lam lợi tức)' : 'Prone to bleeding out in stages 3.1 - 3.3 (Greedy econ)'}
               </li>
               <li className="flex items-start gap-2">
                 <span className="text-red-500 font-bold mt-0.5">✗</span>
                 {lang === 'vi' ? 'Lỗi bài trí Carry chính ở các vòng cuối (Dễ dính phong kiếm / ám sát)' : 'Carry mispositioning in late stages (Zephyr / Assassin baits)'}
               </li>
             </ul>
          </div>
        </div>

        {/* Lock Overlay */}
        {!isAuthenticated && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0c121f]/40 backdrop-blur-[2px] rounded-3xl rounded-3xl">
             <div className="bg-[#172036] border border-slate-700 shadow-2xl p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
               <Lock className="w-8 h-8 text-amber-500 mb-1" />
               <h4 className="text-lg font-black text-white">{lang === 'vi' ? 'Phân Tích Bằng AI' : 'AI Powered Insights'}</h4>
               <p className="text-sm font-medium text-slate-400 max-w-xs leading-relaxed">
                 {lang === 'vi' ? 'Nâng cấp tài khoản để mở khóa phân tích thuật toán nâng cao.' : 'Upgrade your account to unlock advanced algorithmic analysis.'}
               </p>
               <button onClick={onUpgrade} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-2 rounded-xl text-sm transition-colors mt-2 shadow-lg shadow-amber-500/20">
                 {lang === 'vi' ? 'Nâng Cấp Ngay' : 'Upgrade Now'}
               </button>
             </div>
          </div>
        )}
      </div>

      {/* Match History & Expandable Match Analysis */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 font-bold">
            <Swords className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Nhật Ký Chiến Thích Gần Đây' : 'Combat Match Logs'}</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 hidden md:inline">{lang === 'vi' ? 'NHẤN VÀO TRẬN ĐỂ XEM QUÂN CỜ & TỔNG SÁT THƯƠNG' : 'TAP A LOG TO EXPAND DETAILED MATCH ANALYSIS'}</span>
        </div>

        <div className="space-y-3">
          {profile.matches.map((match) => {
            const isExpanded = expandedMatchId === match.id;
            return (
              <div
                key={match.id}
                className="bg-[#111827]/75 border border-slate-800 rounded-3xl overflow-hidden shadow-xl"
              >
                {/* Horizontal summary row */}
                <div
                  id={`match-summary-${match.id}`}
                  onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Placement medal */}
                    <div className={`w-12 h-12 border-2 rounded-2xl flex flex-col items-center justify-center font-black text-sm select-none ${getPlacementColor(match.placement)}`}>
                      <span className="text-[8px] font-mono tracking-wider">{lang === 'vi' ? 'HẠNG' : 'RANK'}</span>
                      #{match.placement}
                    </div>

                    <div className="space-y-11 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wide">{match.gameMode === 'Ranked TFT' && lang === 'vi' ? 'Xếp Hạng ĐTCL' : match.gameMode}</span>
                        <span className="text-[10px] text-slate-500 font-mono">•</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>
                            {match.timestamp === '1 hour ago' && lang === 'vi' ? '1 giờ trước' : 
                             match.timestamp === '3 hours ago' && lang === 'vi' ? '3 giờ trước' : 
                             match.timestamp === '5 hours ago' && lang === 'vi' ? '5 giờ trước' : 
                             match.timestamp === '1 day ago' && lang === 'vi' ? '1 ngày trước' : 
                             match.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Synergy trait nodes */}
                      <div className="flex flex-wrap items-center gap-1 text-[10px] mt-1">
                        {match.traits.slice(0, 3).map((t, idx) => (
                          <span key={idx} className={`px-1.5 py-0.2 rounded font-mono font-bold text-[9px] ${
                            t.tier === 'prismatic' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/15' :
                            t.tier === 'gold' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {t.count} {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Installed units row */}
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5 overflow-x-auto select-none py-1">
                      {match.units.slice(0, 5).map((unit, idx) => {
                        const champName = findChampName(unit.championId);
                        return (
                          <div key={idx} className="relative group shrink-0" title={champName}>
                            <div className="w-9 h-9 border border-[#1e293b] rounded-lg overflow-hidden bg-slate-800 relative shadow-sm">
                              <img src={getChampionImageUrl(champName)} alt={champName} className="w-full h-full object-cover scale-[1.2]" />
                            </div>
                            {unit.starLevel > 2 && (
                              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-500/90 rounded-full flex items-center justify-center text-[8px] text-black drop-shadow-sm font-black pointer-events-none font-bold">★</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-slate-800 bg-[#141a29]">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Match Analysis panel */}
                {isExpanded && (
                  <div className="bg-[#0f1524] border-t border-slate-800/80 p-5 space-y-5 animate-slide-down">
                    
                    {/* Sub tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-800/65 pb-3">
                      <button
                        onClick={() => setActiveAnalysisTab('lobby')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          activeAnalysisTab === 'lobby'
                            ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Grid className="w-3.5 h-3.5" />
                        {lang === 'vi' ? 'Toàn Cảnh Sảnh Đấu' : 'Lobby Overview'}
                      </button>
                      <button
                        onClick={() => setActiveAnalysisTab('combat')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          activeAnalysisTab === 'combat'
                            ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        {lang === 'vi' ? 'Biểu Đồ Sát Thương' : 'Total Combat Damage'}
                      </button>
                    </div>

                    {/* Tab contents */}
                    {activeAnalysisTab === 'lobby' && (
                      <div className="space-y-3 font-semibold">
                        {match.lobby && match.lobby.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {match.lobby.map((player, pIdx) => (
                              <div key={pIdx} className="bg-[#151c31]/50 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-4">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] font-mono ${getPlacementColor(player.placement)}`}>
                                      {player.placement}
                                    </span>
                                    <p className="text-xs font-bold text-white truncate">{player.summonerName}</p>
                                    <span className="text-[9px] font-mono text-slate-500">{lang === 'vi' ? 'Cấp' : 'Lvl'} {player.level}</span>
                                  </div>

                                  <div className="flex flex-wrap gap-1 text-[8px] font-mono select-none">
                                    {player.activeTraits.slice(0, 2).map((tr, idx) => (
                                      <span key={idx} className="bg-slate-800 text-indigo-300 px-1 py-0.2 rounded font-bold uppercase">
                                        {tr.count} {tr.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex gap-1 shrink-0 select-none">
                                  {player.units.slice(0, 3).map((un, unIdx) => {
                                    const champName = findChampName(un.championId);
                                    return (
                                      <div key={unIdx} className="w-7 h-7 rounded border border-slate-700/80 bg-slate-800 overflow-hidden relative shadow-sm" title={champName}>
                                        <img src={getChampionImageUrl(champName)} alt={champName} className="w-full h-full object-cover scale-[1.2]" />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-6 text-center text-slate-400 text-xs">
                            <HelpCircle className="w-5 h-5 text-slate-500 mx-auto mb-2" />
                            {lang === 'vi' ? 'Không có danh sách chi tiết sảnh đấu cho trận game này.' : 'No detailed lobby list available for this match tier.'}
                          </div>
                        )}
                      </div>
                    )}

                    {activeAnalysisTab === 'combat' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none font-semibold">
                        
                        {/* Damage Dealt */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-mono font-bold tracking-widest text-[#ef4444] uppercase bg-[#ef4444]/10 p-2 rounded">{lang === 'vi' ? 'SÁT THƯƠNG KỸ NĂNG ĐỒ SÁT' : 'ABILITY DAMAGE ENGAGED'}</h4>
                          <div className="space-y-2 text-xs">
                            {match.damageStats && match.damageStats.length > 0 ? (
                              match.damageStats.map((stat, sidx) => {
                                const maxVal = Math.max(...(match.damageStats || []).map(d => d.damage));
                                const barPct = (stat.damage / maxVal) * 100;
                                return (
                                  <div key={sidx} className="space-y-1">
                                    <div className="flex justify-between font-bold">
                                      <span className="text-white">{findChampName(stat.championId)}</span>
                                      <span className="font-mono text-slate-300">{stat.damage.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                      <div className="bg-[#ef4444] h-full rounded-full" style={{ width: `${barPct}%` }} />
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-slate-500 text-[11px] font-bold">{lang === 'vi' ? 'Thông số không tồn tại.' : 'Combat metrics offline for this match.'}</p>
                            )}
                          </div>
                        </div>

                        {/* Damage Taken */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-mono font-bold tracking-widest text-[#3b82f6] uppercase bg-[#3b82f6]/10 p-2 rounded">{lang === 'vi' ? 'LƯỢNG GIẢM ABS SÁT THƯƠNG / CHỐNG CHỊU' : 'DAMAGE ABSORB / TANK'}</h4>
                          <div className="space-y-2 text-xs font-semibold">
                            {match.tankStats && match.tankStats.length > 0 ? (
                              match.tankStats.map((stat, sidx) => {
                                const maxVal = Math.max(...(match.tankStats || []).map(d => d.tanked));
                                const barPct = (stat.tanked / maxVal) * 100;
                                return (
                                  <div key={sidx} className="space-y-1">
                                    <div className="flex justify-between font-bold">
                                      <span className="text-white">{findChampName(stat.championId)}</span>
                                      <span className="font-mono text-slate-300">{stat.tanked.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                      <div className="bg-[#3b82f6] h-full rounded-full" style={{ width: `${barPct}%` }} />
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-slate-500 text-[11px] font-bold">{lang === 'vi' ? 'Chỉ số chống chịu ngoại tuyến.' : 'Mitigation indexes offline.'}</p>
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
