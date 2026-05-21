import React, { useState } from 'react';
import { Sword, Search, ArrowRight, Shield, Zap, Info } from 'lucide-react';
import { ITEMS, getItemImageUrl } from '../data/champions';
import { useLanguage } from '../lib/LanguageContext';

export default function ItemsView() {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'base' | 'combined' | 'artifact' | 'radiant' | 'emblem'>('combined');

  const tabs = [
    { id: 'combined', label: lang === 'vi' ? 'Đồ Ghép' : 'Combined' },
    { id: 'base', label: lang === 'vi' ? 'Thành Phần' : 'Components' },
    { id: 'artifact', label: lang === 'vi' ? 'Đồ Ornn' : 'Artifacts' },
    { id: 'radiant', label: lang === 'vi' ? 'Đồ Ánh Sáng' : 'Radiant' },
    { id: 'emblem', label: lang === 'vi' ? 'Ấn Tộc Hệ' : 'Emblems' }
  ] as const;

  const filteredItems = ITEMS.filter(item => 
    item.type === selectedTab &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Sword className="w-5 h-5" />
            <span className="text-xs font-bold tracking-widest uppercase">{lang === 'vi' ? 'Kho Trang Bị' : 'Item Armory'}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {lang === 'vi' ? 'Từ Điển Trang Bị' : 'Item Cheat Sheet'}
          </h1>
          <p className="text-slate-400 text-sm max-w-xl font-medium">
            {lang === 'vi' 
              ? 'Tra cứu nhanh công thức ghép đồ, chỉ số cơ bản và hiệu ứng đặc biệt của mọi trang bị trong meta hiện tại.'
              : 'Quickly look up crafting recipes, base stats, and special effects for all items in the current meta.'}
          </p>
        </div>

        <div className="flex-1 max-w-md w-full relative">
          <input
            type="text"
            placeholder={lang === 'vi' ? 'Tìm tên trang bị...' : 'Search items...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131a2c] text-white text-sm px-4 py-3 pl-11 rounded-2xl border border-slate-800 focus:border-indigo-500 focus:outline-none transition-all shadow-inner"
          />
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-4 mb-6 border-b border-slate-800/80 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all select-none ${
              selectedTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-[#131a2c] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#131a2c] rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">{lang === 'vi' ? 'Không tìm thấy trang bị nào.' : 'No items found matching your search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-[#111827]/80 border border-slate-800 rounded-2xl p-4 flex gap-4 hover:border-indigo-500/50 transition-colors group">
              <div className="w-14 h-14 bg-slate-800 rounded-xl border border-slate-700/80 overflow-hidden shadow-md shrink-0 relative">
                <img src={getItemImageUrl(item.id, item.name)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                {item.tier === 'S' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 font-black text-[9px] text-black flex items-center justify-center rounded-full shadow-sm z-10">S</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-white truncate group-hover:text-indigo-300 transition-colors">{item.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
