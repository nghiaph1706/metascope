import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, CheckCircle2, ChevronRight, Gamepad2 } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface AuthViewProps {
  onRegisterSuccess: (tier?: 'free' | 'basic' | 'premium') => void;
  onNavigate: (view: string) => void;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const RiotIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
    <path fill="#eb0029" d="M3.5 2h17a1.5 1.5 0 0 1 1.5 1.5v17a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 20.5v-17A1.5 1.5 0 0 1 3.5 2zm9.157 5.75c-1.848 0-3.345 1.498-3.345 3.345 0 1.848 1.497 3.344 3.345 3.344 1.848 0 3.346-1.496 3.346-3.344 0-1.847-1.498-3.345-3.346-3.345zm-1.07 9.88l-3.385-2.484-2.607.72 1.942-5.748L5.05 8.127l3.6-1.545 1.986 5.86 1.02-3.13 4.238 6.318z"/>
  </svg>
);

export default function AuthView({ onRegisterSuccess, onNavigate }: AuthViewProps) {
  const { lang, t } = useLanguage();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [summoner, setSummoner] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onRegisterSuccess();
      setLoading(false);
      onNavigate('home');
    }, 1500);
  };

  const handleSocialAuth = (method: string) => {
    setLoading(true);
    setTimeout(() => {
      onRegisterSuccess();
      setLoading(false);
      onNavigate('home');
    }, 1500);
  };

  return (
    <div className="space-y-6 py-10 max-w-md mx-auto px-4 select-none">
      
      {/* Container card */}
      <div className="bg-gradient-to-br from-[#12192c] to-[#0e1322] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none" />

        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          
          <h1 className="text-xl font-black text-white tracking-widest uppercase animate-pulse">
            {isLogin ? (lang === 'vi' ? 'ĐĂNG NHẬP METASCOPE' : 'LOG IN METASCOPE') : (lang === 'vi' ? 'GIA NHẬP ĐỘI NGŨ CAO THỦ' : 'JOIN THE INTEL ELITE')}
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {lang === 'vi' ? 'Mở khóa sơ đồ chiến thuật tối cao, biểu đồ sao chép và tự động giám sát trận trực tiếp.' : 'Unlock professional roster boards, analytics grids, and real-time live telemetry.'}
          </p>
        </div>

        {/* Benefits bullets list */}
        {!isLogin && (
          <div className="bg-[#141d31]/55 border border-slate-800 p-4 rounded-2xl space-y-2 text-[11px] font-semibold text-slate-300 select-none">
            <div className="flex gap-2 items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'vi' ? 'Ưu tiên hàng chờ giám sát trận đấu thời gian thực' : 'Priority Telemetry Matching Tracing Queue'}</span>
            </div>
            <div className="flex gap-2 items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'vi' ? 'Tự thiết kế vị trí ô cờ trên sa bàn chuyên nghiệp' : 'Roster Comp Drafter Positioning Boards'}</span>
            </div>
            <div className="flex gap-2 items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'vi' ? 'Nhật ký phân tích lượt sao chép thông minh' : 'Full Analytics traffic and click-conversion trackers'}</span>
            </div>
          </div>
        )}

        {/* Social Logins */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleSocialAuth('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#131a2c] hover:bg-[#1a233b] border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
          >
            <GoogleIcon />
            {lang === 'vi' ? 'Tiếp tục với Google' : 'Continue with Google'}
          </button>
          
          <button
            onClick={() => handleSocialAuth('riot')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-[#eb0029]/10 hover:bg-[#eb0029]/20 border border-[#eb0029]/30 hover:border-[#eb0029]/50 text-[#ff4d6d] hover:text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
          >
            <RiotIcon />
            {lang === 'vi' ? 'Tiếp tục với Riot Games' : 'Continue with Riot Games'}
          </button>
        </div>

        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{lang === 'vi' ? 'HOẶC' : 'OR'}</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 text-xs font-semibold">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                {lang === 'vi' ? 'TÊN TÀI KHOẢN LMHT' : 'SUMMONER HANDLE'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g., Hide on bush #KR1"
                  value={summoner}
                  onChange={(e) => setSummoner(e.target.value)}
                  className="w-full bg-[#131a2c] text-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 hover:border-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              {lang === 'vi' ? 'ĐỊA CHỈ EMAIL' : 'EMAIL ADDRESS'}
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="summoner@metascope.gg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#131a2c] text-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 hover:border-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">
              {lang === 'vi' ? 'MẬT KHẨU' : 'PASSWORD'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#131a2c] text-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 hover:border-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
              />
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-bold uppercase tracking-wider text-white rounded-xl active:scale-95 transition-all flex justify-center items-center gap-1 shadow-lg shadow-indigo-600/20"
          >
            {loading ? (lang === 'vi' ? 'Đang xác thực...' : 'Authenticating...') : isLogin ? (lang === 'vi' ? 'Đăng Nhập Cơ Bản' : 'Basic Log In') : (lang === 'vi' ? 'Gia Nhập Bằng Email' : 'Join With Email')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 space-y-3">
           <div className="text-center text-[10px] text-slate-500 tracking-widest font-mono font-bold uppercase">
              {lang === 'vi' ? 'Tài Khoản Thử Nghiệm (Mock Data)' : 'Demo Accounts (Mock Data)'}
           </div>
           <div className="flex gap-3">
             <button
               onClick={() => {
                 onRegisterSuccess('basic');
                 onNavigate('home');
               }}
               className="flex-1 bg-[#131a2c] hover:bg-indigo-500/10 border border-slate-700 hover:border-indigo-500/50 text-slate-300 hover:text-indigo-400 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center"
             >
                {lang === 'vi' ? 'Tuyển Thủ (Basic)' : 'Basic Account'}
             </button>
             <button
               onClick={() => {
                 onRegisterSuccess('premium');
                 onNavigate('home');
               }}
               className="flex-1 bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 border border-amber-500/30 hover:border-amber-500/60 text-amber-500 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] flex items-center justify-center"
             >
                {lang === 'vi' ? 'Thách Đấu (Premium)' : 'Premium Account'}
             </button>
           </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[11px] font-mono text-indigo-400 hover:text-white underline"
          >
            {isLogin ? (lang === 'vi' ? 'Chưa phải thành viên? Đăng ký ngay' : 'Need an Elite Account? Register Now') : (lang === 'vi' ? 'Đã có tài khoản? Đăng nhập ngay' : 'Already an Elite Member? Log In')}
          </button>
        </div>
      </div>

    </div>
  );
}
