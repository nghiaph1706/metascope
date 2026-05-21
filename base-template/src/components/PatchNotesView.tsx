import React, { useState } from 'react';
import { Terminal, Shield, Swords, Sparkles, Sliders, ChevronDown, ChevronUp, AlertCircle, Info, Hammer } from 'lucide-react';
import { PATCH_NOTES } from '../data/patches';
import { useLanguage } from '../lib/LanguageContext';

export default function PatchNotesView() {
  const patch = PATCH_NOTES[0];
  const [activeTab, setActiveTab] = useState<'all' | 'buff' | 'nerf' | 'adjust'>('all');
  const { lang, t } = useLanguage();

  const filteredItems = patch.items.filter(item => {
    if (activeTab === 'all') return true;
    return item.type === activeTab;
  });

  const getBadgeStyle = (type: 'buff' | 'nerf' | 'adjust') => {
    switch (type) {
      case 'buff': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold';
      case 'nerf': return 'bg-pink-500/10 border-pink-500/20 text-pink-400 font-bold';
      case 'adjust': return 'bg-amber-500/10 border-amber-500/20 text-amber-500 font-bold';
    }
  };

  const getCategoryIcon = (cat: 'champion' | 'trait' | 'item' | 'augment') => {
    switch (cat) {
      case 'champion': return Swords;
      case 'trait': return Shield;
      case 'item': return Hammer;
      default: return Sparkles;
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-4xl mx-auto px-4 sm:px-6 select-none">
      
      {/* Title Header */}
      <div className="bg-gradient-to-br from-[#1c1220] to-[#0e1222] border border-slate-800 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none" />
        
        <div className="space-y-3 relative">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-[9px] font-mono text-pink-400 font-black uppercase tracking-wider">
            {lang === 'vi' ? `KÊNH CHỈ THỊ BẢN ${patch.version}` : `OFFICIAL INTEL LOG ${patch.version}`}
          </div>
          
          <h1 className="text-xl md:text-2xl font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Sứ Thanh Hoa giảm lực, Pháp Sư được tăng cường sức mạnh' : patch.title}</h1>
          <p className="text-xs text-slate-400 font-medium">{lang === 'vi' ? 'Ngày phát hành:' : 'Released online:'} <span className="text-indigo-400 font-mono font-bold">{patch.releaseDate}</span></p>
          <div className="border-t border-slate-800/85 pt-3 mt-3">
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              {lang === 'vi' ? 'Bản cập nhật 14.6 tập trung cân bằng sức mạnh của Porcelain tộc (Sứ Thanh Hoa) đồng thời gia tăng hiệu năng cho Arcanist (Pháp Sư) giúp đa dạng hóa meta game.' : patch.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Filter tab toggling buttons */}
      <div className="bg-[#111827]/70 border border-slate-800 p-3 rounded-2xl flex items-center gap-2">
        {(['all', 'buff', 'nerf', 'adjust'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              activeTab === tab
                ? 'bg-indigo-600 border border-indigo-500/40 text-white'
                : 'bg-transparent border border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'all' 
              ? (lang === 'vi' ? 'Toàn bộ thay đổi' : 'Vertical Log') 
              : `${tab === 'buff' ? (lang === 'vi' ? 'Tăng sức mạnh (Buff)' : 'Buffs') : tab === 'nerf' ? (lang === 'vi' ? 'Giảm sức mạnh (Nerf)' : 'Nerfs') : (lang === 'vi' ? 'Điều chỉnh' : 'Adjustments')}`}
          </button>
        ))}
      </div>

      {/* Item changes list */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const Icon = getCategoryIcon(item.category);
          return (
            <div
              key={item.id}
              className="bg-[#111827]/75 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-lg hover:border-slate-700 transition-colors"
            >
              <div className="flex gap-4 items-start flex-1 min-w-0">
                <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 select-none">
                  <Icon className="w-4.5 h-4.5" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">{item.name}</h3>
                    <span className="text-[10px] text-slate-600">•</span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-800/60 px-1.5 py-0.2 rounded font-semibold">
                      {item.category === 'champion' ? (lang === 'vi' ? 'Tường' : 'Champion') : item.category === 'trait' ? (lang === 'vi' ? 'Tộc hệ' : 'Trait') : item.category === 'item' ? (lang === 'vi' ? 'Trang bị' : 'Item') : (lang === 'vi' ? 'Lõi nâng cấp' : 'Augment')}
                    </span>
                    <span className={`px-2 py-0.2 rounded font-mono text-[9px] uppercase border ${getBadgeStyle(item.type)}`}>
                      {item.type === 'buff' ? (lang === 'vi' ? 'Tăng sức mạnh' : 'Buff') : item.type === 'nerf' ? (lang === 'vi' ? 'Giảm lực' : 'Nerf') : (lang === 'vi' ? 'Cân bằng' : 'Adjust')}
                    </span>
                  </div>

                  <p className="text-slate-300 font-semibold leading-relaxed">
                    {lang === 'vi' && item.id === 'p1' ? 'Mặc định giảm sát thương của Sứ Thanh Hoa bị triệt giảm từ 20%/35%/50% xuống còn 15%/28%/45% giúp đối phương dễ thở hơn.' : 
                     lang === 'vi' && item.id === 'p2' ? 'Sức mạnh phép thuật cộng thêm cho tộc Pháp Sư tăng nhẹ từ 20/45/80 AP lên thành 25/50/85 AP giúp tăng sát thương đầu game.' :
                     lang === 'vi' && item.id === 'p3' ? 'Máp Thủy Thần hồi máu giảm từ 300 xuống 250 ở các vòng đầu để làm giảm tầm ảnh hưởng của các tướng chống chịu sớm.' :
                     item.desc}
                  </p>

                  <div className="bg-[#151c2f]/40 border border-slate-800 p-3 rounded-xl flex gap-2">
                    <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 font-bold uppercase leading-none block mb-1">
                        {lang === 'vi' ? 'Bình luận của Chuyên gia Elite' : 'Elite analyst Commentary'}
                      </span>
                      <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                        {lang === 'vi' && item.id === 'p1' ? 'Ưu tiên né chọn Sứ Thanh Hoa lúc đầu trừ phi bạn có lõi cực ngon; cân nhắc xoay tua sang bài đánh Pháp Sư Định Mệnh.' : 
                         lang === 'vi' && item.id === 'p2' ? 'Bài Syndra Pháp Sư Định Mệnh sẽ cực kỳ bá đạo ở bản này. Hãy cấy đồ nước mắt trước.' :
                         lang === 'vi' && item.id === 'p3' ? 'Giải pháp thay thế tuyệt vời là Giáp Lửa hoặc Vuốt Rồng để gia cố dàn chắn cứng cáp hơn.' :
                         item.impactTips}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
