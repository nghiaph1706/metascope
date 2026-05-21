import React, { useState, useEffect } from 'react';
import { Target, Zap, ShieldAlert, Award, AlertCircle, RefreshCw, Layers, CheckCircle, Flame, Star, StarOff, Play, Info } from 'lucide-react';
import { LIVE_LOBBY, LIVE_TIPS } from '../data/profiles';
import { useLanguage } from '../lib/LanguageContext';

const LIVE_TIPS_VI = [
  "GEN Chovy đang sở hữu Chuỗi Thắng 5 trận liên tiếp cực rực lửa. Hãy theo dõi sát sao tiến trình lên cấp của người chơi này trước các vòng đấu bản lề.",
  "Các quân cờ Pháp Sư (Arcanist) đang bị tranh giành gắt gao! Cả 'Hide on bush' và 'Delight' đều đang tích trữ Lux và Neeko ở Vòng 2.",
  "Đội hình hiện tại của bạn đang cực mạnh ở Vòng 3 nhưng sẽ yếu dần về cuối game. Hãy roll nhẹ để củng cố các mốc nâng cấp chống chịu hàng trước."
];

interface LiveTrackerViewProps {
  onNavigate: (view: string) => void;
  summonerSearchQuery: string;
  onSearchSubmit: (q: string) => void;
}

export default function LiveTrackerView({ onNavigate, summonerSearchQuery, onSearchSubmit }: LiveTrackerViewProps) {
  const [activeStage, setActiveStage] = useState('Stage 3-2');
  const [trackerActive, setTrackerActive] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(25);
  const [tipsIndex, setTipsIndex] = useState(0);
  const { lang, t } = useLanguage();

  // Stage timer ticking Simulation
  useEffect(() => {
    let interval: any = null;
    if (trackerActive) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Roll to next Stage
            setActiveStage((stage) => {
              if (stage === 'Stage 3-2') return 'Stage 3-5';
              if (stage === 'Stage 3-5') return 'Stage 4-1';
              if (stage === 'Stage 4-1') return 'Stage 4-5';
              return 'Stage 3-2';
            });
            setTipsIndex((prevIdx) => (prevIdx + 1) % LIVE_TIPS.length);
            return 30; // resets
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [trackerActive]);

  const handleRefresh = () => {
    setSecondsLeft(30);
    setTipsIndex((prev) => (prev + 1) % LIVE_TIPS.length);
  };

  const getDangerBadge = (threat: 'Low' | 'Medium' | 'High') => {
    switch (threat) {
      case 'High': return 'bg-pink-500/15 text-pink-400 border border-pink-500/30 font-bold';
      case 'Medium': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold';
      case 'Low': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold';
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Tracker Status Indicator */}
      <div className="bg-[#111827]/70 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-bl-full pointer-events-none" />

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping shrink-0" />
            <span className="text-[10px] font-mono text-pink-400 font-extrabold tracking-widest uppercase">
              {lang === 'vi' ? 'ĐƯỜNG TRUYỀN THỜI GIAN THỰC ĐÃ THIẾT LẬP' : 'LIVE PREDICTION LINK ESTABLISHED'}
            </span>
          </div>
          <h1 className="text-xl font-black text-white tracking-widest uppercase leading-none">
            {lang === 'vi' ? 'Giám Sát Sảnh Đấu Trực Tiếp' : 'Lobby Match Telemetry'}
          </h1>
          <p className="text-xs text-slate-400 font-semibold">
            {lang === 'vi' ? 'Đang truy lục dự liệu các Cao Thủ kết nối. Trích xuất xu hướng đội hình kỉ lục, chuỗi dồn thắng rực lửa và định vị xác suất thứ hạng sảnh đấu.' : 'Scanning connected challenger modules. Extracting current board tendencies, active win streaks, and placements index odds.'}
          </p>
        </div>

        {/* Live game metrics gauges */}
        <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
          <div className="bg-[#1a233b] border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-w-[110px]">
            <span className="text-[9px] text-slate-500 uppercase font-bold leading-none block">{lang === 'vi' ? 'STAGE VÒNG' : 'STAGE'}</span>
            <span className="text-sm font-bold text-white block mt-1">{activeStage}</span>
          </div>

          <div className="bg-[#1a233b] border border-slate-800 px-4 py-2.5 rounded-2xl text-center min-w-[110px]">
            <span className="text-[9px] text-slate-500 uppercase font-bold leading-none block">{lang === 'vi' ? 'VÒNG TIẾP THEO' : 'NEXT ROUND'}</span>
            <span className="text-sm font-bold text-indigo-400 block mt-1">{secondsLeft}s</span>
          </div>

          <button
            onClick={handleRefresh}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-200 hover:text-white transition-all active:scale-95 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Lobby Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lobby List (2/3 width) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center bg-[#13192a]/50 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              {lang === 'vi' ? 'SỐ LIỆU SẢNH CAO THỦ (8 NGƯỜI CHƠI TRỰC TIẾP)' : 'ACTIVE LOBBY MODULE (8 PARTICIPANTS)'}
            </span>
          </div>

          <div className="space-y-2.5">
            {LIVE_LOBBY.map((player, idx) => (
              <div
                key={player.summonerName}
                className="bg-[#111827]/75 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-6 h-6 rounded bg-[#1c2438]/80 text-[#8288a4] border border-slate-800/80 font-mono text-[10px] font-black flex items-center justify-center">
                    {idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-white hover:text-indigo-400 cursor-pointer" onClick={() => { onSearchSubmit(`${player.summonerName}#${player.tagLine}`); onNavigate('player_stats'); }}>
                        {player.summonerName}
                      </span>
                      <span className="font-mono text-[9px] text-slate-500">#{player.tagLine}</span>
                      
                      {player.hotStreak > 0 && (
                        <span className="inline-flex items-center text-[9px] font-mono bg-pink-500/10 border border-pink-500/20 text-pink-400 px-1 rounded font-black uppercase">
                          <Flame className="w-2.5 h-2.5 mr-0.5 fill-pink-500" />
                          {player.hotStreak} {lang === 'vi' ? 'CHUỖI HỎA' : 'STREAK'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] font-mono">
                      <span className="text-amber-500 font-bold">{player.rank} {player.lp} LP</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{lang === 'vi' ? 'Ưu tiên bài đóng:' : 'Favors:'}</span>
                      {player.preferredTraits.slice(0, 2).map((tr, tIdx) => (
                        <span key={tIdx} className="text-indigo-300 font-bold">
                          {tr}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Threat indicators and odds */}
                <div className="flex items-center gap-4 border-t sm:border-t-0 border-slate-800/80 pt-2 sm:pt-0 shrink-0 font-mono text-xs">
                  <div className="space-y-0.5 text-center min-w-[70px]">
                    <span className="text-[8px] text-slate-500 uppercase font-bold leading-none">{lang === 'vi' ? 'MỨC NGUY HIỂM' : 'THREAT'}</span>
                    <span className={`block py-0.5 px-2 rounded-lg text-[9px] mt-0.5 ${getDangerBadge(player.dangerLevel)}`}>
                      {player.dangerLevel === 'High' ? (lang === 'vi' ? 'Cao' : 'High') : player.dangerLevel === 'Medium' ? (lang === 'vi' ? 'Trung bình' : 'Medium') : (lang === 'vi' ? 'Thấp' : 'Low')}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-center min-w-[70px]">
                    <span className="text-[8px] text-slate-500 uppercase font-bold leading-none">{lang === 'vi' ? 'DỰ ĐOÁN HẠNG' : 'PREDICTED'}</span>
                    <span className="block text-sm font-bold text-slate-200 mt-0.5">#{player.predictedPlacement}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Realtime tactical alert box (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#1c121e] to-[#12192c] border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
              <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0 animate-ping" />
              <h3 className="text-xs font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Chỉ Thị Đồng Đồng Hành' : 'Companion Stage Advice'}</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              {lang === 'vi' ? LIVE_TIPS_VI[tipsIndex] : LIVE_TIPS[tipsIndex]}
            </p>

            <div className="text-[9px] font-mono text-slate-500 bg-[#131a2c]/60 p-2.5 rounded-xl border border-slate-800/65 flex gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{lang === 'vi' ? 'Vị trí thứ hạng sảnh đấu được ước lượng tuần hoàn dựa trên tỷ lệ thắng động và sắp xếp đội hình.' : 'Placements are projected periodically using active tier win ratios and lobby positioning.'}</span>
            </div>
          </div>

          {/* Connected state */}
          <div className="bg-[#111827]/70 border border-slate-800 rounded-2xl p-4 space-y-3.5">
            <h3 className="text-xs font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Kiểm Soát Đường Truyền' : 'Connection Status'}</h3>
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="text-slate-400 font-bold">{lang === 'vi' ? 'ĐỘ TRỄ KẾT NỐI: 12ms' : 'TUNNEL LATENCY: 12ms'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-400 font-bold">{lang === 'vi' ? 'ĐỒNG BỘ CLIENT: HOẠT ĐỘNG' : 'CLIENT SYNC: ENABLED'}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
