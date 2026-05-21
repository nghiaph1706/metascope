import React from 'react';
import { Check, Star, Zap, Crown, Cpu, Activity, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface PricingViewProps {
  currentTier: 'free' | 'basic' | 'premium';
  onSelectTier: (tier: 'free' | 'basic' | 'premium') => void;
}

export default function PricingView({ currentTier, onSelectTier }: PricingViewProps) {
  const { lang } = useLanguage();

  return (
    <div className="space-y-8 py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          {lang === 'vi' ? 'Nâng Cấp Trải Nghiệm' : 'Upgrade Your Experience'}
        </h1>
        <p className="text-slate-400 font-medium text-sm md:text-base max-w-2xl mx-auto">
          {lang === 'vi' 
            ? 'Mở khóa toàn bộ sức mạnh của AI phân tích, dữ liệu thời gian thực và các tính năng độc quyền để leo rank nhanh hơn.'
            : 'Unlock the full power of AI insights, real-time data, and exclusive features to climb the ladder faster.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pt-8">
        {/* Free Tier */}
        <div className={`relative bg-[#111827]/70 border ${currentTier === 'free' ? 'border-slate-500 shadow-xl' : 'border-slate-800'} p-8 rounded-3xl flex flex-col transition-all hover:-translate-y-1`}>
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest">{lang === 'vi' ? 'Cơ Bản' : 'Free'}</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$0</span>
              <span className="text-slate-500 font-medium">/ {lang === 'vi' ? 'tháng' : 'month'}</span>
            </div>
            <p className="text-sm text-slate-400">
              {lang === 'vi' ? 'Dành cho người chơi phổ thông muốn tham khảo meta.' : 'For casual players checking the meta.'}
            </p>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              {lang === 'vi' ? 'Xem Tier List & Đội Hình Phổ Biến' : 'Access to Meta Tier Lists & Comps'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              {lang === 'vi' ? 'Tra Cứu Lịch Sử Đấu' : 'Basic Match History Lookup'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              {lang === 'vi' ? 'Dùng thử Dự Đoán Elo (3 lần/tuần)' : 'Try Elo Predictor (3 times/week)'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <Cpu className="w-5 h-5 text-amber-500 shrink-0" />
              {lang === 'vi' ? '1 lần Phân Tích AI miễn phí / tuần (Yêu cầu đăng nhập)' : '1 Free AI Match Analysis / week (Login required)'}
            </li>
          </ul>

          <button 
            onClick={() => onSelectTier('free')}
            disabled={currentTier === 'free'}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              currentTier === 'free'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            {currentTier === 'free' ? (lang === 'vi' ? 'Gói Hiện Tại' : 'Current Plan') : (lang === 'vi' ? 'Chọn Gói' : 'Select Plan')}
          </button>
        </div>

        {/* Basic Tier */}
        <div className={`relative bg-gradient-to-b from-[#172036] to-[#0c121f] border ${currentTier === 'basic' ? 'border-indigo-500 shadow-xl shadow-indigo-500/20' : 'border-indigo-500/30'} p-8 rounded-3xl flex flex-col transition-all hover:-translate-y-1`}>
          {currentTier === 'basic' && (
            <div className="absolute -top-3 inset-x-0 flex justify-center">
              <span className="bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-lg">
                {lang === 'vi' ? 'Đang Sử Dụng' : 'Active Plan'}
              </span>
            </div>
          )}
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Star className="w-5 h-5" />
              {lang === 'vi' ? 'Tuyển Thủ' : 'Basic'}
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$4.99</span>
              <span className="text-slate-500 font-medium">/ {lang === 'vi' ? 'tháng' : 'month'}</span>
            </div>
            <p className="text-sm text-slate-400">
              {lang === 'vi' ? 'Tăng tốc leo rank với dữ liệu chuyên sâu.' : 'Accelerate your climb with advanced insights.'}
            </p>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
               <Check className="w-5 h-5 text-indigo-400 shrink-0" />
               {lang === 'vi' ? 'Tất cả tính năng của gói Cơ Bản' : 'Everything in Free'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
              <Check className="w-5 h-5 text-indigo-400 shrink-0" />
              {lang === 'vi' ? 'Chỉ số tướng & Tộc Hệ chuyên sâu' : 'Advanced Champion & Trait Analytics'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
              <Check className="w-5 h-5 text-indigo-400 shrink-0" />
              {lang === 'vi' ? 'Không giới hạn Dự Đoán & Tính Toán Elo' : 'Unlimited MMR & Elo Prediction'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-indigo-300 bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
              <Cpu className="w-5 h-5 text-indigo-400 shrink-0" />
              {lang === 'vi' ? '2 lần Phân Tích AI trận đấu / ngày' : '2 AI Match Analyses / day'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
              <Check className="w-5 h-5 text-indigo-400 shrink-0" />
              {lang === 'vi' ? 'Không quảng cáo' : 'Ad-free experience'}
            </li>
          </ul>

          <button 
            onClick={() => onSelectTier('basic')}
            disabled={currentTier === 'basic'}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              currentTier === 'basic'
                ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25'
            }`}
          >
            {currentTier === 'basic' ? (lang === 'vi' ? 'Gói Hiện Tại' : 'Current Plan') : (lang === 'vi' ? 'Nâng Cấp Basic' : 'Upgrade to Basic')}
          </button>
        </div>

        {/* Premium Tier */}
        <div className={`relative bg-gradient-to-br from-amber-900/40 to-[#0c121f] border ${currentTier === 'premium' ? 'border-amber-500 shadow-xl shadow-amber-500/20' : 'border-amber-500/30'} p-8 rounded-3xl flex flex-col transition-all hover:-translate-y-1`}>
          <div className="absolute top-0 right-0 p-4">
             <Crown className="w-8 h-8 text-amber-500 opacity-50" />
          </div>
          <div className="space-y-4 mb-8 relative">
            <h3 className="text-xl font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {lang === 'vi' ? 'Thách Đấu' : 'Premium'}
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$9.99</span>
              <span className="text-slate-500 font-medium">/ {lang === 'vi' ? 'tháng' : 'month'}</span>
            </div>
            <p className="text-sm text-amber-200/60">
              {lang === 'vi' ? 'Trải nghiệm đỉnh cao dành cho người chơi try-hard.' : 'The ultimate toolkit for competitive players.'}
            </p>
          </div>

          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
               <Check className="w-5 h-5 text-amber-500 shrink-0" />
               {lang === 'vi' ? 'Tất cả tính năng của gói Tuyển Thủ' : 'Everything in Basic'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
               <Cpu className="w-5 h-5 text-amber-500 shrink-0" />
               {lang === 'vi' ? 'Huấn Luyện Viên AI: Mẹo khắc chế & Positioning' : 'AI Matchup Coach: Counters & Positioning'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
               <Cpu className="w-5 h-5 text-amber-400 shrink-0" />
               {lang === 'vi' ? 'Không giới hạn Phân Tích AI sau trận' : 'Unlimited AI Post-Game Analyses'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
               <Activity className="w-5 h-5 text-amber-500 shrink-0" />
               {lang === 'vi' ? 'Live Tracker: Theo dõi định hướng in-game (v2.0)' : 'Live Tracker overlay guidance (v2.0)'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
               <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
               {lang === 'vi' ? 'Cập nhật Meta sớm từ các top server' : 'Early Meta updates from top servers'}
            </li>
            <li className="flex items-start gap-3 text-sm font-medium text-slate-300">
               <Crown className="w-5 h-5 text-amber-500 shrink-0" />
               {lang === 'vi' ? 'Huy hiệu VIP trên Bảng Xếp Hạng' : 'Exclusive VIP badge on Leaderboard'}
            </li>
          </ul>

          <button 
            onClick={() => onSelectTier('premium')}
            disabled={currentTier === 'premium'}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              currentTier === 'premium'
                ? 'bg-amber-900/50 text-amber-400 border border-amber-500/30 cursor-not-allowed'
                : 'bg-amber-500 text-slate-900 hover:bg-amber-400 shadow-lg shadow-amber-500/25'
            }`}
          >
            {currentTier === 'premium' ? (lang === 'vi' ? 'Gói Hiện Tại' : 'Current Plan') : (lang === 'vi' ? 'Lên Đỉnh Cao' : 'Unlock Premium')}
          </button>
        </div>

      </div>
    </div>
  );
}
