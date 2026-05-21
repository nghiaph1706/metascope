import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomeView from './components/HomeView';
import TierListView from './components/TierListView';
import GuideDetailsView from './components/GuideDetailsView';
import ProfileView from './components/ProfileView';
import LiveTrackerView from './components/LiveTrackerView';
import CreateGuideView from './components/CreateGuideView';
import CreatorHubView from './components/CreatorHubView';
import PatchNotesView from './components/PatchNotesView';
import AuthView from './components/AuthView';
import ItemsView from './components/ItemsView';
import ChampionStatsView from './components/ChampionStatsView';
import LeaderboardView from './components/LeaderboardView';
import TraitStatsView from './components/TraitStatsView';
import RollingOddsView from './components/RollingOddsView';
import PricingView from './components/PricingView';
import PostGameAnalysisView from './components/PostGameAnalysisView';
import UserProfileView from './components/UserProfileView';
import EloPredictorView from './components/EloPredictorView';
import MatchupCoachView from './components/MatchupCoachView';
import { ToastType } from './lib/toast';

import { Composition, PlayerProfile, GameMatch } from './types';
import { INITIAL_COMPS } from './data/comps';
import { PROFILES } from './data/profiles';
import { XCircle, CheckCircle, Info } from 'lucide-react';

const ProtectedRoute = ({ children, isRegistered, requiredTiers, userTier, fallbackPath = '/pricing' }: { children: JSX.Element, isRegistered: boolean, requiredTiers?: string[], userTier: string, fallbackPath?: string }) => {
  if (!isRegistered) {
    return <Navigate to="/auth_view" replace />;
  }
  if (requiredTiers && !requiredTiers.includes(userTier)) {
    return <Navigate to={fallbackPath} replace />;
  }
  return children;
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname === '/' ? 'home' : location.pathname.substring(1);

  const [summonerSearchQuery, setSummonerSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // Custom Compositions (drafts)
  const [comps, setComps] = useState<Composition[]>(INITIAL_COMPS);
  const [myGuides, setMyGuides] = useState<Composition[]>([]);
  
  // Selected composition for inspection
  const [selectedComp, setSelectedComp] = useState<Composition | null>(INITIAL_COMPS[0]);
  
  // Selected summoner profile for inspection
  const [selectedProfile, setSelectedProfile] = useState<PlayerProfile>(PROFILES[0]);
  
  // Registration membership status
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [userTier, setUserTier] = useState<'free' | 'basic' | 'premium'>('free');
  
  // Global Toasts State
  const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);

  const isAuthenticated = isRegistered;

  useEffect(() => {
    // Toast Listener
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: ToastType }>;
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, ...customEvent.detail }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3500);
    };
    window.addEventListener('app-toast', handleToast);

    return () => {
      window.removeEventListener('app-toast', handleToast);
    };
  }, []);

  const handleNavigation = (view: string) => {
    if (view === 'home') navigate('/');
    else navigate('/' + view);
  };

  // Search submission router
  const handleSearchSubmit = (query: string) => {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return;

    setIsSearching(true);
    
    // Simulate network latency for production feel
    setTimeout(() => {
      const match = PROFILES.find(
        p => p.summonerName.toLowerCase().includes(cleanQuery) || 
             cleanQuery.includes(p.summonerName.toLowerCase())
      );

      if (match) {
        setSelectedProfile(match);
        setSummonerSearchQuery(`${match.summonerName}#${match.tagLine}`);
      } else {
        // Dynamic fallback generator
        const shard = query.split('#');
        const namePart = shard[0] || 'Summoner';
        const tagPart = shard[1] || 'NA1';

        const synthetic: PlayerProfile = {
          summonerName: namePart,
          tagLine: tagPart,
          region: 'NA',
          rank: 'Diamond I',
          lp: 75,
          winRate: 52.4,
          top4Rate: 58.2,
          avgPlacement: 4.12,
          gamesPlayed: 45,
          lpHistory: [
            { matchIndex: 5, lp: 25 },
            { matchIndex: 4, lp: 40 },
            { matchIndex: 3, lp: 42 },
            { matchIndex: 2, lp: 60 },
            { matchIndex: 1, lp: 75 }
          ],
          matches: [
            {
              id: `na_sync_${Date.now()}`,
              placement: 2,
              duration: '34:20',
              gameMode: 'Ranked TFT',
              timestamp: 'Just Now',
              level: 8,
              traits: [
                { name: 'Fated', count: 3, tier: 'bronze' },
                { name: 'Warden', count: 2, tier: 'bronze' }
              ],
              units: [
                { championId: 'aphelios', starLevel: 2, items: ['guinsoos_rageblade'] },
                { championId: 'thresh', starLevel: 2, items: ['warmogs_armor'] }
              ],
              lobby: [
                {
                  summonerName: namePart,
                  tagLine: tagPart,
                  placement: 2,
                  level: 8,
                  goldLeft: 4,
                  units: [],
                  activeTraits: []
                }
              ]
            }
          ]
        };
        setSelectedProfile(synthetic);
        setSummonerSearchQuery(query);
      }
      setIsSearching(false);
    }, 800);
  };

  // Guide Management handlers
  const handleSaveDraft = (draft: Composition) => {
    setMyGuides([draft, ...myGuides]);
    setComps([draft, ...comps]);
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Guide saved successfully!', type: 'success' } }));
  };

  const handleDeleteGuide = (id: string) => {
    setMyGuides(myGuides.filter(c => c.id !== id));
    setComps(comps.filter(c => c.id !== id));
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Guide deleted.', type: 'info' } }));
  };

  const handleDuplicateGuide = (source: Composition) => {
    const duplicated: Composition = {
      ...source,
      id: `dup_${Date.now()}`,
      name: `${source.name} (Copy)`,
      updatedAt: 'Just Now'
    };
    handleSaveDraft(duplicated);
  };

  const handleRegisterSuccess = (tier: 'free' | 'basic' | 'premium' = 'free') => {
    setIsRegistered(true);
    setUserTier(tier);
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Logged in successfully! Welcome.`, type: 'success' } }));
  };

  const handleLogout = () => {
    setIsRegistered(false);
    setUserTier('free');
    handleNavigation('home');
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'You have been logged out.', type: 'info' } }));
  };

  return (
    <div className="h-screen bg-[#070b13] text-slate-100 font-sans flex flex-col lg:flex-row overflow-hidden">
      <Navigation
        currentView={currentView}
        onNavigate={handleNavigation}
        summonerSearchQuery={summonerSearchQuery}
        setSummonerSearchQuery={setSummonerSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        isRegistered={isRegistered}
      />
      
      <div className="flex-1 flex flex-col overflow-y-auto w-full bg-[#070b13]">
        <main className="flex-1 pb-16 select-none leading-none animate-in fade-in duration-300">
          <Routes>
            <Route path="/" element={<HomeView onNavigate={handleNavigation} comps={comps} onSelectComp={setSelectedComp} summonerQuery={summonerSearchQuery} setSummonerQuery={setSummonerSearchQuery} onSearchSubmit={handleSearchSubmit} />} />
            <Route path="/tier_list" element={<TierListView comps={comps} onSelectComp={setSelectedComp} onNavigate={handleNavigation} />} />
            <Route path="/guide_details" element={<GuideDetailsView comp={selectedComp} onBack={() => handleNavigation('tier_list')} onNavigate={handleNavigation} />} />
            <Route path="/player_stats" element={<ProfileView profile={selectedProfile} onNavigate={handleNavigation} summonerSearchQuery={summonerSearchQuery} setSummonerSearchQuery={setSummonerSearchQuery} onSearchSubmit={handleSearchSubmit} profilesList={PROFILES} onSelectProfile={setSelectedProfile} isAuthenticated={isAuthenticated} onUpgrade={() => handleNavigation('pricing')} isLoading={isSearching} />} />
            <Route path="/champion_stats" element={<ChampionStatsView />} />
            <Route path="/leaderboard" element={<LeaderboardView />} />
            <Route path="/trait_stats" element={<TraitStatsView />} />
            <Route path="/rolling_odds" element={<RollingOddsView />} />
            <Route path="/items_view" element={<ItemsView />} />
            <Route path="/patch_notes" element={<PatchNotesView />} />
            <Route path="/pricing" element={<PricingView currentTier={userTier} onSelectTier={setUserTier} />} />
            <Route path="/auth_view" element={<AuthView onRegisterSuccess={handleRegisterSuccess} onNavigate={handleNavigation} />} />
            
            {/* Protected Routes */}
            <Route path="/post_game" element={<ProtectedRoute isRegistered={isRegistered} requiredTiers={['basic', 'premium']} userTier={userTier}><PostGameAnalysisView isAuthenticated={isAuthenticated} userTier={userTier} onUpgrade={() => handleNavigation('pricing')} /></ProtectedRoute>} />
            <Route path="/live_tracker" element={<ProtectedRoute isRegistered={isRegistered} requiredTiers={['basic', 'premium']} userTier={userTier}><LiveTrackerView onNavigate={handleNavigation} summonerSearchQuery={summonerSearchQuery} onSearchSubmit={handleSearchSubmit} /></ProtectedRoute>} />
            <Route path="/elo_predictor" element={<ProtectedRoute isRegistered={isRegistered} requiredTiers={['basic', 'premium']} userTier={userTier}><EloPredictorView /></ProtectedRoute>} />
            <Route path="/matchup_coach" element={<ProtectedRoute isRegistered={isRegistered} requiredTiers={['premium']} userTier={userTier}><MatchupCoachView /></ProtectedRoute>} />
            <Route path="/create_guide" element={<ProtectedRoute isRegistered={isRegistered} requiredTiers={['basic', 'premium']} userTier={userTier}><CreateGuideView onSaveDraft={handleSaveDraft} onNavigate={handleNavigation} /></ProtectedRoute>} />
            <Route path="/creator_hub" element={<ProtectedRoute isRegistered={isRegistered} requiredTiers={['basic', 'premium']} userTier={userTier}><CreatorHubView myGuides={myGuides} onSelectComp={setSelectedComp} onNavigate={handleNavigation} onDeleteGuide={handleDeleteGuide} onDuplicateGuide={handleDuplicateGuide} /></ProtectedRoute>} />
            <Route path="/user_profile" element={<ProtectedRoute isRegistered={isRegistered} userTier={userTier} fallbackPath="/"><UserProfileView userTier={userTier} onNavigate={handleNavigation} onLogout={handleLogout} /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Aesthetic pairing footer */}
        <footer className="border-t border-slate-900 bg-[#05080e] py-6 select-none font-mono mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-[10px] text-slate-600 space-y-2 leading-none">
            <p className="font-bold">METASCOPE © 2026 ELITE INTEL SYSTEM INC. ALL DATA EXTRACTED FROM ENCRYPTED CHAMPION CORE REGISTRIES.</p>
            <p className="font-medium text-slate-700">Teamfight Tactics is a registered trademark of Riot Games. MetaScope is built standalone not affiliated.</p>
          </div>
        </footer>
      </div>

      {/* Global Toast Overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border pointer-events-auto ${
                t.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100' :
                t.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-100' :
                'bg-slate-800/90 border-slate-600 shadow-xl text-slate-100'
              }`}
            >
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
              <p className="text-sm font-medium">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
