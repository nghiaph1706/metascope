import React, { useState } from 'react';
import { Award, Layers, BarChart, DollarSign, Plus, Eye, ThumbsUp, Share2, Copy, Trash2, Check, TrendingUp, Sparkles, CopyPlus } from 'lucide-react';
import { Composition, CreatorStats, WalletState, Transaction } from '../types';
import { INITIAL_CREATOR_STATS, INITIAL_WALLET } from '../data/creator';
import { useLanguage } from '../lib/LanguageContext';

interface CreatorHubViewProps {
  myGuides: Composition[];
  onSelectComp: (comp: Composition) => void;
  onNavigate: (view: string) => void;
  onDeleteGuide: (id: string) => void;
  onDuplicateGuide: (comp: Composition) => void;
}

export default function CreatorHubView({
  myGuides,
  onSelectComp,
  onNavigate,
  onDeleteGuide,
  onDuplicateGuide
}: CreatorHubViewProps) {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'guides' | 'analytics' | 'revenue'>('guides');
  const [stats, setStats] = useState<CreatorStats>(INITIAL_CREATOR_STATS);
  const [wallet, setWallet] = useState<WalletState>(INITIAL_WALLET);
  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);

  const handleWithdraw = () => {
    if (wallet.currentBalance <= 0) return;
    setWithdrawStatus('transitting');
    setTimeout(() => {
      const newTx: Transaction = {
        id: `T_${Date.now().toString().slice(-4)}`,
        date: lang === 'vi' ? 'Vừa xong' : 'Just Now',
        description: lang === 'vi' ? 'Quyết toán ngân hàng tức thì về Stripe' : 'Instant Bank Payout Withdrawal',
        amount: wallet.currentBalance,
        status: 'Pending'
      };

      setWallet(prev => ({
        ...prev,
        currentBalance: 0,
        transactions: [newTx, ...prev.transactions]
      }));
      setWithdrawStatus('success');
      setTimeout(() => setWithdrawStatus(null), 2000);
    }, 1500);
  };

  // SVGs specs helpers
  const maxViews = Math.max(...stats.viewsHistory.map(v => v.views)) + 2000;
  const minViews = Math.min(...stats.viewsHistory.map(v => v.views)) - 2000;
  const areaPoints = stats.viewsHistory.map((v, i) => {
    const x = (i / (stats.viewsHistory.length - 1)) * 540 + 30;
    const y = 140 - ((v.views - minViews) / (maxViews - minViews)) * 100 - 15;
    return `${x},${y}`;
  }).join(' ');

  const barMaxAmount = Math.max(...wallet.monthlyRevenueHistory.map(r => r.amount));

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Góc Nhà Sáng Sáng Tạo' : 'MetaScope Creator Hub'}</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium font-semibold">
            {lang === 'vi' ? 'Theo dõi hiệu năng lượt xem giáo án, thiết kế sa bàn cờ trận thế mới và kiểm soát rút tiền ví doanh thu tài trợ.' : 'Monitor compilation performance indicators, publish strategic tactical drafts, and check pending wallet clearances.'}
          </p>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="border-b border-slate-800 flex gap-2">
        <button
          onClick={() => setActiveTab('guides')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 tracking-wider ${
            activeTab === 'guides' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'vi' ? `Giáo Án Của Tôi (${myGuides.length})` : `My Guides (${myGuides.length})`}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 tracking-wider ${
            activeTab === 'analytics' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'vi' ? 'Phân Tích Lượt Xem' : 'Analytics Dashboard'}
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 tracking-wider ${
            activeTab === 'revenue' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'vi' ? 'Thu Nhập & Ví Tiền' : 'Earnings & Wallet'}
        </button>
      </div>

      {/* Tab contexts */}
      {activeTab === 'guides' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-[#13192a]/50 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              {lang === 'vi' ? 'DANH SÁCH GIÁO ÁN ĐÃ THIẾT KẾ' : 'ACTIVE MANAGED COMPOSITIONS'}
            </span>
            <button
              onClick={() => onNavigate('create_guide')}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {lang === 'vi' ? 'Tạo giáo án mới' : 'Compose Roster'}
            </button>
          </div>

          {myGuides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myGuides.map((comp) => (
                <div
                  key={comp.id}
                  className="bg-[#111827]/75 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black tracking-wider border ${
                        comp.tier === 'S' ? 'bg-pink-500/15 text-pink-400 border-pink-500/25' : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                      }`}>
                        {lang === 'vi' ? `GIÁO ÁN BẬC ${comp.tier}` : `${comp.tier}-TIER DRAFT`}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{lang === 'vi' ? 'Vừa mới cập nhật' : `Last updated ${comp.updatedAt}`}</span>
                    </div>

                    <h3
                      onClick={() => { onSelectComp(comp); onNavigate('guide_details'); }}
                      className="text-xs font-black text-white hover:text-indigo-400 cursor-pointer uppercase transition-colors"
                    >
                      {lang === 'vi' && comp.id === 'c1' ? 'Định Mệnh Syndra Thể Độc Tôn' : 
                       lang === 'vi' && comp.id === 'c2' ? 'Sứ Thanh Hoa Thần Thoại Ashe Gánh Đội' : 
                       lang === 'vi' && comp.id === 'c3' ? 'U Tối Khả Ố Yone Đồ Sát Đấu Trường' : 
                       comp.name}
                    </h3>
                    <p className="text-[10.5px] text-slate-400 line-clamp-2 leading-relaxed">
                      {lang === 'vi' && comp.id === 'c1' ? 'Vận hành tối ưu tại cấp 8, liên thông sức mạnh Định Mệnh Syndra và kích hoạt mốc Pháp Sư gieo rắc nổi khiếp sợ.' :
                       lang === 'vi' && comp.id === 'c2' ? 'Xả sát thương cực mạnh từ Ashe và dàn chắn cứng cáp từ Amumu cùng các tướng hộ vệ cấp cao.' :
                       comp.description}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="mt-5 border-t border-slate-800/80 pt-3 flex items-center justify-between gap-4 select-none">
                    <button
                      onClick={() => { onSelectComp(comp); onNavigate('guide_details'); }}
                      className="text-xs text-indigo-400 hover:text-white font-bold"
                    >
                      {lang === 'vi' ? 'Xem chi tiết sa bàn' : 'Inspect board'}
                    </button>

                    <div className="flex items-center gap-2 text-xs">
                      {/* Duplicate */}
                      <button
                        onClick={() => onDuplicateGuide(comp)}
                        className="w-8 h-8 rounded-lg bg-[#182035]/50 border border-slate-800 text-slate-350 hover:text-white flex items-center justify-center transition-all select-none"
                        title={lang === 'vi' ? 'Nhân bản' : 'Duplicate'}
                      >
                        <CopyPlus className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteGuide(comp.id)}
                        className="w-8 h-8 rounded-lg bg-pink-500/10 hover:bg-pink-500 border border-pink-500/20 hover:border-transparent text-pink-400 hover:text-white flex items-center justify-center transition-all select-none"
                        title={lang === 'vi' ? 'Xóa' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 bg-[#111827]/30 border border-slate-800 border-dashed rounded-2xl select-none">
              <Plus className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-200">{lang === 'vi' ? 'Bạn Chưa Tạo Giáo Án Nào' : 'No Custom Guides Authored Yet'}</p>
              <p className="text-xs mt-1 text-slate-500">
                {lang === 'vi' ? 'Hãy thiết kế các giáo án chiến thuật tầm cỡ và sắp đặt các ô cờ lục giác để theo dõi đội hình riêng.' : 'Create beautiful tactical compositions and positioning hex nodes to track custom rosters.'}
              </p>
              <button
                onClick={() => onNavigate('create_guide')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-xl active:scale-95 transition-transform font-bold"
              >
                {lang === 'vi' ? 'Thiết Kế Giáo Án Đầu Tiên' : 'Compose My First Guide'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Quick numbers cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
            <div className="bg-[#111827]/70 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">{lang === 'vi' ? 'LƯỢT TRA CỨU NHẬN ĐƯỢC' : 'VIEWS RECEIVED'}</span>
              <p className="text-2xl font-mono font-black text-white mt-1">{(stats.views).toLocaleString()}</p>
            </div>
            <div className="bg-[#111827]/70 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">{lang === 'vi' ? 'ĐÁNH GIÁ TỐT (UPVOTES)' : 'UPVOTES METRICS'}</span>
              <p className="text-2xl font-mono font-black text-white mt-1">{(stats.upvotes).toLocaleString()}</p>
            </div>
            <div className="bg-[#111827]/70 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">{lang === 'vi' ? 'LƯỢT LƯU TRỮ / COPY' : 'GUIDES SAVED/COPIED'}</span>
              <p className="text-2xl font-mono font-black text-emerald-400 mt-1">{(stats.copies).toLocaleString()}</p>
            </div>
            <div className="bg-[#111827]/70 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase">{lang === 'vi' ? 'CHỈ SỐ CHIA SẺ' : 'SHARES INDEX'}</span>
              <p className="text-2xl font-mono font-black text-indigo-400 mt-1">{(stats.shares).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Views progress Area Chart */}
            <div className="bg-[#111827]/70 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-1.5 font-bold">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Lưu Lượng Lượt Xem Theo Ngày' : 'Traffic views Over Time'}</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{lang === 'vi' ? '9 NGÀY TRUY LỰC GẦN NHẤT' : 'RECENT 9 DAYS TRACTION'}</span>
              </div>

              <div className="relative h-44 w-full select-none">
                <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="views-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline */}
                  {[0, 1, 2].map((idx) => {
                    const y = (idx / 2) * 100 + 15;
                    return (
                      <line
                        key={idx}
                        x1="0"
                        y1={y}
                        x2="600"
                        y2={y}
                        stroke="#1e293b"
                        strokeWidth="0.8"
                        strokeDasharray="4,4"
                      />
                    );
                  })}

                  <path
                    d={`M 30,135 L ${areaPoints} L 570,135 Z`}
                    fill="url(#views-gradient)"
                  />

                  <path
                    d={`M ${areaPoints}`}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {stats.viewsHistory.map((v, i) => {
                    const x = (i / (stats.viewsHistory.length - 1)) * 540 + 30;
                    const y = 140 - ((v.views - minViews) / (maxViews - minViews)) * 100 - 15;
                    return (
                      <g key={i} className="group cursor-pointer">
                        <circle cx={x} cy={y} r="3.5" fill="#818cf8" stroke="#111827" strokeWidth="1.5" />
                        <text
                          x={x}
                          y={y - 8}
                          fontSize="8"
                          fill="#e2e8f0"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="font-bold hidden group-hover:block"
                        >
                          {v.views}
                        </text>
                        {/* bottom text date */}
                        <text
                          x={x}
                          y="135"
                          fontSize="7"
                          fill="#475569"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="font-bold"
                        >
                          {v.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Click conversion index */}
            <div className="bg-[#111827]/70 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <h3 className="text-xs font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Tỷ Lệ Chuyển Đổi Sao Chép' : 'Guide copy Conversion Rate'}</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{lang === 'vi' ? 'CHUYỂN ĐỔI TRUNG BÌNH: 6.2%' : 'AVERAGE COPY CONVERSION: 6.2%'}</span>
              </div>

              <div className="relative h-44 w-full select-none">
                <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
                  {[0, 1, 2].map((idx) => {
                    const y = (idx / 2) * 100 + 15;
                    return (
                      <line
                        key={idx}
                        x1="0"
                        y1={y}
                        x2="600"
                        y2={y}
                        stroke="#1e293b"
                        strokeWidth="0.8"
                        strokeDasharray="4,4"
                      />
                    );
                  })}

                  <path
                    d={`M ${stats.conversionHistory.map((c, i) => {
                      const x = (i / (stats.conversionHistory.length - 1)) * 540 + 30;
                      const y = 140 - (c.rate / 10) * 100 - 15;
                      return `${x},${y}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {stats.conversionHistory.map((c, i) => {
                    const x = (i / (stats.conversionHistory.length - 1)) * 540 + 30;
                    const y = 140 - (c.rate / 10) * 100 - 15;
                    return (
                      <g key={i} className="group cursor-pointer">
                        <circle cx={x} cy={y} r="3.5" fill="#f472b6" stroke="#111827" strokeWidth="1.5" />
                        <text
                          x={x}
                          y={y - 8}
                          fontSize="8"
                          fill="#e2e8f0"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="font-bold hidden group-hover:block"
                        >
                          {c.rate}%
                        </text>
                        <text x={x} y="135" fontSize="7" fill="#475569" fontFamily="monospace" textAnchor="middle">
                          {c.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          
          {/* Revenue overall metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
            
            <div className="bg-[#111827]/70 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase leading-none block">{lang === 'vi' ? 'TỔNG DOANH THU ĐÃ KHAI THÁC' : 'TOTAL REVENUE GENERATED'}</span>
                <p className="text-3xl font-mono font-black text-white block mt-3">${wallet.totalEarnings.toFixed(2)}</p>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">{lang === 'vi' ? 'Đã bao gồm tiền hỗ trợ từ quỹ chung và nhà tài trợ.' : 'All-time pool and sponsor allowances included.'}</p>
            </div>

            <div className="bg-gradient-to-br from-[#121b2d] to-[#111827] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase leading-none block">{lang === 'vi' ? 'SỐ DƯ VÍ KHẢ DỤNG HIỆN TẠI' : 'CURRENT WALLET BALANCE'}</span>
                <p className="text-3xl font-mono font-black text-emerald-400 block mt-3">${wallet.currentBalance.toFixed(2)}</p>
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  disabled={wallet.currentBalance <= 0 || withdrawStatus !== null}
                  onClick={handleWithdraw}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-[#1f293d] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-bold tracking-wider uppercase text-[10px] transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/20 disabled:shadow-none"
                >
                  {withdrawStatus === 'transitting' ? (lang === 'vi' ? 'Đang chuyển khoản...' : 'Transferring Clearances...') :
                   withdrawStatus === 'success' ? (lang === 'vi' ? 'Đã Gửi Thành Công' : 'Withdrawal Completed') :
                   (lang === 'vi' ? 'Rút Tiền Về Ngân Hàng' : 'Withdraw Balance to Stripe')}
                </button>
              </div>
            </div>

            <div className="bg-[#111827]/70 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase leading-none block">{lang === 'vi' ? 'THU NHẬP ĐANG DUYỆT' : 'PENDING CLEARANCES'}</span>
                <p className="text-3xl font-mono font-black text-amber-500 block mt-3">${wallet.pendingBalance.toFixed(2)}</p>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">{lang === 'vi' ? 'Ngày quyết toán định kỳ tiếp theo:' : 'Scheduled next payout clearance:'} <span className="font-bold text-white font-mono">{wallet.nextPayoutDate}</span></p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
            
            {/* SVG Monthly earnings revenue bars (1/3 width) */}
            <div className="lg:col-span-1 bg-[#111827]/75 border border-slate-800 p-5 rounded-3xl flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-xs font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Doanh Thu Hằng Tháng' : 'Monthly Revenue Gains'}</h3>
                <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">{lang === 'vi' ? 'DOANH THU ĐỘI NGŨ NĂM 2026' : 'CALENDAR 2026 INCOME CODES'}</span>
              </div>

              {/* Vertical Bars Chart */}
              <div className="h-44 w-full flex items-end justify-between font-mono text-[10px]">
                {wallet.monthlyRevenueHistory.map((m, idx) => {
                  const barHeight = (m.amount / barMaxAmount) * 110;
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 gap-1.5 group select-none cursor-pointer">
                      <span className="text-[8px] font-bold text-slate-400 font-mono invisible group-hover:visible">
                        ${m.amount}
                      </span>
                      <div
                        className="w-8 bg-indigo-600/30 group-hover:bg-indigo-500 border border-indigo-500/20 rounded-t-md transition-all duration-300"
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-slate-500 font-bold uppercase">
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invoices transactional ledger (2/3 width) */}
            <div className="lg:col-span-2 bg-[#111827]/75 border border-slate-800 p-5 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <h3 className="text-xs font-black text-white tracking-widest uppercase">
                  {lang === 'vi' ? 'Sổ Giao Dịch Thu Nhập' : 'Transactional Ledger'}
                </h3>
                <span className="block sm:hidden text-[9px] text-indigo-400 font-mono bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded animate-pulse w-fit self-end">{lang === 'vi' ? '← Gạt sang ngang để xem trạng thái →' : '← Swipe horizontal to view status →'}</span>
              </div>
              
              <div className="overflow-x-auto text-[11px] font-medium leading-none">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold tracking-widest uppercase">
                      <th className="py-2">TXID</th>
                      <th className="py-2">{lang === 'vi' ? 'NGÀY' : 'DATE'}</th>
                      <th className="py-2">{lang === 'vi' ? 'NỘI DUNG' : 'DESCRIPTION'}</th>
                      <th className="py-2 text-right">{lang === 'vi' ? 'SỐ TIỀN' : 'AMOUNT'}</th>
                      <th className="py-2 text-center">{lang === 'vi' ? 'TRẠNG THÁI' : 'STATUS'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-350 font-semibold select-none">
                    {wallet.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/5">
                        <td className="py-3 font-bold text-indigo-400">{tx.id}</td>
                        <td className="py-3 text-slate-500">{tx.date}</td>
                        <td className="py-3 text-white max-w-[200px] truncate">
                          {lang === 'vi' && tx.description.includes('Instant Bank') ? 'Rút tiền nhanh về tài khoản liên kết Stripe' : 
                           lang === 'vi' && tx.description.includes('Sponsor Grant') ? 'Tài trợ chiến lược từ quỹ cộng đồng ĐTCL' : 
                           lang === 'vi' && tx.description.includes('Tips Allowance') ? 'Tiền thưởng từ độc giả hâm mộ giáo án' : 
                           tx.description}
                        </td>
                        <td className="py-3 text-right font-bold">${tx.amount.toFixed(2)}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-block py-0.5 px-1.5 rounded text-[9px] font-black tracking-wider ${
                            tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'bg-amber-500/10 text-amber-500 font-bold'
                          }`}>
                            {tx.status === 'Completed' ? (lang === 'vi' ? 'Hoàn tất' : 'Completed') : (lang === 'vi' ? 'Chờ duyệt' : 'Pending')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
