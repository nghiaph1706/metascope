import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Target, TrendingUp, TrendingDown, Activity, Award, CheckCircle2, AlertTriangle, ShieldCheck, ChevronRight, Calculator, Crosshair, BarChart3, Star, Swords } from 'lucide-react';

export default function EloPredictorView() {
  const [currentLp, setCurrentLp] = useState<number>(50);
  const [currentRank, setCurrentRank] = useState<string>('Emerald II');
  const [recentPlacements, setRecentPlacements] = useState<number[]>([4, 2, 8, 1, 3]);
  const [targetRank, setTargetRank] = useState<string>('Diamond IV');
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [predictionData, setPredictionData] = useState<any>(null);

  const ranks = ['Gold I', 'Platinum IV', 'Platinum I', 'Emerald IV', 'Emerald II', 'Emerald I', 'Diamond IV', 'Diamond I', 'Master', 'Grandmaster'];

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      // Fake math calculation based on placements
      const avgPlace = recentPlacements.reduce((a, b) => a + b, 0) / recentPlacements.length;
      let mmrStatus = 'Normal';
      let trend = 'Neutral';
      let gamesNeeded = 20;

      if (avgPlace < 3.5) {
        mmrStatus = 'High (Smurf Queue)';
        trend = 'Rapid Climb';
        gamesNeeded = 12;
      } else if (avgPlace > 5) {
        mmrStatus = 'Doomed (Elo Hell)';
        trend = 'Demotion Warning';
        gamesNeeded = 45;
      } else {
        mmrStatus = 'Stable';
        trend = 'Steady Progression';
        gamesNeeded = 25;
      }

      setPredictionData({
        mmrStatus,
        trend,
        gamesNeeded,
        avgPlace: avgPlace.toFixed(2),
        estimatedLpGain: avgPlace < 4 ? '+52' : '+38',
        estimatedLpLoss: avgPlace > 5 ? '-65' : '-45',
        winCondition: avgPlace < 4.5 ? 'Maintain top 4 consistency' : 'Fix early game bleeding',
        confidenceScore: 88,
      });
      setIsSimulating(false);
    }, 1200);
  };

  const handlePlacementChange = (index: number, val: string) => {
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1 && num <= 8) {
      const newPlaces = [...recentPlacements];
      newPlaces[index] = num;
      setRecentPlacements(newPlaces);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 h-full animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-bold tracking-widest uppercase border border-indigo-500/20 mb-3">
            <Calculator className="w-3.5 h-3.5" /> Reference Tool Only
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">MMR & Elo Predictor</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
            Advanced heuristic ELO estimation. Input your current data and recent match placements to simulate hidden MMR, calculate LP velocity, and predict your path to your target rank.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#131a2c] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full group-hover:bg-indigo-500/10 transition-colors" />
            
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-indigo-400" /> Current Trajectory
            </h2>
            
            <div className="space-y-5">
              {/* Current Rank & LP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Current Rank</label>
                  <select 
                    value={currentRank}
                    onChange={(e) => setCurrentRank(e.target.value)}
                    className="w-full bg-[#0c121f] text-sm text-white font-semibold border border-slate-700/50 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Current LP</label>
                  <input 
                    type="number" 
                    value={currentLp}
                    onChange={(e) => setCurrentLp(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0c121f] text-sm text-white font-mono border border-slate-700/50 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Target Rank */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Target Rank Goal</label>
                <select 
                  value={targetRank}
                  onChange={(e) => setTargetRank(e.target.value)}
                  className="w-full bg-slate-800/40 text-sm text-indigo-300 font-semibold border border-indigo-500/30 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {ranks.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Recent Placements Map */}
              <div className="pt-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-3 block">Recent 5 Match Placements</label>
                <div className="flex justify-between gap-2">
                  {recentPlacements.map((pos, idx) => (
                    <input 
                      key={idx}
                      type="number"
                      min="1" max="8"
                      value={pos}
                      onChange={(e) => handlePlacementChange(idx, e.target.value)}
                      className={`w-12 h-12 text-center text-lg font-black rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        pos <= 4 ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide py-3.5 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSimulating ? (
                <><Activity className="w-4 h-4 animate-spin" /> Calculating Matrix...</>
              ) : (
                <><BarChart3 className="w-4 h-4" /> Run Prediction Simulation</>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7">
          {!predictionData && !isSimulating ? (
            <div className="h-full bg-[#131a2c]/50 border border-slate-800/50 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 text-center text-slate-500">
               <Calculator className="w-12 h-12 mb-4 text-slate-700" />
               <p className="font-medium text-slate-400">Awaiting data input to run ELO trajectory matrix.</p>
               <p className="text-xs mt-2">Outputs detailed LP logic and game requirement estimations.</p>
            </div>
          ) : isSimulating ? (
            <div className="h-full min-h-[400px] bg-[#131a2c] border border-indigo-500/20 rounded-2xl flex flex-col items-center justify-center p-12 animate-pulse">
               <Activity className="w-12 h-12 mb-4 text-indigo-500 animate-bounce" />
               <p className="font-bold text-indigo-300 tracking-widest uppercase text-sm">Synchronizing with match telemetry...</p>
            </div>
          ) : predictionData && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full bg-gradient-to-b from-[#131a2c] to-[#0c121f] border border-slate-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl"
            >
              {/* Status Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Simulation Report</h3>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className="text-slate-400">Confidence Score:</span>
                    <span className="text-emerald-400 flex items-center gap-1">{predictionData.confidenceScore}% <CheckCircle2 className="w-3 h-3" /></span>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  predictionData.trend === 'Rapid Climb' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  predictionData.trend === 'Demotion Warning' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                }`}>
                  {predictionData.trend}
                </div>
              </div>

              {/* Data Grids */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#0f1524] border border-slate-800/80 p-5 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Estimated MMR State</p>
                  <p className="text-xl font-black text-white">{predictionData.mmrStatus}</p>
                </div>
                <div className="bg-[#0f1524] border border-slate-800/80 p-5 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Avg Recent Place</p>
                  <p className="text-xl font-black text-white">{predictionData.avgPlace}</p>
                </div>
                
                <div className="bg-[#0f1524] border border-emerald-500/20 p-5 rounded-xl col-span-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500"/> Projected LP Win</p>
                  <p className="text-3xl font-black text-emerald-400 font-mono">{predictionData.estimatedLpGain}</p>
                </div>
                <div className="bg-[#0f1524] border border-rose-500/20 p-5 rounded-xl col-span-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3 text-rose-500"/> Projected LP Loss</p>
                  <p className="text-3xl font-black text-rose-400 font-mono">{predictionData.estimatedLpLoss}</p>
                </div>
              </div>

              {/* Path to target */}
              <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-6 relative overflow-hidden">
                <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/5" />
                <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" /> Path to {targetRank}
                </h4>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">{currentRank}</span>
                      <span className="text-indigo-400">{predictionData.gamesNeeded} Games (Est.)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '60%' }} 
                        transition={{ delay: 0.5, duration: 1 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                  <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1">Key Win Condition</p>
                  <p className="text-indigo-300 font-medium text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {predictionData.winCondition}
                  </p>
                </div>
              </div>
              
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
