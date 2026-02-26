import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { View, Match, Category, Channel } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import LinkModal from './components/LinkModal';
import FloatingPlayer from './components/FloatingPlayer';
import { WifiOff, RefreshCw, Loader2, Activity } from 'lucide-react';

const LiveEventsView = lazy(() => import('./views/LiveEvents'));
const CategoriesView = lazy(() => import('./views/CategoriesView'));
const ChannelListView = lazy(() => import('./views/ChannelList'));
const PlayerView = lazy(() => import('./views/PlayerView'));
const AboutView = lazy(() => import('./views/AboutView'));
const PrivacyPolicyView = lazy(() => import('./views/PrivacyPolicyView'));
const RadioView = lazy(() => import('./views/RadioView'));

const BASE_GITHUB = 'https://raw.githubusercontent.com/FunctionError/PiratesTv/main';
const DEFAULT_M3U = `${BASE_GITHUB}/combined_playlist.m3u`;

const API_BASE = 'https://raw.githubusercontent.com/dartv-ajaz/Live-Sports-Group-A/main';
const CRICKET_URL = `${API_BASE}/cricket_channels.json`;
const VIP_URL = `${API_BASE}/vip_cricket.json`; 
const SULTAN_URL = 'https://raw.githubusercontent.com/dartv-ajaz/Live-Sports-Group-A/refs/heads/main/sultan_cricket.json';
const VAST_URL = 'https://raw.githubusercontent.com/dartv-ajaz/Live-Sports-Group-A/refs/heads/main/dartv_vast_channels.json';
const GROUP_B_URL = 'https://raw.githubusercontent.com/dartv-ajaz/Live-Sports-Group-B/main/live_matches_B.json';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View | 'radio'>('live-events');
  const [lastMainView, setLastMainView] = useState<View | 'radio'>('live-events');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [categoryChannels, setCategoryChannels] = useState<Channel[]>([]);
  const [playlistCache, setPlaylistCache] = useState<Record<string, Channel[]>>({});
  
  const [favorites, setFavorites] = useState<Channel[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  
  const [cloudCategories, setCloudCategories] = useState<Category[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [floatingMatch, setFloatingMatch] = useState<Match | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 📱 MOBILE HARDWARE BACK BUTTON LOGIC
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handleBackButton = () => {
      if (activeView === 'player' || activeView === 'channel-detail' || activeView === 'radio') {
        setActiveView(lastMainView);
        window.history.pushState(null, '', window.location.href);
      } else if (isSidebarOpen) {
        setSidebarOpen(false);
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [activeView, lastMainView, isSidebarOpen]);

  useEffect(() => {
    const savedFavs = localStorage.getItem('cricpk_favorites');
    if (savedFavs) try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    
    const savedCustom = localStorage.getItem('cricpk_custom_playlists');
    if (savedCustom) try { setCustomCategories(JSON.parse(savedCustom)); } catch (e) {}
  }, []);

  // 🚀 CUSTOM PLAYLIST MANAGER (ADD & DELETE)
  const handleAddCustomPlaylist = (name: string, url: string) => {
    const newCategory: Category = {
      id: `cat-custom-${Date.now()}`,
      name: name,
      playlistUrl: url
    };
    
    setCustomCategories(prev => {
      const updated = [...prev, newCategory];
      localStorage.setItem('cricpk_custom_playlists', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteCustomPlaylist = (id: string) => {
    setCustomCategories(prev => {
      const updated = prev.filter(cat => cat.id !== id);
      localStorage.setItem('cricpk_custom_playlists', JSON.stringify(updated));
      return updated;
    });
    // Agar cache mein uski list padi hai toh wo bhi clear kardo
    setPlaylistCache(prev => {
      const newCache = { ...prev };
      delete newCache[id];
      return newCache;
    });
  };

  const toggleFavorite = (channel: Channel) => {
    setFavorites(prev => {
      const isFav = prev.some(c => c.id === channel.id);
      const newFavs = isFav ? prev.filter(c => c.id !== channel.id) : [...prev, channel];
      localStorage.setItem('cricpk_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const fetchM3UText = async (originalUrl: string) => {
    try {
      const res = await fetch(originalUrl);
      if (!res.ok) throw new Error('Direct fetch blocked');
      return await res.text();
    } catch (e) {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(originalUrl)}`;
      const proxyRes = await fetch(proxyUrl);
      if (!proxyRes.ok) throw new Error('Proxy fetch failed');
      return await proxyRes.text();
    }
  };

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      let currentChannels: Channel[] = [];
      let newCache: Record<string, Channel[]> = {};
      let newCloudCats: Category[] = [];

      newCloudCats.push({ id: 'cat-combined', name: '📺 All Live TV (Pirates)', playlistUrl: DEFAULT_M3U });

      let apiConfigs: any[] = [
        { id: 'cat-sultan', name: '👑 Sultan VIP', url: SULTAN_URL, type: 'json', key: 'channels' },
        { id: 'cat-group-b', name: 'Hotstar LIVE', url: GROUP_B_URL, type: 'json', key: 'matches' },
        { id: 'cat-vip', name: '⚡ VIP Cricket', url: VIP_URL, type: 'json', key: 'channels' },
        { id: 'cat-cricket', name: 'Cricket TV', url: CRICKET_URL, type: 'json', key: 'channels' },
        { id: 'cat-vast', name: '📺 Vast Channels', url: VAST_URL, type: 'json', key: 'channels' }
      ];

      try {
          const adminUrl = `https://raw.githubusercontent.com/dartv-ajaz/Live-Sports-Group-A/main/admin_playlists.json?t=${Date.now()}`;
          const adminRes = await fetch(adminUrl);
          
          if (adminRes.ok) {
              const externalPlaylists = await adminRes.json();
              externalPlaylists.forEach((list: any, idx: number) => {
                  apiConfigs.push({
                      id: `cat-admin-${idx}`,
                      name: list.name,
                      url: list.url,
                      type: 'auto',
                      key: 'channels'
                  });
              });
          }
      } catch (err) {
          console.log("Admin playlists file not found yet.");
      }

      apiConfigs.forEach(c => newCloudCats.push({ id: c.id, name: c.name, playlistUrl: c.url }));
      newCloudCats.push({ id: 'cat-global-radio', name: '📻 Global FM Radio', playlistUrl: '' });
      setCloudCategories(newCloudCats);

      const apiResults = await Promise.all(
        apiConfigs.map(async (config) => {
          try {
            const text = await fetchM3UText(config.url);
            let parsedData = null;
            if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
                parsedData = JSON.parse(text);
            } else {
                const lines = text.split('\n');
                const chs = [];
                let currentInfo: any = null;
                for (let i = 0; i < lines.length; i++) {
                  const line = lines[i].trim();
                  if (line.startsWith('#EXTINF:')) {
                    const logoMatch = line.match(/tvg-logo="([^"]+)"/);
                    const nameSplit = line.split(',');
                    const name = nameSplit.length > 1 ? nameSplit.pop()?.trim() || 'Unknown' : 'Unknown';
                    let logo = logoMatch ? logoMatch[1] : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2E8B57&color=fff`;
                    currentInfo = { title: name, src: logo };
                  } else if (line.length > 0 && !line.startsWith('#') && currentInfo) {
                    chs.push({ title: currentInfo.title, src: currentInfo.src, url: line });
                    currentInfo = null;
                  }
                }
                parsedData = { channels: chs };
            }
            return { config, data: parsedData };
          } catch (err) {
            return { config, data: null };
          }
        })
      );

      let rawMatches: any[] = [];

      apiResults.forEach(({ config, data: apiData }) => {
        if (!apiData) return;
        const items = Array.isArray(apiData) ? apiData : (apiData[config.key] || apiData.matches || apiData.channels || []);
        
        if (items.length > 0) {
            const apiChannels: Channel[] = items.map((m: any, idx: number) => {
                const isUpcoming = String(m.status).toUpperCase() === 'UPCOMING';
                return {
                    id: `ch-${config.id}-${m.match_id || m.id || idx}`,
                    name: String(isUpcoming ? `⏳ (Upcoming) ${m.title || m.name}` : (m.title || m.name || m.match_name || `Channel ${idx}`)),
                    logo: String(m.src || m.logo || m.banner || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.title || m.name || config.name || 'TV')}`),
                    categoryId: config.id,
                    streamUrl: String(m.adfree_url || m.dai_url || m.url || m.streamUrl || '')
                };
            }).filter(c => c.streamUrl !== '');

            newCache[config.id] = apiChannels;
            currentChannels = [...currentChannels, ...apiChannels];

            if (config.key === 'matches') {
               rawMatches = [...rawMatches, ...items.map((m:any) => ({...m, configName: config.name}))];
            }
        }
      });

      const allSportsLinks: any[] = [];
      const sportsKeywords = ['sports', 'ptv', 'willow', 'ten', 'astro', 'sony', 'a sports', 'geo super', 'espn', 'fox', 'supersport', 'bein'];
      const blockKeywords = ['movie', 'max', 'gold', 'cinema', 'action', 'entertainment', 'jalsha', 'pravah', 'colors', 'star plus', 'zee tv']; 
      
      currentChannels.forEach(ch => {
          const nameLow = String(ch.name || '').toLowerCase();
          if (blockKeywords.some(badWord => nameLow.includes(badWord))) return;

          if (sportsKeywords.some(kw => nameLow.includes(kw))) {
             const isM3u8 = String(ch.streamUrl || '').includes('.m3u8');
             const isSultan = ch.categoryId === 'cat-sultan';
             
             if (!allSportsLinks.find(p => p.url === ch.streamUrl)) {
                 let catName = isSultan ? 'Sultan VIP' : ch.categoryId.replace('cat-', '').toUpperCase();
                 allSportsLinks.push({ 
                     name: isSultan ? `⭐ ${ch.name} (VIP)` : `${ch.name} (${catName})`, 
                     url: ch.streamUrl, 
                     type: isSultan ? 'Iframe' : (isM3u8 ? 'Video' : 'Iframe'),
                     isSultan: isSultan
                 });
             }
          }
      });

      allSportsLinks.sort((a, b) => {
          if (a.isSultan && !b.isSultan) return -1;
          if (!a.isSultan && b.isSultan) return 1;
          return 0;
      });

      const now = Date.now();
      const genericMatches = rawMatches.map((m: any, idx: number) => {
          let status = 'Live';
          let parsedTime = 0;
          let isHot = true;

          const timeNum = Number(m.startTime || m.time);
          if (!isNaN(timeNum) && timeNum > 0) {
              parsedTime = timeNum < 10000000000 ? timeNum * 1000 : timeNum;
              const diffHours = (now - parsedTime) / (1000 * 60 * 60);
              
              if (diffHours < -0.1) { status = 'Upcoming'; isHot = false; } 
              else if (diffHours >= -0.1 && diffHours <= 8) { status = 'Live'; isHot = true; } 
              else { status = 'Completed'; isHot = false; }
          } else {
              const upStatus = String(m.status || '').toUpperCase();
              if (upStatus.includes('UPCOMING')) { status = 'Upcoming'; isHot = false; }
              else if (upStatus.includes('END') || upStatus.includes('COMPLET') || upStatus.includes('RECENT')) { status = 'Completed'; isHot = false; }
              else { status = 'Live'; isHot = true; }
          }

          return {
              id: m.match_id || m.id || `live-gen-${idx}`,
              sport: m.event_category || m.sport || m.category || 'Sports',
              league: m.event_name || m.configName || 'Live Event',
              team1: String(m.team_1 || m.title || m.name || 'Team 1'),
              team2: String(m.team_2 || 'LIVE'),
              team1Logo: String(m.src || m.logo || m.team_1_flag || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.team_1 || m.title || m.name || 'T1')}`),
              team2Logo: String(m.src || m.logo || m.team_2_flag || `https://ui-avatars.com/api/?name=VS`),
              status: status,
              time: parsedTime > 0 ? String(parsedTime) : 'Live Now',
              isHot: isHot,
              streamUrl: m.adfree_url || m.dai_url || m.url || m.streamUrl,
              multiLinks: allSportsLinks 
          };
      });

      setMatches([...genericMatches]);
      setAllChannels(currentChannels);
      setPlaylistCache(newCache);
      setIsLoading(false);

    } catch (error: any) {
      console.error("Data fetch failed", error);
      setIsLoading(false);
      if (matches.length === 0) setFetchError("Please check your internet connection.");
    }
  }, []); 

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleCategorySelect = async (category: Category) => {
    if (category.id === 'cat-global-radio') {
      setActiveView('radio' as View);
      return;
    }

    setSelectedCategory(category);
    setActiveView('channel-detail');
    
    if (category.id === 'cat-favorites') { setCategoryChannels(favorites); return; }
    if (playlistCache[category.id] && playlistCache[category.id].length > 0) { setCategoryChannels(playlistCache[category.id]); return; }
    
    if (category.playlistUrl) {
      setIsCategoryLoading(true);
      setCategoryChannels([]); 
      try {
        const text = await fetchM3UText(category.playlistUrl);
        let parsedChannels: Channel[] = [];
        if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            const apiData = JSON.parse(text);
            const items = Array.isArray(apiData) ? apiData : (apiData.channels || apiData.matches || []);
            parsedChannels = items.map((m: any, idx: number) => ({
                id: `ch-${category.id}-${m.match_id || m.id || idx}`,
                name: String(m.title || m.name || `Channel ${idx}`),
                logo: String(m.src || m.logo || m.banner || `https://ui-avatars.com/api/?name=TV`),
                categoryId: category.id,
                streamUrl: String(m.adfree_url || m.dai_url || m.url || m.streamUrl || '')
            })).filter(c => c.streamUrl !== '');
        } else {
            const lines = text.split('\n');
            let currentInfo: any = null;
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line.startsWith('#EXTINF:')) {
                const logoMatch = line.match(/tvg-logo="([^"]+)"/);
                const nameSplit = line.split(',');
                const name = nameSplit.length > 1 ? nameSplit.pop()?.trim() || 'Unknown' : 'Unknown';
                let logo = logoMatch ? logoMatch[1] : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2E8B57&color=fff`;
                currentInfo = { name, logo };
              } else if (line.length > 0 && !line.startsWith('#') && currentInfo) {
                parsedChannels.push({ id: `ch-${category.id}-${parsedChannels.length}`, name: String(currentInfo.name), logo: String(currentInfo.logo), categoryId: category.id, streamUrl: line });
                currentInfo = null;
              }
            }
        }
        
        if (parsedChannels.length > 0) {
          setPlaylistCache(prev => ({ ...prev, [category.id]: parsedChannels }));
          setCategoryChannels(parsedChannels);
        }
      } catch (error) { 
          console.error("Playlist fetch error"); 
      } finally { 
          setIsCategoryLoading(false); 
      }
    }
  };

  const playChannel = (ch: Channel) => {
    setSelectedMatch({ id: ch.id, team1: ch.name, team2: 'Network Mirror', team1Logo: ch.logo, team2Logo: ch.logo, league: selectedCategory?.name || 'Live TV', status: 'Live', time: 'Live', sport: 'Other', streamUrl: ch.streamUrl, type: ch.categoryId === 'cat-sultan' ? 'Iframe' : undefined });
    setFloatingMatch(null);
    setActiveView('player');
  };

  const renderView = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center h-full bg-[#121212] z-50 fixed inset-0">
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
           <div className="w-20 h-20 bg-[#00b865]/10 rounded-full flex items-center justify-center mb-4 border border-[#00b865]/30 shadow-[0_0_30px_rgba(0,184,101,0.2)]">
             <Activity className="w-10 h-10 text-[#00b865] animate-pulse" />
           </div>
           <h1 className="text-4xl font-black tracking-widest text-white mb-8 shadow-black drop-shadow-lg">
             DAR<span className="text-[#00b865]">TV</span>
           </h1>
           <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00b865] to-green-400 w-full animate-[progress_1.5s_ease-in-out_infinite] origin-left"></div>
           </div>
           <p className="mt-6 text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Starting Engine...</p>
        </div>
      </div>
    );

    if (fetchError) return <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-6"><WifiOff className="w-10 h-10 text-red-500" /><p className="text-white">{fetchError}</p><button onClick={fetchInitialData} className="bg-white text-black px-8 py-4 rounded-2xl"><RefreshCw className="w-4 h-4 inline" /> Reconnect</button></div>;

    if (globalSearchQuery.trim().length > 0) {
      const searchResults = allChannels.filter(c => String(c.name || '').toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 100);
      return <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-[#00b865]" /></div>}><ChannelListView channels={searchResults} category={{ id: 'search', name: `Search Results`, playlistUrl: '' }} loading={false} onBack={() => setGlobalSearchQuery('')} onSelectChannel={(ch) => { setGlobalSearchQuery(''); setLastMainView('categories'); playChannel(ch); }} /></Suspense>;
    }

    return (
      <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="w-10 h-10 animate-spin text-[#00b865]" /></div>}>
        {activeView === 'about' && <AboutView />}
        {activeView === 'privacy' && <PrivacyPolicyView />}
        {activeView === 'radio' && <RadioView onBack={() => setActiveView('categories')} />}
        {activeView === 'live-events' && <LiveEventsView matches={matches} onSelectMatch={(m) => { setLastMainView('live-events'); setSelectedMatch(m); setActiveView('player'); }} />}
        
        {/* 🚀 CUSTOM CATEGORIES PROPS PASSED HERE */}
        {activeView === 'categories' && <CategoriesView 
            onSelectCategory={handleCategorySelect} 
            favoritesCount={favorites.length} 
            cloudCategories={cloudCategories} 
            customCategories={customCategories} 
            onAddCustom={handleAddCustomPlaylist} 
            onDeleteCustom={handleDeleteCustomPlaylist} 
        />}

        {activeView === 'channel-detail' && <ChannelListView channels={categoryChannels} category={selectedCategory} loading={isCategoryLoading} onBack={() => setActiveView('categories')} onSelectChannel={(ch) => { setLastMainView('channel-detail'); playChannel(ch); }} />}
        {activeView === 'player' && <PlayerView match={selectedMatch} onBack={() => setActiveView(lastMainView)} relatedChannels={categoryChannels.length > 0 ? categoryChannels.slice(0, 40) : allChannels.slice(0, 40)} onSelectRelated={playChannel} />}
      </Suspense>
    );
  };

  const isFullPlayer = activeView === 'player';

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-[#121212] text-white">
      {!isFullPlayer && <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} activeView={activeView as View} onNavigate={(v) => { setActiveView(v); setLastMainView(v); setSidebarOpen(false); }} />}
      <div className="flex flex-col flex-1 relative min-w-0">
        {!isFullPlayer && (
          <Header 
            title={activeView === 'categories' ? 'Playlists' : activeView === 'channel-detail' ? (selectedCategory?.name || 'Channels') : activeView === 'radio' ? 'Virtual Radio' : 'DAR TEVE'} 
            onOpenSidebar={() => setSidebarOpen(true)} showBack={activeView === 'channel-detail' || activeView === 'radio'} onBack={() => setActiveView('categories')} searchQuery={globalSearchQuery} onSearchChange={setGlobalSearchQuery} 
          />
        )}
        <main className={`flex-1 overflow-y-auto scrollbar-hide ${!isFullPlayer ? 'pb-24 md:pb-6' : ''}`}>
          <div className={`${!isFullPlayer ? 'max-w-[1600px] mx-auto' : 'w-full h-full'}`}>{renderView()}</div>
        </main>
        {!isFullPlayer && <BottomNav activeView={(activeView === 'channel-detail' || activeView === 'radio') ? 'categories' : activeView as View} onViewChange={(v) => { setActiveView(v); setLastMainView(v); }} />}
      </div>
      {floatingMatch && <FloatingPlayer match={floatingMatch} onExpand={() => { setSelectedMatch(floatingMatch); setFloatingMatch(null); setActiveView('player'); }} onClose={() => setFloatingMatch(null)} />}
      {showLinkModal && <LinkModal match={selectedMatch} onClose={() => setShowLinkModal(false)} onSelect={() => {}} />}
      
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); opacity: 1; }
          50% { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default App;