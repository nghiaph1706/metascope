import React from 'react';
import { Activity, Clock, Cpu, Lock, Star } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface PostGameProps {
  isAuthenticated: boolean;
  userTier: 'free' | 'basic' | 'premium';
  onUpgrade: () => void;
}

export default function PostGameAnalysisView({ isAuthenticated, userTier, onUpgrade }: PostGameProps) {
  const { lang } = useLanguage();

  if (!isAuthenticated) {
     return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
          <div className="w-20 h-20 bg-[#172036] rounded-full flex items-center justify-center border border-slate-700 shadow-xl shadow-slate-900/50">
             <Lock className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-2xl font-black text-white">{lang === 'vi' ? 'Cần Đăng Nhập' : 'Login Required'}</h2>
          <p className="text-slate-400 max-w-sm text-center text-sm font-medium">
            {lang === 'vi' ? 'Vui lòng đăng nhập để sử dụng tính năng Phân Tích AI trận đấu.' : 'Please log in to access the AI Post-Game Analysis feature.'}
          </p>
        </div>
     );
  }

  const analysisLeft = userTier === 'free' ? '1/1' : userTier === 'basic' ? '2/2' : '∞';
  const period = userTier === 'free' ? (lang === 'vi' ? 'tuần' : 'week') : userTier === 'basic' ? (lang === 'vi' ? 'ngày' : 'day') : '';

  return (
    <div className="space-y-6 py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 select-none flex flex-col items-center min-h-[70vh] justify-center">
      
      {/* Tier Quota Indicator */}
      <div className="absolute top-24 right-4 sm:right-8 bg-[#111827]/80 border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-sm shadow-xl">
         <div className="space-y-1">
           <div className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
             {lang === 'vi' ? 'Lượt Phân Tích AI' : 'AI Analysis Quota'}
           </div>
           <div className="text-2xl font-bold text-white font-mono">{analysisLeft} <span className="text-xs text-slate-500">{period ? `/ ${period}` : ''}</span></div>
         </div>
         {userTier !== 'premium' && (
           <button onClick={onUpgrade} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-2 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-amber-500/20">
             <Star className="w-5 h-5" />
           </button>
         )}
      </div>

      <div className="text-center space-y-6 relative mt-16">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="w-24 h-24 bg-gradient-to-br from-[#172036] to-[#0c121f] rounded-3xl mx-auto border border-slate-800 shadow-2xl flex items-center justify-center relative shadow-indigo-500/10">
          <Activity className="w-10 h-10 text-indigo-400 group-hover:scale-110 transition-transform animate-pulse" />
          <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg shadow-pink-500/20">
            ROADMAP
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            {lang === 'vi' ? 'Phân Tích Sau Trận' : 'Post-Game Analysis'}
          </h1>
          <p className="text-slate-400 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {lang === 'vi' 
              ? 'Tính năng "Chuyện Gì Đã Xảy Ra?" đang trong lộ trình phát triển. Hệ thống AI sẽ phân tích log trận đấu, chỉ ra các quyết định sai lầm về xấp tài nguyên, lỗi vị trí và khoảnh khắc đánh mất lợi thế dẫn tới việc bị loại. Sắp ra mắt ở phiên bản v2.0.'
              : '"What went wrong?" post-match insights are on our roadmap. Our AI module will parse your combat logs to point out critical econ misplays, poor positioning, and the exact round you lost your edge. Coming in v2.0.'}
          </p>
        </div>

        <div className="pt-8">
           <div className="inline-flex items-center gap-3 bg-[#131a2c]/80 border border-slate-800/80 px-6 py-3 rounded-2xl">
             <Cpu className="w-5 h-5 text-slate-500" />
             <div className="flex gap-1.5">
               {[1, 2, 3].map(i => (
                 <div key={i} className="w-2.5 h-2.5 bg-slate-700 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
               ))}
             </div>
             <span className="text-slate-400 text-xs font-mono font-bold tracking-widest pl-2 uppercase">
               {lang === 'vi' ? 'Đang Xây Dựng Thuật Toán' : 'Calibrating AI Core'}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
}
