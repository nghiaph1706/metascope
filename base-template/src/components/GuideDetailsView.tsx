import React, { useState, useMemo } from 'react';
import { ArrowLeft, Award, Calendar, Share2, Copy, Bookmark, Sparkles, AlertCircle, Info, Star } from 'lucide-react';
import { Composition, HexPosition, Champion } from '../types';
import { CHAMPIONS, ITEMS, getChampionImageUrl, getItemImageUrl } from '../data/champions';
import { useLanguage } from '../lib/LanguageContext';

interface GuideDetailsViewProps {
  comp: Composition | null;
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export default function GuideDetailsView({ comp, onBack, onNavigate }: GuideDetailsViewProps) {
  const { lang, t } = useLanguage();

  const handleShare = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!comp) {
    return (
      <div className="py-20 text-center text-slate-400 select-none">
        <p className="text-sm font-bold">
          {lang === 'vi' ? 'Chưa chọn giáo án đội hình kích hoạt.' : 'No active composition selected.'}
        </p>
        <button onClick={onBack} className="mt-4 bg-[#1e293b] text-white text-xs px-4 py-2 rounded-xl">
          {lang === 'vi' ? 'Quay Lại Danh Sách' : 'Return to Meta List'}
        </button>
      </div>
    );
  }

  // Active units on hexes
  const [activePositions, setActivePositions] = useState<HexPosition[]>(comp.positions);
  const [selectedHex, setSelectedHex] = useState<{ row: number; col: number } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Helper: Find champion by ID
  const findChamp = (id: string): Champion | undefined => {
    return CHAMPIONS.find(c => c.id === id);
  };

  // Helper: Find item details by ID
  const findItem = (id: string) => {
    return ITEMS.find(item => item.id === id);
  };

  const getCostColorClass = (cost: number) => {
    switch (cost) {
      case 1: return 'border-slate-500 text-slate-400';
      case 2: return 'border-emerald-500 text-emerald-400';
      case 3: return 'border-blue-500 text-blue-400';
      case 4: return 'border-purple-500 text-purple-400';
      case 5: return 'border-amber-500 text-amber-400';
      default: return 'border-slate-600 text-slate-300';
    }
  };

  const getCostBgClass = (cost: number) => {
    switch (cost) {
      case 1: return 'bg-slate-400/10 text-slate-400';
      case 2: return 'bg-emerald-500/15 text-emerald-400';
      case 3: return 'bg-blue-500/15 text-blue-400';
      case 4: return 'bg-purple-500/15 text-purple-400';
      case 5: return 'bg-amber-500/15 text-amber-400';
      default: return 'bg-slate-600/15 text-slate-300';
    }
  };

  // Click on a hex node
  const handleHexClick = (row: number, col: number) => {
    if (selectedHex) {
      // Trying to move a champion from selectedHex to this hex
      const sourceIndex = activePositions.findIndex(p => p.row === selectedHex.row && p.col === selectedHex.col);
      if (sourceIndex > -1) {
        const targetIndex = activePositions.findIndex(p => p.row === row && p.col === col);
        const updated = [...activePositions];

        if (targetIndex > -1) {
          // Swap positions
          const source = { ...updated[sourceIndex], row, col };
          const target = { ...updated[targetIndex], row: selectedHex.row, col: selectedHex.col };
          updated[sourceIndex] = target;
          updated[targetIndex] = source;
        } else {
          // Move to empty hex
          updated[sourceIndex] = { ...updated[sourceIndex], row, col };
        }
        setActivePositions(updated);
      }
      setSelectedHex(null);
    } else {
      // Select source hex with champion
      const exists = activePositions.some(p => p.row === row && p.col === col);
      if (exists) {
        setSelectedHex({ row, col });
      }
    }
  };

  // Dinamically calculating Synergies based on active board champions
  const calculatedSynergies = useMemo(() => {
    const activeChamps = activePositions.map(pos => findChamp(pos.championId)).filter(Boolean) as Champion[];
    const counts: { [trait: string]: number } = {};

    // Remove duplicates of same character for synergy counting
    const uniqueChampNames = Array.from(new Set(activeChamps.map(c => c.name)));
    const uniqueChamps = uniqueChampNames.map(name => activeChamps.find(c => c.name === name)!).filter(Boolean);

    uniqueChamps.forEach(champ => {
      champ.traits.forEach(trait => {
        counts[trait] = (counts[trait] || 0) + 1;
      });
    });

    const list = Object.keys(counts).map(trait => {
      const count = counts[trait];
      let tier: 'bronze' | 'silver' | 'gold' | 'prismatic' = 'bronze';
      let activated = false;

      // Define standard activation thresholds
      if (['Arcanist', 'Fated', 'Mythic'].includes(trait)) {
        if (count >= 6) { tier = 'prismatic'; activated = true; }
        else if (count >= 4) { tier = 'gold'; activated = true; }
        else if (count >= 2) { tier = 'bronze'; activated = true; }
      } else if (['Warden', 'Behemoth', 'Dryad', 'Sage', 'Dragonlord', 'Duelist', 'Invoker', 'Sniper'].includes(trait)) {
        if (count >= 4) { tier = 'gold'; activated = true; }
        else if (count >= 2) { tier = 'bronze'; activated = true; }
      } else {
        if (count >= 1) { tier = 'gold'; activated = true; }
      }

      return {
        name: trait,
        count,
        tier,
        activated,
        maxCount: ['Arcanist', 'Fated', 'Mythic'].includes(trait) ? 8 : 4
      };
    }).sort((a, b) => b.count - a.count);

    return list;
  }, [activePositions]);

  // Precision rendering of Pointy-topped hexagon grids
  const hexRadius = 42;
  const hexWidth = Math.sqrt(3) * hexRadius; // ~72.7
  const hexHeight = 2 * hexRadius; // 84
  const colSpacing = hexWidth;
  const rowSpacing = hexHeight * 0.75; // 63

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-white transition-colors bg-[#172036] hover:bg-[#1f2b4a] border border-slate-800 px-4 py-2 rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {lang === 'vi' ? 'Quay Lại Giáo Án' : 'Roster Tier List'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#131a2c] hover:border-indigo-500/40 border border-slate-800 px-3.5 py-2 rounded-xl active:scale-95 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedLink ? (lang === 'vi' ? 'Đã sao chép liên kết!' : 'Copied URL!') : (lang === 'vi' ? 'Chia Sẻ Giáo Án' : 'Share Guide')}
          </button>
        </div>
      </div>

      {/* Hero Guide Information */}
      <div className="bg-gradient-to-br from-[#12192c] to-[#0e1322] border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-widest border font-mono ${
                comp.tier === 'S' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {lang === 'vi' ? `BẢN BẬC ${comp.tier}-TIER` : `${comp.tier}-TIER COMP`}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">•</span>
              <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-mono">
                <Award className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? `Tác giả: ${comp.author || 'EliteIntelligence'}` : `By ${comp.author || 'EliteIntelligence'}`}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">•</span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{lang === 'vi' ? `Cập nhật ${comp.updatedAt === 'Just Now' ? 'Vừa xong' : comp.updatedAt}` : `Updated ${comp.updatedAt}`}</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3.5xl font-black text-white tracking-tight uppercase leading-none">
              {lang === 'vi' && comp.id === 'c1' ? 'Định Mệnh Syndra Thể Độc Tôn' : 
               lang === 'vi' && comp.id === 'c2' ? 'Sứ Thanh Hoa Thần Thoại Ashe Gánh Đội' : 
               lang === 'vi' && comp.id === 'c3' ? 'U Tối Khả Ố Yone Đồ Sát Đấu Trường' : 
               comp.name}
            </h1>
            
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              {lang === 'vi' && comp.id === 'c1' ? 'Vận hành tối ưu tại cấp 8, liên thông sức mạnh Định Mệnh Syndra và kích hoạt mốc Pháp Sư gieo rắc nổi khiếp sợ.' :
               lang === 'vi' && comp.id === 'c2' ? 'Xả sát thương cực mạnh từ Ashe và dàn chắn cứng cáp từ Amumu cùng các tướng hộ vệ cấp cao.' :
               comp.description}
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 min-w-[200px]">
            <div className="bg-[#182035]/60 border border-slate-800/80 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">{lang === 'vi' ? 'TỶ LỆ THẮNG' : 'WIN RATE'}</span>
              <p className="text-xl font-mono font-black text-emerald-400 mt-0.5">{comp.winRate}%</p>
            </div>
            <div className="bg-[#182035]/60 border border-slate-800/80 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">{lang === 'vi' ? 'HẠNG TRUNG BÌNH' : 'AVG PLACE'}</span>
              <p className="text-xl font-mono font-black text-indigo-400 mt-0.5">#{comp.avgPlace}</p>
            </div>
            <div className="bg-[#182035]/60 border border-slate-800/80 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">TOP 4 %</span>
              <p className="text-xl font-mono font-black text-white mt-0.5">{comp.top4Rate}%</p>
            </div>
            <div className="bg-[#182035]/60 border border-slate-800/80 p-3.5 rounded-2xl text-center">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">{lang === 'vi' ? 'PHONG CÁCH' : 'PLAYSTYLE'}</span>
              <p className="text-[10px] font-bold text-indigo-300 mt-1 uppercase truncate">
                {lang === 'vi' && comp.playstyle === 'Standard Leveling' ? 'LÊN CẤP TIÊU CHUẨN' : 
                 lang === 'vi' && comp.playstyle === 'Slow Roll lvl 6' ? 'ROLL CHẬM LV 6' : 
                 comp.playstyle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Board Layout & Synergies Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Positioning Grid Column (3/4 width) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center bg-[#13192a]/50 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Sa Bàn Bố Trí Trận Pháp Ô Cơ' : 'Tactical Positioning Hex Board'}</h2>
            </div>
            <p className="text-[10px] font-mono text-slate-400 hidden sm:block leading-none">
              <Info className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
              {lang === 'vi' ? 'Nhấp cờ để nhấc, click ô trống bất kì để hạ vị trí.' : 'Click a champion to highlight, then an empty cell to move.'}
            </p>
          </div>

          {/* Precision SVG Board Frame */}
          <div className="bg-[#111827]/80 border border-slate-800 rounded-3xl py-12 px-2 flex justify-center items-center shadow-inner relative overflow-x-auto select-none">
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="bg-[#161f35] px-2 py-0.5 rounded border border-slate-800 text-slate-500">{lang === 'vi' ? 'TUYẾN TRÊN CHỐNG KẺ ĐỊCH' : 'ENEMY UNITS ARE ABOVE'}</span>
              <span className="block md:hidden bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded animate-pulse">{lang === 'vi' ? '← Vuốt ngang để xem sa bàn đầy đủ →' : '← Swipe horizontally to view full board →'}</span>
            </div>
            
            <svg
              width="680"
              height="300"
              viewBox="0 0 680 300"
              className="mx-auto"
            >
              <defs>
                {/* Patterns for hex crops */}
                {activePositions.map((pos) => {
                  const champ = findChamp(pos.championId);
                  const shortName = champ ? champ.name.substring(0, 3).toUpperCase() : 'TFT';
                  return (
                    <pattern
                      key={`pattern-${pos.row}-${pos.col}`}
                      id={`patt-${pos.row}-${pos.col}`}
                      width="100%"
                      height="100%"
                      patternContentUnits="objectBoundingBox"
                    >
                      <image href={champ ? getChampionImageUrl(champ.name) : ''} preserveAspectRatio="xMidYMid slice" width="1" height="1" />
                    </pattern>
                  );
                })}
              </defs>

              {/* Grid drawing loop */}
              {[0, 1, 2, 3].map((r) => {
                return [0, 1, 2, 3, 4, 5, 6].map((c) => {
                  const x = c * (hexWidth * 0.95) + (r % 2 === 1 ? colSpacing / 2 : 0) + 40;
                  const y = r * rowSpacing + 45;

                  // Find if unit exists on this cell
                  const unit = activePositions.find(p => p.row === r && p.col === c);
                  const isSelected = selectedHex?.row === r && selectedHex?.col === c;
                  const champ = unit ? findChamp(unit.championId) : null;
                  const costColor = champ ? getCostColorClass(champ.cost) : 'text-slate-800';

                  // Flat or pointy topped polygons relative to x, y
                  const points = [
                    `${x},${y - hexRadius}`,
                    `${x + hexWidth / 2},${y - hexRadius / 2}`,
                    `${x + hexWidth / 2},${y + hexRadius / 2}`,
                    `${x},${y + hexRadius}`,
                    `${x - hexWidth / 2},${y + hexRadius / 2}`,
                    `${x - hexWidth / 2},${y - hexRadius / 2}`
                  ].join(' ');

                  return (
                    <polygon
                      key={`${r}-${c}`}
                      points={points}
                      onClick={() => handleHexClick(r, c)}
                      fill={isSelected ? '#4f46e5' : unit ? `url(#patt-${r}-${c})` : '#141a29'}
                      stroke={isSelected ? '#c084fc' : unit ? '#4f46e5' : '#1e293b'}
                      strokeWidth={isSelected ? '3' : unit ? '2' : '1.5'}
                      className="transition-all hover:stroke-indigo-400"
                      opacity={unit ? '1' : '0.6'}
                    />
                  );
                });
              })}

              {/* Contents Overlay Labels & Stars Loop */}
              {activePositions.map((pos) => {
                const champ = findChamp(pos.championId);
                if (!champ) return null;
                const r = pos.row;
                const c = pos.col;
                const x = c * (hexWidth * 0.95) + (r % 2 === 1 ? colSpacing / 2 : 0) + 40;
                const y = r * rowSpacing + 45;
                const isSelected = selectedHex?.row === r && selectedHex?.col === c;

                return (
                  <g key={`overlay-${r}-${c}`} pointerEvents="none" className="select-none">
                    {/* Level star icons */}
                    <g transform={`translate(${x - 30}, ${y - 23})`}>
                      {[...Array(pos.starLevel || 2)].map((_, i) => (
                        <path
                          key={i}
                          d="M6 0L7.54056 4.73803H12.5175L8.48849 7.66393L10.0291 12.402L6 9.47607L1.97094 12.402L3.51151 7.66393L-0.517541 4.73803H4.45944L6 0Z"
                          fill="#fbbf24"
                          transform={`translate(${i * 8}, 0) scale(0.6)`}
                        />
                      ))}
                    </g>

                    {/* Champion text label underneath */}
                    <text
                      x={x}
                      y={y + 26}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      className="drop-shadow"
                    >
                      {champ.name}
                    </text>

                    {/* Items indicators */}
                    {pos.items && pos.items.length > 0 && (
                      <g transform={`translate(${x - 22}, ${y + 32})`}>
                        {pos.items.slice(0, 3).map((itemId, i) => {
                          const itemData = findItem(itemId);
                          return (
                          <g key={i} transform={`translate(${i * 15}, 0)`}>
                            <image
                              href={getItemImageUrl(itemId, itemData ? itemData.name : itemId)}
                              width="12"
                              height="12"
                              preserveAspectRatio="xMidYMid slice"
                            />
                            <rect
                              width="12"
                              height="12"
                              rx="2"
                              fill="none"
                              stroke="#6366f1"
                              strokeWidth="0.8"
                            />
                          </g>
                        )})}
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Roster detail items cards */}
          <div className="space-y-3">
            <h2 className="text-xs font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Hồ Sơ Toàn Bộ Quân Cờ Mọc Trận' : 'Team Composition Details'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePositions.map((pos) => {
                const champ = findChamp(pos.championId);
                if (!champ) return null;
                return (
                  <div key={`${pos.row}-${pos.col}`} className="bg-[#111827]/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 border-2 rounded-xl shrink-0 overflow-hidden relative flex items-center justify-center font-bold ${getCostBgClass(champ.cost)} shadow-md`} style={{ borderColor: champ.cost === 5 ? '#f59e0b' : champ.cost === 4 ? '#ec4899' : champ.cost === 3 ? '#3b82f6' : champ.cost === 2 ? '#22c55e' : '#64748b' }}>
                        <img src={getChampionImageUrl(champ.name)} alt={champ.name} className="w-full h-full pb-1 object-cover scale-[1.2]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white">{champ.name}</p>
                          <span className="text-[10px] font-mono text-slate-500">{champ.cost} {lang === 'vi' ? 'Vàng' : 'Gold'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {champ.traits.map((t, i) => (
                            <span key={i} className="text-[9px] font-mono text-indigo-400 font-bold">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Appended Item stats icons */}
                    <div className="flex gap-1 border-l border-slate-800/80 pl-3 min-h-[30px] items-center">
                      {[0, 1, 2].map((i) => {
                        const itemId = pos.items?.[i];
                        if (itemId) {
                          const item = findItem(itemId);
                          return (
                            <div key={i} className="group relative">
                              <div className="w-7 h-7 bg-slate-800 hover:border-indigo-500 rounded border border-slate-700/80 overflow-hidden flex items-center justify-center cursor-pointer select-none">
                                <img src={getItemImageUrl(itemId, item ? item.name : itemId)} alt={item?.name || itemId} className="w-full h-full object-cover" />
                              </div>
                              {/* Tooltip on hover */}
                              {item && (
                                <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 bg-[#0a0f1c] border border-slate-700/80 rounded-xl p-3 shadow-2xl shadow-black/50 z-50 w-48 text-left select-none pointer-events-none">
                                  <p className="text-[10px] font-bold text-white">{item.name}</p>
                                  <p className="text-[9px] text-slate-400 mt-1">{item.desc}</p>
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          return (
                            <div key={i} className="w-7 h-7 bg-[#141d31] rounded border border-slate-800/50 flex items-center justify-center select-none" />
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Synergies Sidebar (1/4 width) */}
        <div className="space-y-6">
          <div className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-black text-white tracking-widest uppercase border-b border-slate-800 pb-2 font-bold">
              {lang === 'vi' ? 'Hộc Hệ Kích Hoạt Sa Bàn' : 'Board Synergies'} ({calculatedSynergies.filter(s => s.activated).length})
            </h3>
            
            <div className="space-y-3">
              {calculatedSynergies.map((syn, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1.5 p-2 rounded-xl transition-all ${
                    syn.activated
                      ? 'bg-indigo-950/20 border border-indigo-500/10'
                      : 'opacity-40 bg-slate-900/10 border border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="font-bold text-white">{syn.name}</span>
                    <span className="font-mono text-[10px] font-bold text-indigo-400">{syn.count} / {syn.maxCount}</span>
                  </div>
                  
                  {/* Progress lines */}
                  <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        syn.activated
                          ? syn.tier === 'prismatic' ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500' :
                            syn.tier === 'gold' ? 'bg-amber-400' : 'bg-indigo-500'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.min((syn.count / syn.maxCount) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Early & Mid Game path transitions */}
          <div className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-black text-white tracking-widest uppercase border-b border-slate-800 pb-2">
              {lang === 'vi' ? 'Tiến Trình Xoay Bài' : 'Game Transition Path'}
            </h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-1.5 py-0.5 rounded">{lang === 'vi' ? 'XÂY DỰNG ĐẦU TRẬN' : 'EARLY GAME BUILD'}</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {lang === 'vi' ? 'Khởi động với các tướng rẻ tiền 1/2 vàng như Ahri, Yasuo, Kog\'Maw để giữ đồ phép hộ. Tích lợi tức vượt 50 vàng ổn định.' : 'Start with cheap 1/2-cost units like Ahri, Yasuo, Kog\'Maw to hold ability items. Maintain interest points above 50.'}
                </p>
                <div className="flex border-t border-slate-800/80 pt-1.5 gap-1 select-none">
                  {comp.earlyUnits.map((u, i) => (
                    <span key={i} className="text-[9px] bg-[#1a2337] text-white py-0.5 px-1.5 rounded-md font-bold font-mono border border-slate-800">
                      {u}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-1.5 py-0.5 rounded">{lang === 'vi' ? 'GIỮA TRẬN XOAY TUA (LV 6/7)' : 'MID GAME BUILD (LVL 6/7)'}</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {lang === 'vi' ? 'Bắt đầu cấy dần Lux và Zoe gánh dame giữa trận, bổ sung tiền tuyến Đấu Sĩ hoặc Hộ Vệ làm bia chắn.' : 'Transition into Lux and Zoe, adding Warden Frontlines. Hold Illaoi upgrades diligently.'}
                </p>
                <div className="flex border-t border-slate-800/80 pt-1.5 gap-1 select-none">
                  {comp.midUnits.map((u, i) => (
                    <span key={i} className="text-[9px] bg-[#221c38] text-indigo-200 py-0.5 px-1.5 rounded-md font-bold font-mono border border-slate-800">
                      {u}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-1.5 py-0.5 rounded">{lang === 'vi' ? 'ƯU TIÊN ĐI CHỢ CHỌN ĐỒ' : 'CAROUSEL PRIORITY'}</span>
                <div className="flex flex-wrap gap-1 select-none pt-1">
                  {comp.carouselPriority.map((item, idx) => (
                    <span key={idx} className="bg-[#241d1a] border border-[#f59e0b]/20 text-[#f59e0b] text-[9px] font-mono font-black py-0.5 px-1.5 rounded-md">
                      #{idx + 1} {item === 'Tear' && lang === 'vi' ? 'Nước mắt' : item === 'Rod' && lang === 'vi' ? 'Gậy Quá Khổ' : item === 'Bow' && lang === 'vi' ? 'Cung Gỗ' : item === 'Sword' && lang === 'vi' ? 'Kiếm B.F' : item === 'Armor' && lang === 'vi' ? 'Giáp Lưới' : item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
