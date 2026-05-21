import React, { useState } from 'react';
import { Edit, Sparkles, Plus, Trash2, Check, AlertCircle, Info, Star } from 'lucide-react';
import { Composition, HexPosition, Champion, Tier } from '../types';
import { CHAMPIONS, ITEMS, getChampionImageUrl, getItemImageUrl } from '../data/champions';
import { useLanguage } from '../lib/LanguageContext';

const CHAMPION_ABILITIES: Record<string, { abilityName: string; desc: string; abilityNameVi: string; descVi: string }> = {
  ahri: { 
    abilityName: 'Spirit Fire', 
    desc: 'Deals magic damage to the current target and adjacent enemies. Increases Arcanist Ability Power.',
    abilityNameVi: 'Xung Kích Khô Héo',
    descVi: 'Gây sát thương phép lên mục tiêu hiện tại và kẻ địch liền kề. Đồng thời gia tăng Tỷ lệ Sức mạnh Phép thuật của Pháp Sư.'
  },
  yasuo: { 
    abilityName: 'Wind Wall', 
    desc: 'Gains a shielding buffer for 5 seconds and strikes the current target for scaling physical damage.',
    abilityNameVi: 'Tường Gió Bảo Hộ',
    descVi: 'Nhận một lượng lá chắn hộ mệnh trong 5 giây và chém mục tiêu hiện hành gây sát thương vật lý gia tăng.'
  },
  jax: { 
    abilityName: 'Counter Strike', 
    desc: 'Gains significant bonus Armor and Magic Resist for 2 seconds, then deals magic damage to adjacent enemies.',
    abilityNameVi: 'Phản Công Thần Tốc',
    descVi: 'Nhận thêm lượng Giáp và Kháng Phép cực lớn trong 2 giây, sau đó quét gậy gây sát thương phép lên địch xung quanh.'
  },
  lux: { 
    abilityName: 'Lucent Binding', 
    desc: 'Fires a light beam towards the farthest enemy, stunning and dealing magic damage to all enemies hit.',
    abilityNameVi: 'Khóa Ánh Sáng',
    descVi: 'Bắn tia cầu sáng về phía kẻ địch xa nhất, làm choáng và gây sát thương phép diện rộng lên mọi nạn nhân nằm trên đường bay.'
  },
  neeko: { 
    abilityName: 'Neeko\'s Blossom', 
    desc: 'Hops into the air and slams down, healing self and dealing magic damage to adjacent enemies.',
    abilityNameVi: 'Pháo Hoa Nở Rộ',
    descVi: 'Nhảy vọt lên không và nện mạnh xuống mặt đất, tự hồi phục cho bản thân và gây sát thương phép lên kẻ địch xung quanh.'
  },
  janna: { 
    abilityName: 'Sweeping Gale', 
    desc: 'Grants a defensive shield to the lowest health allies and deals magic damage to the nearest enemies.',
    abilityNameVi: 'Gió Lốc Phòng Thủ',
    descVi: 'Ban cấp lá chắn phòng ngự cho đồng minh thấp máu nhất và phóng lốc gây sát thương phép lên nhóm đối phương gần nhất.'
  },
  kindred: { 
    abilityName: 'Dance of Dread', 
    desc: 'Leaps away from the current target, firing arrows that deal magic damage.',
    abilityNameVi: 'Vũ Điệu Cừu Đen',
    descVi: 'Nhảy né khỏi mục tiêu hiện tại và phóng mũi tên sát thương phép vào mông đối thủ.'
  },
  gnar: { 
    abilityName: 'Boulder Throw', 
    desc: 'Tosses a boulder at the current target, dealing physical damage and gaining stacking Attack Damage.',
    abilityNameVi: 'Ném Đá Cổ Đại',
    descVi: 'Quăng tảng đá đại thụ vào kẻ địch hiện hành, gây sát thương vật lý và nhận thêm Sát thương Vật lý cộng dồn vô hạn.'
  },
  zoe: { 
    abilityName: 'Trouble Bubble', 
    desc: 'Launches a bubble at the current target, dealing magic damage and ricocheting to adjacent targets.',
    abilityNameVi: 'Bóng Ngủ Rắc Rối',
    descVi: 'Ném bong bóng vào kẻ địch hiện tại gây sát thương pháp thuật, bong bóng nảy sang các mục tiêu lân cận.'
  },
  illaoi: { 
    abilityName: 'Prophet of the Elder', 
    desc: 'Summons tentacles that smash down, dealing magic damage and healing Illaoi.',
    abilityNameVi: 'Lời Răn Thần Linh',
    descVi: 'Kích hoạt xúc tu đập mạnh xuống đất, gây sát thương phép và hồi phục sinh mạng cho Illaoi.'
  },
  thresh: { 
    abilityName: 'The Passage', 
    desc: 'Shields himself and the lowest health ally, dealing magic damage to adjacent enemies.',
    abilityNameVi: 'Con Đường Hộ Mệnh',
    descVi: 'Tạo lá chắn hộ vệ cho bản thân và đồng minh thấp máu nhất, rồi quét xích gây sát thương phép xung quanh.'
  },
  aphelios: { 
    abilityName: 'Moonlight Vigil', 
    desc: 'Fires a wave of moonlight, reducing armor on hit enemies and dealing physical damage.',
    abilityNameVi: 'Ánh Trăng Dẫn Lối',
    descVi: 'Phóng luồng sóng ánh trăng làm giảm Giáp của các nạn nhân dính chiêu và nổ sát thương vật lý mạnh mẽ.'
  },
  diana: { 
    abilityName: 'Pale Cascade', 
    desc: 'Heals herself and creates a protective shield, dealing magic damage to adjacent enemies.',
    abilityNameVi: 'Thác Bạc Bảo Hộ',
    descVi: 'Hồi phục chính mình, tạo lớp khiên chắn nguy hiểm và gây sát thương phép lên địch thủ kề cận.'
  },
  bard: { 
    abilityName: 'Traveler\'s Tempe', 
    desc: 'Launches magic notes that bounce between nearby targets, dealing magic damage and increasing their damage taken.',
    abilityNameVi: 'Thế Giới Màu Nhiệm',
    descVi: 'Bắn các chuỗi nốt nhạc diệu kỳ nảy giữa các mục tiêu, gây sát thương phép và tăng cường lượng sát thương gánh chịu.'
  },
  syndra: { 
    abilityName: 'Force of Will', 
    desc: 'Summons spirit butterflies that seek out and strike the current target for high magic damage.',
    abilityNameVi: 'Ý Chí Độc Tôn',
    descVi: 'Triệu hồi đàn bướm tâm linh bay đến xuyên thấu mục tiêu hiện hoạt gây lượng sát thương phép bộc phá cực hạn.'
  },
  lillia: { 
    abilityName: 'Blooming Blows', 
    desc: 'Strikes adjacent enemies, dealing magic damage and healing herself on sweet-spots.',
    abilityNameVi: 'Đập Nhịp Nở Hoa',
    descVi: 'Đánh trúng đối thủ bên cạnh gây sát thương phép và giúp Lillia phục hồi máu khi trúng tâm vòng tròn rìa ngoài.'
  },
  ashe: { 
    abilityName: 'Ranger\'s Focus', 
    desc: 'Fires a flurry of arrows at the current target, dealing scaling physical damage.',
    abilityNameVi: 'Chú Tâm Thiện Xạ',
    descVi: 'Xả liên hoàn mũi tên băng giá về phía mục tiêu hiện thời gây lượng sát thương vật lý rát bùng nổ.'
  },
  kaisa: { 
    abilityName: 'Icathian Rain', 
    desc: 'Channels and fires a rapid volley of missiles at the target, dealing physical damage.',
    abilityNameVi: 'Cơn Mưa Icathia',
    descVi: 'Vận sức bắn loạt tên lửa tầm nhiệt dồn dập vào kẻ địch gieo rắc cơn ác mộng sát thương vật lý.'
  },
  galio: { 
    abilityName: 'Shield of Durand', 
    desc: 'Taunts nearby enemies, gaining Armor and Magic Resist before striking for physical damage.',
    abilityNameVi: 'Lá Chắn Durand',
    descVi: 'Khiêu khích nhóm địch gần kề, nhận lượng Giáp và Kháng phép khổng lồ rồi nện đòn sát thương vật lý cực nặng.'
  },
  nautilus: { 
    abilityName: 'Staggering Blow', 
    desc: 'Slams the ground, creating a shockwave towards the target that knocks up and stuns enemies.',
    abilityNameVi: 'Thủy Lôi Trồi Lên',
    descVi: 'Nện mỏ neo xuống đất tạo cơn sóng chấn động làm hất tung và gây choáng nhóm địch thủ dính chiêu.'
  },
  lee_sin: { 
    abilityName: 'Dragon\'s Rage', 
    desc: 'Kicks the target, dealing physical damage and shielding himself with the force generated.',
    abilityNameVi: 'Nộ Long Cước',
    descVi: 'Tung cú sút trời giáng, đá bay mục tiêu, gây lượng sát thương vật lý mạnh mẽ kèm tạo khiên chắn cho Lee Sin.'
  },
  sett: { 
    abilityName: 'The Showstopper', 
    desc: 'Grabs the target and slams them into the ground, dealing % Max Health physical damage.',
    abilityNameVi: 'Hủy Diệt Đấu Trường',
    descVi: 'Nắm cổ mục tiêu gồng mình quật mạnh xuống đất gây sát thương vật lý tính theo phần trăm Máu Tối Đa của đối phương.'
  },
  azir: { 
    abilityName: 'Emperor\'s Divide', 
    desc: 'Summons sand soldiers that charge forward, knocking up and dealing magic damage to enemies.',
    abilityNameVi: 'Phân Chia Thiên Hạ',
    descVi: 'Triệu hồi binh lính cát càn quét về phía trước, hất tung địch và gây lượng sát thương phép dữ dội.'
  },
  hwei: { 
    abilityName: 'Artist\'s Palette', 
    desc: 'Paints a zone on the floor that heals allies and deals magic damage to enemies.',
    abilityNameVi: 'Bảng Màu Rực Rỡ',
    descVi: 'Tô vẽ một khu vực linh thánh dưới đất giúp hồi phục đồng đội và giáng sát thương phép hủy diệt đối phương.'
  },
  lissandra: { 
    abilityName: 'Frozen Tomb', 
    desc: 'Entombs the current target in ice, dealing massive magic damage and stunning them in place.',
    abilityNameVi: 'Hầm Mộ Băng Giá',
    descVi: 'Nhốt mục tiêu hiện thời vào trong quan tài băng, làm choáng hoàn toàn và gây sát thương phép bộc phá cực mạnh.'
  },
  rakan: { 
    abilityName: 'Grand Entrance', 
    desc: 'Dashes into the enemy frontline, knocking up targets and shielding adjacent allies.',
    abilityNameVi: 'Xuất Hiện Hoành Tráng',
    descVi: 'Lao thẳng vào tuyến đầu quân địch, hất tung toàn bộ mục tiêu và tạo lá chắn lớn cho các đồng đội xung quanh.'
  },
  wukong: { 
    abilityName: 'Staff Legend', 
    desc: 'Strikes with his staff, dealing physical damage, shielding and gaining bonus attack speed.',
    abilityNameVi: 'Vô Địch Thiết Bảng',
    descVi: 'Gạt gậy thiết bản cực đại gây sát thương vật lý cực nặng, nhận thêm giáp ảo và gia tốc đòn đánh cực nhanh.'
  }
};

interface CreateGuideViewProps {
  onSaveDraft: (draft: Composition) => void;
  onNavigate: (view: string) => void;
}

export default function CreateGuideView({ onSaveDraft, onNavigate }: CreateGuideViewProps) {
  const [name, setName] = useState('');
  const [tier, setTier] = useState<Tier>('S');
  const [playstyle, setPlaystyle] = useState('Standard Leveling');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [description, setDescription] = useState('');
  const { lang, t } = useLanguage();
  
  // Placement board
  const [positions, setPositions] = useState<HexPosition[]>([]);
  const [selectedChampionId, setSelectedChampionId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

  // Hex interaction modal
  const [activeHex, setActiveHex] = useState<{row: number, col: number, unit: HexPosition} | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // Filter champions
  const [costFilter, setCostFilter] = useState<number | 'all'>('all');
  const filteredChampions = CHAMPIONS.filter(c => costFilter === 'all' || c.cost === costFilter);

  const getCostBorder = (cost: number) => {
    switch (cost) {
      case 1: return 'border-slate-500 hover:border-slate-400';
      case 2: return 'border-emerald-500 hover:border-emerald-400';
      case 3: return 'border-blue-500 hover:border-blue-400';
      case 4: return 'border-purple-500 hover:border-purple-400';
      case 5: return 'border-amber-500 hover:border-amber-400';
      default: return 'border-slate-600';
    }
  };

  const handleHexClick = (row: number, col: number) => {
    const existingIndex = positions.findIndex(p => p.row === row && p.col === col);

    if (existingIndex > -1) {
      // Hex is full. Open config modal.
      setActiveHex({ row, col, unit: positions[existingIndex] });
    } else {
      // Hex is empty. Place selected champion if highlighted.
      if (selectedChampionId) {
        const updated = [...positions];
        updated.push({
          row,
          col,
          championId: selectedChampionId,
          starLevel: 2,
          items: []
        });
        setPositions(updated);
      }
    }
  };

  const handleRemoveUnit = () => {
    if (activeHex) {
      setPositions(positions.filter(p => !(p.row === activeHex.row && p.col === activeHex.col)));
      setActiveHex(null);
    }
  };

  const handleToggleItem = (itemId: string) => {
    if (!activeHex) return;
    const currentItems = activeHex.unit.items || [];
    let nextItems;
    if (currentItems.includes(itemId)) {
      nextItems = currentItems.filter(id => id !== itemId);
    } else {
      if (currentItems.length >= 3) return; // Max 3 items
      nextItems = [...currentItems, itemId];
    }
    
    const nextUnit = { ...activeHex.unit, items: nextItems };
    setActiveHex({ ...activeHex, unit: nextUnit });
    
    setPositions(positions.map(p => {
      if (p.row === activeHex.row && p.col === activeHex.col) {
        return nextUnit;
      }
      return p;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newComp: Composition = {
      id: `draft_${Date.now()}`,
      name,
      tier,
      playstyle,
      difficulty,
      winRate: 54.5,
      top4Rate: 78.2,
      pickRate: 0.85,
      avgPlace: 3.52,
      carryChampions: positions.slice(0, 2).map(p => CHAMPIONS.find(c => c.id === p.championId)?.name || 'Carry'),
      tankChampions: positions.slice(2, 4).map(p => CHAMPIONS.find(c => c.id === p.championId)?.name || 'Tank'),
      traits: ['Custom Vertical'],
      positions,
      earlyUnits: ['Ahri', 'Yasuo'],
      midUnits: ['Lux', 'Neeko'],
      carouselPriority: ['Tear', 'Rod'],
      description: description || (lang === 'vi' ? 'Chưa ghi chú chiến thuật cốt lõi nào. Hãy tiếp tục phát triển sơ đồ đội hình lý tưởng.' : 'No core strategy notes recorded yet. Keep building this composition.'),
      author: 'EliteIntelligence #001',
      updatedAt: 'Just Now'
    };

    setSavingStatus('saving');
    setTimeout(() => {
      onSaveDraft(newComp);
      setSavingStatus('success');
      setTimeout(() => {
        onNavigate('creator_hub');
        setSavingStatus(null);
        // Clear forms
        setName('');
        setDescription('');
        setPositions([]);
      }, 1500);
    }, 1000);
  };

  // Pointy-topped coordinates for the drafting canvas
  const hexRadius = 38;
  const hexWidth = Math.sqrt(3) * hexRadius; // ~65.8
  const hexHeight = 2 * hexRadius; // 76
  const colSpacing = hexWidth;
  const rowSpacing = hexHeight * 0.75; // 57

  const selectedChamp = selectedChampionId ? CHAMPIONS.find(c => c.id === selectedChampionId) : null;
  const selectedAbility = selectedChamp ? CHAMPION_ABILITIES[selectedChamp.id] : null;

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Xưởng Sa Bàn Đội Hình' : 'Guide Creator Studio'}</h1>
          </div>
          <p className="text-xs text-slate-400 font-medium font-semibold">
            {lang === 'vi' ? 'Thiết kế chiến thuật kỉ lục, cấu hình vị trí đứng của từng ô cờ, ghi chú giáo án đỉnh cao chia sẻ cho cộng đồng.' : 'Draft detailed compositions, configure character positioning hex cells, and publish insights for community tracking.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
        
        {/* Editor Form Details (1/3 width) */}
        <div className="space-y-6 bg-[#111827]/70 border border-slate-800 p-6 rounded-3xl h-fit">
          <h3 className="text-xs font-black text-white tracking-widest uppercase border-b border-slate-800 pb-2">
            {lang === 'vi' ? 'Thông Tin Giáo Án' : 'Guide Metadata'}
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">{lang === 'vi' ? 'TÊN ĐỘI HÌNH META *' : 'COMPOSITION NAME *'}</label>
              <input
                type="text"
                required
                placeholder={lang === 'vi' ? 'Ví dụ: Định Mệnh Thuần Chủng Syndra Hoàn Hảo' : 'e.g., Infinite Sorcerers Vertical'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#131a2c] text-white text-xs px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">{lang === 'vi' ? 'BẬC ĐỘI HÌNH' : 'TIER LEVEL'}</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as Tier)}
                  className="w-full bg-[#131a2c] text-white text-xs px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold cursor-pointer"
                >
                  <option value="S" className="bg-[#111827] text-white">S-Tier</option>
                  <option value="A" className="bg-[#111827] text-white">A-Tier</option>
                  <option value="B" className="bg-[#111827] text-white">B-Tier</option>
                  <option value="C" className="bg-[#111827] text-white">C-Tier</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">{lang === 'vi' ? 'ĐỘ KHÓ VẬN HÀNH' : 'DIFFICULTY'}</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-[#131a2c] text-white text-xs px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold cursor-pointer"
                >
                  <option value="Easy" className="bg-[#111827] text-white">{lang === 'vi' ? 'Dễ' : 'Easy'}</option>
                  <option value="Medium" className="bg-[#111827] text-white">{lang === 'vi' ? 'Trung bình' : 'Medium'}</option>
                  <option value="Hard" className="bg-[#111827] text-white">{lang === 'vi' ? 'Khó' : 'Hard'}</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">{lang === 'vi' ? 'LÊN CẤP / PHONG CÁCH CHƠI' : 'PLAYSTYLE PATTERN'}</label>
              <input
                type="text"
                placeholder={lang === 'vi' ? 'Ví dụ: Lên cấp tiêu chuẩn (Level 8)' : 'e.g., Standard Leveling (Level 8)'}
                value={playstyle}
                onChange={(e) => setPlaystyle(e.target.value)}
                className="w-full bg-[#131a2c] text-white text-xs px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">{lang === 'vi' ? 'CHIẾN THUẬT & HƯỚNG DẪN CHI TIẾT' : 'COMPOSITION STRATEGY / NOTES'}</label>
              <textarea
                rows={4}
                placeholder={lang === 'vi' ? 'Cơ cấu cách ghép đồ sớm, cách xoay bài và giữ máu...' : 'Write strategy manuals here...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#131a2c] text-white text-xs px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-semibold resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingStatus !== null}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-bold tracking-wider uppercase active:scale-95 transition-all text-xs flex justify-center items-center gap-1 shadow-lg shadow-indigo-500/15"
            >
              {savingStatus === 'saving' && (lang === 'vi' ? 'Đang lưu giáo án...' : 'Saving Draft...')}
              {savingStatus === 'success' && (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  {lang === 'vi' ? 'Lưu Trữ Giáo Án Thành Công' : 'Draft Cached Successfully'}
                </>
              )}
              {savingStatus === null && (lang === 'vi' ? 'Lưu Giáo Án Đội Hình' : 'Save Guide Draft')}
            </button>
          </div>
        </div>

        {/* Board & Roster drafting selectors (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tactical mapping hex board */}
          <div className="bg-[#111827]/70 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Sắp xếp ô cờ Sa Bản' : 'Grid Position Drafting'}</h3>
              </div>
              <span className="text-[9px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-bold">
                {positions.length} {lang === 'vi' ? 'Tướng đã đặt' : 'Units Placed'}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 font-mono bg-[#141d31]/50 border border-slate-800 p-2.5 rounded-xl flex gap-1.5 leading-relaxed font-semibold">
              <Info className="w-3.5 h-3.5 text-indigo-450 shrink-0" />
              <span>{lang === 'vi' ? 'Hãy click chọn một quân cờ ở danh sách phía dưới, sau đó click vào bất cứ ô lục giác nào trên sàn đấu cờ để đặt tướng. Click vào ô có sẵn tướng để xóa quân đó.' : 'Select a champion from the registry card array below, then click any empty grid hexagons to draft them. Click a placed unit to delete.'}</span>
            </div>

            {/* Precision SVG Canvas for placing units */}
            <div className="py-8 border border-slate-800/80 rounded-2xl bg-[#0a0e17] flex justify-center items-center relative overflow-x-auto select-none">
              <span className="block md:hidden absolute top-2 right-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[8px] font-mono px-1.5 py-0.5 rounded animate-pulse">{lang === 'vi' ? '← Vuốt ngang để xem hết sa bàn →' : '← Swipe horizontal to view full board →'}</span>
              <svg
                width="600"
                height="260"
                viewBox="0 0 600 260"
                className="mx-auto"
              >
                {[0, 1, 2, 3].map((r) => {
                  return [0, 1, 2, 3, 4, 5, 6].map((c) => {
                    const x = c * (hexWidth * 0.95) + (r % 2 === 1 ? colSpacing / 2 : 0) + 40;
                    const y = r * rowSpacing + 35;

                    const activeIndex = positions.findIndex(p => p.row === r && p.col === c);
                    const isOccupied = activeIndex > -1;
                    const unit = isOccupied ? positions[activeIndex] : null;
                    const champ = unit ? CHAMPIONS.find(ch => ch.id === unit.championId) : null;

                    const points = [
                      `${x},${y - hexRadius}`,
                      `${x + hexWidth / 2},${y - hexRadius / 2}`,
                      `${x + hexWidth / 2},${y + hexRadius / 2}`,
                      `${x},${y + hexRadius}`,
                      `${x - hexWidth / 2},${y + hexRadius / 2}`,
                      `${x - hexWidth / 2},${y - hexRadius / 2}`
                    ].join(' ');

                    return (
                      <g key={`${r}-${c}`} className="cursor-pointer select-none">
                        <polygon
                          points={points}
                          onClick={() => handleHexClick(r, c)}
                          fill={isOccupied ? '#11213b' : '#141a29'}
                          stroke={isOccupied ? '#6366f1' : '#1e293b'}
                          strokeWidth={isOccupied ? '2.5' : '1.5'}
                          className="transition-all hover:stroke-indigo-400"
                          opacity={isOccupied ? '1' : '0.4'}
                        />

                        {isOccupied && champ && (
                          <g pointerEvents="none">
                            <clipPath id={`circle-clip-${r}-${c}`}>
                              <circle cx={x} cy={y - 1} r={hexRadius * 0.52} />
                            </clipPath>
                            <image
                              href={getChampionImageUrl(champ.name)}
                              x={x - hexRadius * 0.52}
                              y={(y - 1) - hexRadius * 0.52}
                              width={hexRadius * 1.04}
                              height={hexRadius * 1.04}
                              preserveAspectRatio="xMidYMid slice"
                              clipPath={`url(#circle-clip-${r}-${c})`}
                            />
                            <circle
                              cx={x}
                              cy={y - 1}
                              r={hexRadius * 0.52}
                              fill="none"
                              stroke={champ.cost === 5 ? '#f59e0b' : champ.cost === 4 ? '#ec4899' : champ.cost === 3 ? '#3b82f6' : champ.cost === 2 ? '#22c55e' : '#64748b'}
                              strokeWidth="1.8"
                            />
                            
                            <text
                              x={x}
                              y={y + 23}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="9"
                              fontWeight="bold"
                              fontFamily="sans-serif"
                            >
                              {champ.name}
                            </text>
                            
                            {/* Items Display */}
                            {unit.items && unit.items.length > 0 && (
                              <g transform={`translate(${x - (unit.items.length * 7)}, ${y - hexRadius * 0.52 - 8})`}>
                                {unit.items.map((it, idx) => {
                                  const itemData = ITEMS.find(i => i.id === it);
                                  return (
                                    <g key={idx} transform={`translate(${idx * 14}, 0)`}>
                                      <image
                                        href={getItemImageUrl(it, itemData ? itemData.name : it)}
                                        width="12"
                                        height="12"
                                        preserveAspectRatio="xMidYMid slice"
                                      />
                                      <rect width="12" height="12" fill="none" stroke="#6366f1" strokeWidth="0.5" rx="2" />
                                    </g>
                                  );
                                })}
                              </g>
                            )}
                          </g>
                        )}
                      </g>
                    );
                  });
                })}
              </svg>
            </div>
          </div>

          {/* Active Hex Config Modal */}
          {activeHex && (
            <div className="bg-[#111827] border border-indigo-500/50 p-5 rounded-2xl space-y-4 shadow-xl shadow-indigo-500/10 mb-4 animate-in fade-in slide-in-from-top-4 relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">
                    {lang === 'vi' ? 'Trang bị cho' : 'Equip for'} {CHAMPIONS.find(c => c.id === activeHex.unit.championId)?.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveUnit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg text-[10px] font-bold uppercase transition-all border border-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {lang === 'vi' ? 'Xóa Tướng' : 'Remove'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHex(null)}
                    className="px-3 py-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-[10px] font-bold uppercase transition-all"
                  >
                    {lang === 'vi' ? 'Đóng' : 'Close'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={lang === 'vi' ? 'Tìm trang bị...' : 'Search items...'}
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  className="w-full bg-[#131a2c] text-white text-xs px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {ITEMS.filter(it => it.name.toLowerCase().includes(itemSearchQuery.toLowerCase())).map(item => {
                    const isEquipped = activeHex.unit.items?.includes(item.id);
                    const disabled = !isEquipped && (activeHex.unit.items?.length || 0) >= 3;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleItem(item.id)}
                        disabled={disabled}
                        className={`text-left p-2 rounded-xl border flex items-center gap-2 transition-all select-none ${
                          isEquipped
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : disabled
                            ? 'bg-[#141b2e]/50 border-slate-800 text-slate-600 cursor-not-allowed'
                            : 'bg-[#141b2e] border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-[#1a233b]'
                        }`}
                      >
                        <div className={`w-6 h-6 shrink-0 rounded bg-slate-800 relative overflow-hidden flex items-center justify-center font-bold text-[9px] ${isEquipped ? 'ring-1 ring-indigo-400' : ''}`}>
                          <img src={getItemImageUrl(item.id, item.name)} alt={item.name} className={`w-full h-full object-cover ${disabled ? 'opacity-40 grayscale' : ''}`} />
                        </div>
                        <span className="text-[10px] font-bold truncate flex-1">{item.name}</span>
                        {isEquipped && <Check className="w-3.5 h-3.5 shrink-0 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Registry Array */}
          <div className="bg-[#111827]/70 border border-slate-800 p-5 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white tracking-widest uppercase">{lang === 'vi' ? 'Thư Viện Tướng ĐTCL Mùa 11' : 'Champion Registry'}</h3>
              
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setCostFilter('all')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${costFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  {lang === 'vi' ? 'TẤT CẢ' : 'ALL'}
                </button>
                {[1, 2, 3, 4, 5].map((cost) => (
                  <button
                    key={cost}
                    type="button"
                    onClick={() => setCostFilter(cost)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${costFilter === cost ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {cost}G
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Champion Cards Registry Grid (2/3 width) */}
              <div className="lg:col-span-2 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-1.5 max-h-56 overflow-y-auto pr-1">
                  {filteredChampions.map((champ) => {
                    const isSelected = selectedChampionId === champ.id;
                    return (
                      <div
                        key={champ.id}
                        id={`draft-select-${champ.id}`}
                        onClick={() => setSelectedChampionId(isSelected ? null : champ.id)}
                        className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-between hover:scale-[1.01] active:scale-95 select-none ${
                          isSelected
                            ? 'bg-indigo-950/20 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/10'
                            : 'bg-[#141b2e] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 mr-2 border border-slate-700/50 flex-none relative" style={{ borderColor: isSelected ? '#a5b4fc' : undefined }}>
                          <img src={getChampionImageUrl(champ.name)} alt={champ.name} className="w-full h-full object-cover scale-[1.15]" />
                        </div>
                        <div className="min-w-0 flex-1 mr-2">
                          <p className="font-bold text-[11px] truncate">{champ.name}</p>
                          <p className="text-[9px] font-mono text-slate-500 mt-0.5">{lang === 'vi' ? `${champ.cost} Vàng` : `${champ.cost} Gold`}</p>
                        </div>

                        <div className={`w-5 h-5 border rounded-lg flex items-center justify-center text-[10px] text-white font-mono font-bold shrink-0 ${getCostBorder(champ.cost)}`}>
                          {champ.cost}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Informative Stats & Abilities Tooltip Panel (1/3 width) */}
              <div className="lg:col-span-1 bg-[#131b2e]/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between min-h-[160px] relative overflow-hidden shadow-md select-none">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/5 rounded-full pointer-events-none" />
                {selectedChamp ? (
                  <div className="space-y-3 h-full flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between border-b border-slate-800 pb-2">
                        <div className="min-w-0">
                          <h4 className="text-[11.5px] font-black text-white uppercase tracking-wider truncate">{selectedChamp.name}</h4>
                          <span className={`inline-flex px-1.5 py-0.2 rounded text-[8.5px] font-mono font-black mt-1 ${
                            selectedChamp.cost === 5 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                            selectedChamp.cost === 4 ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' :
                            selectedChamp.cost === 3 ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                            selectedChamp.cost === 2 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                            'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                          }`}>
                            {selectedChamp.cost} {lang === 'vi' ? 'VÀNG' : 'GOLD UNIT'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedChampionId(null); }}
                          className="hover:text-pink-400 text-slate-500 text-[9px] font-bold font-mono transition-colors focus:outline-none"
                        >
                          {lang === 'vi' ? 'Bỏ chọn' : 'Clear'}
                        </button>
                      </div>

                      <div className="space-y-2 text-[10px]">
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 font-bold uppercase block mb-1">{lang === 'vi' ? 'Tộc Hệ Liên Quan' : 'Affiliated Traits'}</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedChamp.traits.map((t, idx) => (
                              <span key={idx} className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[9px] px-1.5 py-0.2 rounded-md font-bold">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="bg-[#152035]/35 border border-slate-800/80 p-2.5 rounded-xl space-y-1">
                          <div className="flex items-center gap-1 text-[8.5px] font-mono text-indigo-400 font-bold uppercase">
                            <Sparkles className="w-3 h-3" />
                            <span>{lang === 'vi' ? (selectedAbility?.abilityNameVi || 'Kỹ Năng Phép Thuật') : (selectedAbility?.abilityName || 'Core Spell')}</span>
                          </div>
                          <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
                            {lang === 'vi' ? (selectedAbility?.descVi || 'Sát thương cơ bản và hiệu năng bổ trợ tương thích.') : (selectedAbility?.desc || 'Standard battle damage and status enhancement indicators.')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-400 space-y-1.5 min-y-36">
                    <Info className="w-5 h-5 text-indigo-400/60" />
                    <p className="text-[10.5px] font-bold text-slate-300 uppercase tracking-wider">{lang === 'vi' ? 'KHUNG PHÂN TÍCH TƯỚNG' : 'UNIT ANALYST PANEL'}</p>
                    <p className="text-[9.5px] text-slate-500 leading-relaxed max-w-[180px] mx-auto font-semibold">
                      {lang === 'vi' ? 'Hãy click một tướng ở danh sách bên cạnh để tra cứu xếp hạng vàng, tộc hệ đồng bộ và kỉ năng chiến đấu trực quan.' : 'Select a champion from the registry grid to inspect their tier cost, composite traits, and direct abilities.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </form>

    </div>
  );
}
