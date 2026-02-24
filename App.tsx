import React, { useState, useEffect, useCallback } from 'react';
import { View, Match, Category, Channel } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import LiveEventsView from './views/LiveEvents';
import CategoriesView from './views/CategoriesView';
import ChannelListView from './views/ChannelList';
import PlayerView from './views/PlayerView';
import LinkModal from './components/LinkModal';
import FloatingPlayer from './components/FloatingPlayer';
import AboutView from './views/AboutView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import { WifiOff, RefreshCw } from 'lucide-react';

// 🚀 PLAYLIST LINKS
const BASE_GITHUB = 'https://raw.githubusercontent.com/FunctionError/PiratesTv/main';
const DEFAULT_M3U = `${BASE_GITHUB}/combined_playlist.m3u`;

const API_BASE = 'https://raw.githubusercontent.com/dartv-ajaz/Live-Sports-Group-A/main';
const CRICKET_URL = `${API_BASE}/cricket_channels.json`;
const JIO_URL = `${API_BASE}/jio_channels.json`;
const VIP_URL = `${API_BASE}/vip_cricket.json`; 
const SULTAN_URL = 'https://raw.githubusercontent.com/dartv-ajaz/Live-Sports-Group-A/refs/heads/main/sultan_cricket.json';
const VAST_URL = 'https://raw.githubusercontent.com/dartv-ajaz/Live-Sports-Group-A/refs/heads/main/dartv_vast_channels.json';
const GROUP_B_URL = 'https://raw.githubusercontent.com/dartv-ajaz/Live-Sports-Group-B/main/live_matches_B.json';

// 🏆 SULTAN VIP / PREMIUM LIVE MATCHES
const PREMIUM_LIVE_MATCHES: Match[] = [
  {
    id: 'cat-sultan-wc-1', sport: 'Cricket', league: 'ICC World Cup', team1: 'Star Sports 1 (HD)', team2: 'LIVE MATCH',
    team1Logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Star_Sports_1_Hindi_2023.svg',
    team2Logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50/lsci/db/PICTURES/CMS/313100/313129.logo.png',
    status: 'Live', time: 'Live Now', isHot: true, streamUrl: 'https://vaathala00.github.io/hotstar/sports/t20/', groupTitle: 'World Cup LIVE', type: 'Iframe'
  },
  {
    id: 'cat-sultan-wc-2', sport: 'Cricket', league: 'T20 LIVE', team1: 'Ten Sports (HD)', team2: 'LIVE MATCH',
    team1Logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Ten_Sports_Logo.svg/1200px-Ten_Sports_Logo.svg.png',
    team2Logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50/lsci/db/PICTURES/CMS/313100/313128.logo.png',
    status: 'Live', time: 'Live Now', isHot: true, streamUrl: 'https://vaathala00.github.io/hotstar/sports/t20/', groupTitle: 'World Cup LIVE', type: 'Iframe'
  },
  {
    id: 'cat-sultan-wc-3', sport: 'Cricket', league: 'ICC Tournaments', team1: 'PTV Sports LIVE', team2: 'LIVE MATCH',
    team1Logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/PTV_Sports_logo.svg/1200px-PTV_Sports_logo.svg.png',
    team2Logo: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50/lsci/db/PICTURES/CMS/340400/340493.png',
    status: 'Live', time: 'Live Now', isHot: true, streamUrl: 'https://vaathala00.github.io/hotstar/sports/t20/', groupTitle: 'World Cup LIVE', type: 'Iframe'
  }
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('live-events');
  const [lastMainView, setLastMainView] = useState<View>('live-events');
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

  useEffect(() => {
    const savedFavs = localStorage.getItem('cricpk_favorites');
    if (savedFavs) try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    const savedCustom = localStorage.getItem('cricpk_custom_playlists');
    if (savedCustom) try { setCustomCategories(JSON.parse(savedCustom)); } catch (e) {}
  }, []);

  const toggleFavorite = (channel: Channel) => {
    setFavorites(prev => {
      const isFav = prev.some(c => c.id === channel.id);
      const newFavs = isFav ? prev.filter(c => c.id !== channel.id) : [...prev, channel];
      localStorage.setItem('cricpk_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const handleAddCustomPlaylist = (name: string, url: string) => {
    const newCat: Category = { id: `custom-${Date.now()}`, name, playlistUrl: url };
    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    localStorage.setItem('cricpk_custom_playlists', JSON.stringify(updated));
  };

  const handleDeleteCustomPlaylist = (id: string) => {
    const updated = customCategories.filter(c => c.id !== id);
    setCustomCategories(updated);
    localStorage.setItem('cricpk_custom_playlists', JSON.stringify(updated));
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

  const parseM3U = (text: string, categoryId: string) => {
    const lines = text.split('\n');
    const matches: Match[] = [];
    const channels: Channel[] = [];
    let currentInfo: any = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        const groupMatch = line.match(/group-title="([^"]+)"/);
        const nameSplit = line.split(',');
        const name = nameSplit.length > 1 ? nameSplit.pop()?.trim() || 'Unknown' : 'Unknown';
        let logo = logoMatch ? logoMatch[1] : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        currentInfo = { name, logo, group: groupMatch ? groupMatch[1] : 'General' };
      } else if (line.startsWith('http') && currentInfo) {
        channels.push({ id: `ch-${categoryId}-${channels.length}`, name: currentInfo.name, logo: currentInfo.logo, categoryId: categoryId, streamUrl: line });
        currentInfo = null;
      }
    }
    return { channels, matches };
  };

  const fetchInitialData = useCallback(async () => {
    
    // 🚀 MAGIC TRICK 1: Fauran Premium Matches Dikhao aur Loader Band Kardo! (0.1 Second Load)
    setMatches([...PREMIUM_LIVE_MATCHES]);
    setIsLoading(false);
    setFetchError(null);

    try {
      let currentMatches: Match[] = [...PREMIUM_LIVE_MATCHES];
      let currentChannels: Channel[] = [];
      let newCache: Record<string, Channel[]> = {};
      let newCloudCats: Category[] = [];

      // 1. Purani M3U Playlist Load (Background)
      try {
        const text = await fetchM3UText(DEFAULT_M3U);
        const parsed = parseM3U(text, 'cat-combined');
        currentChannels = [...parsed.channels];
        newCache['cat-combined'] = parsed.channels;
        newCloudCats.push({ id: 'cat-combined', name: '📺 All Live TV (Old)', playlistUrl: DEFAULT_M3U });
      } catch (e) {
        console.log("M3U load failed");
      }

      // 🚀 MAGIC TRICK 2: Parallel Fetching (Bari Bari nahi, sab ek sath!)
      const apiConfigs = [
        { id: 'cat-group-b', name: 'Hotstar LIVE', url: GROUP_B_URL, type: 'json', key: 'matches' },
        { id: 'cat-vip', name: '⚡ VIP Cricket', url: VIP_URL, type: 'json', key: 'channels' },
        { id: 'cat-sultan', name: '👑 Sultan VIP', url: SULTAN_URL, type: 'json', key: 'channels' },
        { id: 'cat-cricket', name: 'Cricket TV', url: CRICKET_URL, type: 'json', key: 'channels' },
        { id: 'cat-jio', name: 'Jio TV', url: JIO_URL, type: 'json', key: 'channels' },
        { id: 'cat-vast', name: '📺 Vast Channels', url: VAST_URL, type: 'json', key: 'channels' }
      ];

      // Sab API calls ek sath execute hongi
      const apiResults = await Promise.all(
        apiConfigs.map(async (config) => {
          try {
            const text = await fetchM3UText(config.url);
            return { config, data: JSON.parse(text) };
          } catch (err) {
            return { config, data: null };
          }
        })
      );

      // Data ko merge karna
      apiResults.forEach(({ config, data: apiData }) => {
        if (!apiData) return;
        const items = Array.isArray(apiData) ? apiData : (apiData[config.key] || apiData.matches || apiData.channels || []);
        
        if (items.length > 0) {
            const apiChannels: Channel[] = items.map((m: any, idx: number) => ({
                id: `ch-${config.id}-${m.id || idx}`,
                name: m.title || m.name || `Channel ${idx}`,
                logo: m.logo || m.banner || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.title || m.name || config.name)}`,
                categoryId: config.id,
                streamUrl: m.url || m.streamUrl || ''
            })).filter(c => c.streamUrl);

            newCache[config.id] = apiChannels;
            currentChannels = [...currentChannels, ...apiChannels];
            newCloudCats.push({ id: config.id, name: config.name, playlistUrl: 'internal-api' });

            const sportsKeywords = ['cricket', 'hockey', 'kabaddi', 'sport', 'wwe', 'tennis', 'football'];
            const dynamicLiveMatches: Match[] = items.filter((m: any) => {
                if (config.key === 'matches') return true; 
                const title = (m.title || m.name || '').toLowerCase();
                const category = (m.category || '').toLowerCase();
                return sportsKeywords.some(kw => title.includes(kw) || category.includes(kw));
            }).map((m: any, idx: number) => ({
                id: m.id || `live-${config.id}-${idx}`,
                sport: m.sport || m.category || 'Sports',
                league: config.name,
                team1: m.title || m.name,
                team2: m.team_2 || 'LIVE',
                team1Logo: m.logo || m.team_1_flag || m.banner || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.title || m.name || config.name)}`,
                team2Logo: m.logo || m.team_2_flag || m.banner || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.title || m.name || config.name)}`,
                status: 'Live',
                time: 'Live Now',
                isHot: true,
                streamUrl: m.url || m.streamUrl,
                groupTitle: m.category || config.name,
                type: "Mixed"
            }));
            
            currentMatches = [...currentMatches, ...dynamicLiveMatches];
        }
      });

      // 🚀 Akhir mein UI ko background se update kardo
      setMatches(currentMatches);
      setAllChannels(currentChannels);
      setCloudCategories(newCloudCats);
      setPlaylistCache(newCache);

    } catch (error: any) {
      console.error("Background data fetch failed", error);
      // Failsafe error show karne ke liye agar bilkul hi internet na ho
      if (matches.length === 0) setFetchError("Please check your internet connection.");
    }
  }, []); // Emapty array taake loop na chalay

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const handleCategorySelect = async (category: Category) => {
    setSelectedCategory(category);
    setActiveView('channel-detail');
    if (category.id === 'cat-favorites') {
      setCategoryChannels(favorites);
      return;
    }
    if (playlistCache[category.id]) {
      setCategoryChannels(playlistCache[category.id]);
    }
  };

  const handleMatchSelect = (match: Match) => {
    setLastMainView('live-events');
    setSelectedMatch(match);
    setActiveView('player');
  };

  const handleLinkSelect = (linkName: string) => {
    setShowLinkModal(false);
    setFloatingMatch(null);
    setActiveView('player');
  };

  const playChannel = (ch: Channel) => {
    const matchData: Match = {
      id: ch.id, team1: ch.name, team2: 'Network Mirror', team1Logo: ch.logo, team2Logo: ch.logo,
      league: selectedCategory?.name || 'Live TV', status: 'Live', time: 'Live', sport: 'Other', streamUrl: ch.streamUrl
    };
    setSelectedMatch(matchData);
    setFloatingMatch(null);
    setActiveView('player');
  };

  const renderView = () => {
    if (isLoading) return <div className="flex flex-col items-center justify-center h-full gap-4"><div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" /></div>;
    if (fetchError) return <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-6"><WifiOff className="w-10 h-10 text-red-500" /><p className="text-white">{fetchError}</p><button onClick={fetchInitialData} className="bg-white text-black px-8 py-4 rounded-2xl"><RefreshCw className="w-4 h-4 inline" /> Reconnect</button></div>;

    if (globalSearchQuery.trim().length > 0) {
      const searchResults = allChannels.filter(c => c.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 100);
      return <ChannelListView channels={searchResults} category={{ id: 'search', name: `Search Results`, playlistUrl: '' }} loading={false} onBack={() => setGlobalSearchQuery('')} onSelectChannel={(ch) => { setGlobalSearchQuery(''); setLastMainView('categories'); playChannel(ch); }} />;
    }

    switch (activeView) {
      case 'about': return <AboutView />;
      case 'privacy': return <PrivacyPolicyView />;
      case 'live-events': return <LiveEventsView matches={matches} onSelectMatch={handleMatchSelect} />;
      case 'categories': return <CategoriesView onSelectCategory={handleCategorySelect} favoritesCount={favorites.length} cloudCategories={cloudCategories} customCategories={customCategories} onAddCustom={handleAddCustomPlaylist} onDeleteCustom={handleDeleteCustomPlaylist} />;
      case 'channel-detail': return <ChannelListView channels={categoryChannels} category={selectedCategory} loading={isCategoryLoading} onBack={() => setActiveView('categories')} onSelectChannel={(ch) => { setLastMainView('channel-detail'); playChannel(ch); }} />;
      case 'player':
        const related = categoryChannels.length > 0 ? categoryChannels.slice(0, 40) : allChannels.slice(0, 40);
        return <PlayerView match={selectedMatch} onBack={() => setActiveView(lastMainView)} onEnterPiP={() => { setFloatingMatch(selectedMatch); setActiveView(lastMainView); }} onShowMoreLinks={() => setShowLinkModal(true)} relatedChannels={related} onSelectRelated={playChannel} isFavorite={favorites.some(f => f.id === selectedMatch?.id)} onToggleFavorite={() => { if (selectedMatch) toggleFavorite({ id: selectedMatch.id, name: selectedMatch.team1, logo: selectedMatch.team1Logo, categoryId: 'fav', streamUrl: selectedMatch.streamUrl }); }} />;
      default: return <LiveEventsView matches={matches} onSelectMatch={handleMatchSelect} />;
    }
  };

  const isFullPlayer = activeView === 'player';

  return (
    <div className="flex flex-row h-screen overflow-hidden bg-[#0f1115] text-white">
      {!isFullPlayer && <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} activeView={activeView} onNavigate={(v) => { setActiveView(v); setLastMainView(v); setSidebarOpen(false); }} />}
      <div className="flex flex-col flex-1 relative min-w-0">
        {!isFullPlayer && (
          <Header 
            title={activeView === 'categories' ? 'Playlists' : activeView === 'channel-detail' ? (selectedCategory?.name || 'Channels') : activeView === 'about' ? 'About Us' : activeView === 'privacy' ? 'Privacy Policy' : 'DAR TEVE'} 
            onOpenSidebar={() => setSidebarOpen(true)} showBack={activeView === 'channel-detail'} onBack={() => setActiveView('categories')} searchQuery={globalSearchQuery} onSearchChange={setGlobalSearchQuery} 
          />
        )}
        <main className={`flex-1 overflow-y-auto scrollbar-hide ${!isFullPlayer ? 'pb-24 md:pb-6' : ''}`}>
          <div className={`${!isFullPlayer ? 'max-w-[1600px] mx-auto' : 'w-full h-full'}`}>{renderView()}</div>
        </main>
        {!isFullPlayer && <BottomNav activeView={activeView === 'channel-detail' ? 'categories' : activeView} onViewChange={(v) => { setActiveView(v); setLastMainView(v); }} />}
      </div>
      {floatingMatch && <FloatingPlayer match={floatingMatch} onExpand={() => { setSelectedMatch(floatingMatch); setFloatingMatch(null); setActiveView('player'); }} onClose={() => setFloatingMatch(null)} />}
      {showLinkModal && <LinkModal match={selectedMatch} onClose={() => setShowLinkModal(false)} onSelect={handleLinkSelect} />}
    </div>
  );
};

export default App;