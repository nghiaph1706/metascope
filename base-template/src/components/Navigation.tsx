import React, { useState } from 'react';
import { Compass, User, Zap, Terminal, Edit, Layers, Award, ShieldAlert, Bell, Search, Menu, X, Sword, Trophy, BarChart2, Percent, Cpu, Crown, ChevronDown, Target, BrainCircuit, LogOut } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  summonerSearchQuery: string;
  setSummonerSearchQuery: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  isRegistered: boolean;
}

export default function Navigation({
  currentView,
  onNavigate,
  summonerSearchQuery,
  setSummonerSearchQuery,
  onSearchSubmit,
  isRegistered
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { lang, setLang, t } = useLanguage();

  // Categorized navigation datasets
  const dbItems = [
    { id: 'tier_list', label: t.navMeta, icon: Layers },
    { id: 'champion_stats', label: lang === 'vi' ? 'Chỉ Số Tướng' : 'Champions', icon: BarChart2 },
    { id: 'trait_stats', label: lang === 'vi' ? 'Chỉ Số Hệ' : 'Traits', icon: ShieldAlert },
    { id: 'rolling_odds', label: lang === 'vi' ? 'Tỷ Lệ Roll' : 'Roll Odds', icon: Percent },
    { id: 'items_view', label: t.navItems, icon: Sword }
  ];

  const helperItems = [
    { id: 'post_game', label: lang === 'vi' ? 'Phân Tích AI' : 'AI Analysis', icon: Cpu },
    { id: 'live_tracker', label: t.navLive, icon: Zap },
    { id: 'elo_predictor', label: lang === 'vi' ? 'Dự Đoán Elo' : 'Predictor', icon: Target },
    { id: 'matchup_coach', label: lang === 'vi' ? 'Huấn Luyện AI' : 'Coach', icon: BrainCircuit },
    { id: 'player_stats', label: t.navStats, icon: User },
    { id: 'leaderboard', label: lang === 'vi' ? 'Xếp Hạng' : 'Ranking', icon: Trophy }
  ];

  const creatorItems = [
    { id: 'creator_hub', label: t.navCreator, icon: Award },
    { id: 'create_guide', label: t.navCreate, icon: Edit }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (summonerSearchQuery.trim()) {
      onSearchSubmit(summonerSearchQuery);
      onNavigate('player_stats');
      setMobileMenuOpen(false);
    }
  };

  const NavGroup = ({ title, items }: { title: string, items: any[] }) => (
    <div className="mb-6">
      <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold group ${
                isActive 
                  ? 'bg-indigo-600/10 text-indigo-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header (Only visible on small screens) */}
      <div className="lg:hidden flex items-center justify-between bg-[#0c121f] border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20 active:scale-95 transition-transform">
            <span className="font-extrabold text-white tracking-widest text-lg">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black tracking-wider text-sm leading-none uppercase">{t.brandName}</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 rounded-lg bg-[#131a2c] flex items-center justify-center border border-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Sidebar / Mobile Menu Overlay */}
      <nav className={`fixed lg:static inset-0 z-40 bg-[#0c121f] lg:bg-[#0c121f] border-r border-[#1e293b] w-full lg:w-64 h-full flex flex-col transition-transform duration-300 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Brand Header (Desktop) */}
        <div className="hidden lg:flex items-center gap-3 p-6 pb-4 cursor-pointer" onClick={() => onNavigate('home')}>
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 active:scale-95 transition-transform">
            <span className="font-extrabold text-white tracking-widest text-xl">M</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black tracking-widest text-lg leading-none uppercase">{t.brandName}</span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-[0.2em] mt-1">{t.brandSub}</span>
          </div>
        </div>

        {/* Search Bar - Sidebar version */}
        <div className="px-4 py-4 lg:py-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={summonerSearchQuery}
              onChange={(e) => setSummonerSearchQuery(e.target.value)}
              className="w-full bg-[#131a2c] text-white placeholder-slate-500 text-xs px-4 py-3 pl-10 rounded-xl border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <button
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold mb-6 ${currentView === 'home' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
          >
            <Compass className={`w-4 h-4 ${currentView === 'home' ? 'text-indigo-400' : 'text-slate-500'}`} />
            {t.navHome}
          </button>

          <NavGroup title={lang === 'vi' ? 'Thư Viện ĐTCL' : 'Meta Data & DB'} items={dbItems} />
          <NavGroup title={lang === 'vi' ? 'Công Cụ Trận Đấu' : 'Combat Tools'} items={helperItems} />
          <NavGroup title={lang === 'vi' ? 'Góc Sáng Tạo' : 'Creator & Guides'} items={creatorItems} />

          <div className="mb-2">
            <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">
              {lang === 'vi' ? 'Hệ Thống' : 'System'}
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => { onNavigate('patch_notes'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-semibold group ${currentView === 'patch_notes' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'}`}
              >
                <Terminal className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                {t.navPatch}
              </button>
              
              <button
                onClick={() => { onNavigate('pricing'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-bold group ${currentView === 'pricing' ? 'bg-indigo-600/10 text-indigo-400' : 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'}`}
              >
                <Crown className="w-4 h-4 text-indigo-500 group-hover:text-indigo-400" />
                {lang === 'vi' ? 'Nâng Cấp Premium' : 'Premium Upgrade'}
              </button>
            </div>
          </div>
        </div>

        {/* User Card & Settings */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0c121f]">
          <div className="flex items-center gap-2 mb-4 justify-between px-1">
            <div className="flex items-center bg-[#131a2c] border border-slate-800 p-0.5 rounded-lg text-[9px] font-mono font-bold select-none h-8 max-w-[100px]">
              <button
                onClick={() => setLang('en')}
                className={`flex-1 px-2 h-full rounded transition-all flex items-center justify-center ${lang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('vi')}
                className={`flex-1 px-2 h-full rounded transition-all flex items-center justify-center ${lang === 'vi' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                VI
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-8 h-8 rounded-lg bg-[#131a2c] flex items-center justify-center border border-slate-800 text-slate-400 hover:text-white transition-colors relative"
              >
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-[5px] right-[5px] w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" />
              </button>
              
              {showNotifications && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#131a2c] border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-[#172036]">
                    <span className="text-xs font-bold text-white tracking-wide">{t.liveAlerts}</span>
                    <span className="text-[9px] text-pink-400 font-mono font-bold uppercase animate-pulse">{t.newAlerts}</span>
                  </div>
                  <div className="divide-y divide-slate-800 text-xs">
                    <div className="p-3 text-slate-300 hover:bg-[#1a233b] transition-colors cursor-pointer" onClick={() => { onNavigate('patch_notes'); setShowNotifications(false); }}>
                      <p className="font-semibold text-white">Patch 14.6 Live!</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">Syndra and Arcanists have been buffed.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => { onNavigate(isRegistered ? 'user_profile' : 'auth_view'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              isRegistered
                ? 'bg-[#131a2c] border border-slate-800 hover:bg-[#1a233b]'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isRegistered ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <User className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-xs font-bold text-white line-clamp-1">{lang === 'vi' ? 'Tài Khoản Elite' : 'Elite Account'}</p>
                  <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/> Online
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-xs font-bold tracking-wider mx-auto">{t.joinElite}</span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
