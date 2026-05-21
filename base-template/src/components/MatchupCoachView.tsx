import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, ShieldAlert, Cpu, Sparkles, ChevronRight, Crosshair, TrendingDown, TrendingUp, Skull, Zap } from 'lucide-react';
import { Composition } from '../types';
import { INITIAL_COMPS } from '../data/comps';
import { CHAMPIONS } from '../data/champions';

export default function MatchupCoachView() {
  const [selectedComp, setSelectedComp] = useState<Composition | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = (comp: Composition) => {
    setSelectedComp(comp);
    setIsAnalyzing(true);
    setAnalysis(null);

    setTimeout(() => {
      // Simulate fake AI analysis of the matchup
      setAnalysis({
        counters: INITIAL_COMPS.filter(c => c.id !== comp.id).slice(0, 2),
        prey: INITIAL_COMPS.filter(c => c.id !== comp.id).slice(3, 5),
        keyWeakness: comp.tier === 'S' ? 'Susceptible to early game bleed if upgrades are delayed' : 'Falls off in stage 5 without 3-star carries',
        keyStrength: 'Exceptional level 8 power spike',
        positioningTip: 'Keep main carry isolated from opposing Lux/Syndra angles.'
      });
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-full animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
          <Cpu className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black text-white tracking-tight">AI Matchup Coach</h1>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest bg-pink-500/10 text-pink-400 border border-pink-500/20">Beta</span>
          </div>
          <p className="text-sm text-slate-400">Select a meta composition to run neural network counter-strategy analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left List */}
        <div className="lg:col-span-4 bg-[#0c121f] rounded-2xl border border-slate-800 p-4 shadow-xl h-[600px] flex flex-col">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Select Target Composition</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {INITIAL_COMPS.map(comp => (
              <button
                key={comp.id}
                onClick={() => handleAnalyze(comp)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border text-left ${
                  selectedComp?.id === comp.id 
                    ? 'bg-indigo-600/15 border-indigo-500/30 shadow-sm' 
                    : 'bg-[#131a2c] hover:bg-[#1a233b] border-transparent'
                }`}
              >
                <div>
                  <p className={`font-bold text-sm ${selectedComp?.id === comp.id ? 'text-indigo-300' : 'text-slate-200'}`}>{comp.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Tier {comp.tier} • {comp.playstyle}</p>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedComp?.id === comp.id ? 'text-indigo-400' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-8 bg-[#131a2c] rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col shadow-2xl">
          
          {isAnalyzing ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 h-[600px] animate-pulse">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                <Cpu className="w-16 h-16 text-indigo-400 relative z-10 animate-bounce" />
              </div>
              <p className="font-mono text-sm uppercase tracking-widest text-indigo-300 font-bold mb-2">Compiling Battle Matrix...</p>
              <p className="text-xs">Running thousands of simulated matchups against {selectedComp?.name}...</p>
            </div>
          ) : analysis && selectedComp ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col h-[600px]"
            >
              <div className="bg-gradient-to-b from-indigo-900/40 to-transparent p-6 border-b border-slate-800">
                <div className="flex items-center gap-2 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-2"><Sparkles className="w-3 h-3"/> Analysis Complete</div>
                <h2 className="text-2xl font-black text-white">{selectedComp.name}</h2>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                
                {/* Insights */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0c121f] border border-slate-800/80 p-4 rounded-xl">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Key Strength</p>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">{analysis.keyStrength}</p>
                  </div>
                  <div className="bg-[#0c121f] border border-slate-800/80 p-4 rounded-xl">
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1"><TrendingDown className="w-3 h-3"/> Core Weakness</p>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">{analysis.keyWeakness}</p>
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-xl">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Crosshair className="w-3 h-3"/> Optimal Positioning</p>
                  <p className="text-sm font-medium text-slate-200">{analysis.positioningTip}</p>
                </div>

                {/* Counters and Prey */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800/50">
                  {/* Gets countered by */}
                  <div>
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Skull className="w-4 h-4"/> Hard Counters
                    </h4>
                    <div className="space-y-3">
                      {analysis.counters.map((c: Composition) => (
                        <div key={c.id} className="bg-[#0c121f] border border-rose-500/20 p-3 rounded-xl flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-200 line-clamp-1">{c.name}</span>
                          <span className="text-xs text-rose-400 font-mono font-bold">-18% WR</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Counters */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Zap className="w-4 h-4"/> Easy Matchups
                    </h4>
                    <div className="space-y-3">
                      {analysis.prey.map((c: Composition) => (
                        <div key={c.id} className="bg-[#0c121f] border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-200 line-clamp-1">{c.name}</span>
                          <span className="text-xs text-emerald-400 font-mono font-bold">+24% WR</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-600 h-[600px]">
              <Swords className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-bold text-slate-400">Waiting for target selection.</p>
              <p className="text-xs mt-2 max-w-sm mx-auto">Select a comp from the left to execute the neural Matchup analysis.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
