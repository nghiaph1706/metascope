import React, { useState } from 'react';
import { Percent, Info } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

export default function RollingOddsView() {
  const { lang } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');

  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const oddsData: Record<number, number[]> = {
    1: [100, 0, 0, 0, 0],
    2: [100, 0, 0, 0, 0],
    3: [75, 25, 0, 0, 0],
    4: [55, 30, 15, 0, 0],
    5: [45, 33, 20, 2, 0],
    6: [30, 40, 25, 5, 0],
    7: [19, 30, 40, 10, 1],
    8: [18, 25, 32, 22, 3],
    9: [10, 20, 25, 35, 10],
    10: [5, 10, 20, 40, 25],
    11: [1, 2, 12, 50, 35],
  };

  const costColors = [
    'text-slate-400 bg-slate-500/10 border-slate-500/20',
    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'text-amber-400 bg-amber-500/10 border-amber-500/20'
  ];

  const barColors = [
    'bg-slate-500',
    'bg-emerald-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-amber-500'
  ];

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111827]/70 border border-slate-800 p-6 rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Percent className="w-6 h-6" />
          </div>
          <div>
             <h1 className="text-xl font-black text-white tracking-widest uppercase">
              {lang === 'vi' ? 'Tỉ Lệ Cửa Hàng' : 'Rolling Odds'}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {lang === 'vi' ? 'Toán học tỉ lệ xuất hiện của các tướng dựa trên cấp độ hiện tại.' : 'Shop champion tier drop rates depending on your current level.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#111827]/75 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase mr-2">{lang === 'vi' ? 'Cấp độ:' : 'Level:'}</span>
           <button
              onClick={() => setSelectedLevel('all')}
              className={`w-10 h-10 rounded-xl font-mono font-bold transition-all ${
                selectedLevel === 'all'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-[#181f32]/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              } border`}
            >
              {lang === 'vi' ? 'Tất Cả' : 'ALL'}
          </button>
          {levels.map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`w-10 h-10 rounded-xl font-mono font-bold transition-all ${
                selectedLevel === level
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-[#181f32]/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              } border text-sm`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[600px]">
             <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono tracking-wider">
                  <th className="py-4 px-4 font-bold">{lang === 'vi' ? 'CẤP ĐỘ' : 'LEVEL'}</th>
                  <th className="py-4 px-4 text-center font-bold">1 {lang === 'vi' ? 'VÀNG' : 'COST'}</th>
                  <th className="py-4 px-4 text-center font-bold">2 {lang === 'vi' ? 'VÀNG' : 'COST'}</th>
                  <th className="py-4 px-4 text-center font-bold">3 {lang === 'vi' ? 'VÀNG' : 'COST'}</th>
                  <th className="py-4 px-4 text-center font-bold">4 {lang === 'vi' ? 'VÀNG' : 'COST'}</th>
                  <th className="py-4 px-4 text-center font-bold">5 {lang === 'vi' ? 'VÀNG' : 'COST'}</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-800/60 font-mono">
                {levels.filter(l => selectedLevel === 'all' || selectedLevel === l).map(level => (
                  <tr key={level} className="hover:bg-white/5 transition-colors group">
                    <td className="py-5 px-4 font-bold text-white text-base">
                      {lang === 'vi' ? 'Cấp ' : 'Lv '} {level}
                    </td>
                    {oddsData[level].map((chance, idx) => (
                      <td key={idx} className="py-5 px-4">
                        {chance > 0 ? (
                           <div className="flex flex-col items-center gap-2">
                             <span className={`inline-block px-2 py-1 rounded font-bold border ${costColors[idx]}`}>
                                {chance}%
                             </span>
                             <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                               <div className={`h-full ${barColors[idx]} opacity-80`} style={{ width: `${chance}%` }} />
                             </div>
                           </div>
                        ) : (
                          <div className="text-center text-slate-600 font-bold">-</div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
             </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
           <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
           <p className="text-sm text-indigo-200/80 font-medium">
             {lang === 'vi' 
               ? 'Bảng xếp hạng vàng biểu thị cơ hội ra tướng cho mỗi slot trong cửa hàng khi bạn roll ở cùng level. Các tỷ lệ có thể thay đổi trong những bản cập nhật meta tương lai.'
               : 'The percentages signify the drop rate per shop slot for champions of specific costs. Keep in mind that pool sizes also affect variance.'}
           </p>
        </div>
      </div>
    </div>
  );
}
