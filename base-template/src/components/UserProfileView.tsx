import React, { useState } from 'react';
import { User, Mail, Shield, Zap, CreditCard, Activity, Clock, Settings, LogOut, ChevronRight, Crown, Star } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface UserProfileViewProps {
  userTier: 'free' | 'basic' | 'premium';
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export default function UserProfileView({ userTier, onNavigate, onLogout }: UserProfileViewProps) {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

  const getTierIcon = () => {
    switch (userTier) {
      case 'premium': return <Crown className="w-6 h-6 text-amber-500" />;
      case 'basic': return <Star className="w-6 h-6 text-indigo-400" />;
      default: return <User className="w-6 h-6 text-slate-400" />;
    }
  };

  const getTierName = () => {
    switch (userTier) {
      case 'premium': return lang === 'vi' ? 'Thách Đấu (Premium)' : 'Challenger (Premium)';
      case 'basic': return lang === 'vi' ? 'Tuyển Thủ (Basic)' : 'Pro (Basic)';
      default: return lang === 'vi' ? 'Cơ Bản (Free)' : 'Basic (Free)';
    }
  };

  const getTierColor = () => {
    switch (userTier) {
      case 'premium': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'basic': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
      default: return 'text-slate-300 bg-slate-800/50 border-slate-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 select-none">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-white">{lang === 'vi' ? 'Tài Khoản Của Tôi' : 'My Account'}</h1>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors bg-red-400/10 hover:bg-red-400/20 px-4 py-2 rounded-xl"
        >
          <LogOut className="w-4 h-4" />
          {lang === 'vi' ? 'Đăng Xuất' : 'Log Out'}
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 px-2 text-sm font-bold transition-all relative ${
            activeTab === 'overview' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {lang === 'vi' ? 'Tổng Quan' : 'Overview'}
          {activeTab === 'overview' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-4 px-2 text-sm font-bold transition-all relative ${
            activeTab === 'settings' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {lang === 'vi' ? 'Cài Đặt & Quyền Riêng Tư' : 'Settings & Privacy'}
          {activeTab === 'settings' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1 bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${getTierColor()}`}>
                {getTierIcon()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">PlayerOne_TFT</h2>
                <p className="text-sm text-slate-400 flex items-center justify-center gap-1 mt-1">
                  <Mail className="w-3 h-3" /> player.one@demo.com
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getTierColor()}`}>
                {getTierName()}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">{lang === 'vi' ? 'Ngày tham gia' : 'Joined'}</span>
                <span className="text-slate-300 font-medium">May 2024</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">{lang === 'vi' ? 'Liên kết Riot' : 'Riot Linked'}</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Shield className="w-3 h-3" /> {lang === 'vi' ? 'Đã liên kết' : 'Linked'}
                </span>
              </div>
            </div>
          </div>

          {/* Activity & Subscription */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-[#172036] to-[#0c121f] border border-indigo-500/20 rounded-3xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    {lang === 'vi' ? 'Gói Đăng Ký' : 'Subscription Plan'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {lang === 'vi' ? 'Quản lý gói cước và quyền lợi của bạn.' : 'Manage your billing and tier benefits.'}
                  </p>
                </div>
                {userTier !== 'premium' && (
                  <button onClick={() => onNavigate('pricing')} className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-lg shadow-amber-500/20 whitespace-nowrap">
                    {lang === 'vi' ? 'Nâng Cấp' : 'Upgrade'}
                  </button>
                )}
              </div>
              
              <div className="bg-[#0c121f]/50 rounded-2xl p-4 border border-slate-800/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTierColor()}`}>
                      {getTierIcon()}
                    </div>
                    <div>
                      <div className="font-bold text-white">{getTierName()}</div>
                      <div className="text-xs text-slate-500">
                        {userTier === 'free' 
                          ? (lang === 'vi' ? 'Sử dụng miễn phí trọn đời' : 'Free forever')
                          : (lang === 'vi' ? 'Gia hạn tự động hàng tháng' : 'Renews automatically every month')}
                      </div>
                    </div>
                  </div>
                  {userTier !== 'free' && (
                    <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                      {lang === 'vi' ? 'Quản lý thanh toán' : 'Manage Billing'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-3">
                <Activity className="w-6 h-6 text-emerald-400" />
                <h4 className="font-bold text-white">
                  {lang === 'vi' ? 'Lượt Phân Tích AI' : 'AI Analysis Quota'}
                </h4>
                <p className="text-2xl font-black text-white font-mono">
                  {userTier === 'free' ? '1/1' : userTier === 'basic' ? '2/2' : '∞'}
                  <span className="text-sm text-slate-500 font-sans ml-1">
                    {userTier === 'free' ? (lang === 'vi' ? '/ tuần' : '/ week') : userTier === 'basic' ? (lang === 'vi' ? '/ ngày' : '/ day') : ''}
                  </span>
                </p>
              </div>
              <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-3">
                <Clock className="w-6 h-6 text-blue-400" />
                <h4 className="font-bold text-white">
                  {lang === 'vi' ? 'Lịch Sử Tra Cứu' : 'Recent Searches'}
                </h4>
                <p className="text-2xl font-black text-white font-mono">
                  14 <span className="text-sm text-slate-500 font-sans ml-1">{lang === 'vi' ? 'lần' : 'times'}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 space-y-6 max-w-2xl">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">{lang === 'vi' ? 'Cài Đặt Ứng Dụng' : 'App Settings'}</h3>
            <div className="flex items-center justify-between py-3 border-b border-slate-800 hover:bg-slate-800/30 px-2 rounded-lg cursor-pointer transition-colors">
              <div>
                <div className="font-medium text-slate-300">{lang === 'vi' ? 'Nhận thông báo' : 'Push Notifications'}</div>
                <div className="text-xs text-slate-500">{lang === 'vi' ? 'Khi meta thay đổi' : 'When meta changes'}</div>
              </div>
              <div className="w-10 h-5 bg-indigo-500 rounded-full relative">
                <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-800 hover:bg-slate-800/30 px-2 rounded-lg cursor-pointer transition-colors">
              <div>
                <div className="font-medium text-slate-300">{lang === 'vi' ? 'Ngôn ngữ Email' : 'Email Language'}</div>
                <div className="text-xs text-slate-500">{lang === 'vi' ? 'Tiếng Việt' : 'English'}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-bold text-white">{lang === 'vi' ? 'Bảo Mật' : 'Security'}</h3>
            <div className="flex items-center justify-between py-3 border-b border-slate-800 hover:bg-slate-800/30 px-2 rounded-lg cursor-pointer transition-colors">
              <div>
                <div className="font-medium text-slate-300">{lang === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}</div>
                <div className="text-xs text-slate-500">********</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-800 hover:bg-slate-800/30 px-2 rounded-lg cursor-pointer transition-colors">
              <div>
                <div className="font-medium text-red-400">{lang === 'vi' ? 'Xóa tài khoản' : 'Delete Account'}</div>
                <div className="text-xs text-slate-500">{lang === 'vi' ? 'Hành động này không thể hoàn tác' : 'This action cannot be undone'}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
