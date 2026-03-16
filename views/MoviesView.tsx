import React, { useState, useEffect } from 'react';
import { Play, Star, Search, Activity, Film, Calendar, Clock, ArrowRight, Server, ShieldCheck, X } from 'lucide-react';

interface MoviesViewProps {
  onPlay: (movieMatchObject: any) => void;
}

interface MovieSection {
    title: string;
    movies: any[];
}

const OMDB_API_KEY = '135b470e';
const BASE_URL = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;

const STREAMING_SERVERS = [
    { id: 'vidsrcnet', name: 'Server 1 (Fast)', getUrl: (id: string) => `https://vidsrc.net/embed/movie?imdb=${id}` },
    { id: 'vidsrcpro', name: 'Server 2 (Pro HD)', getUrl: (id: string) => `https://vidsrc.pro/embed/movie/${id}` },
    { id: 'embedsu', name: 'Server 3 (Multi)', getUrl: (id: string) => `https://embed.su/embed/movie/${id}` },
    { id: 'autoembed', name: 'Server 4 (Backup)', getUrl: (id: string) => `https://autoembed.to/movie/imdb/${id}` }
];

let movieCache = {
    sections: [] as MovieSection[],
    heroMovie: null as any,
    searchResults: [] as any[],
    searchQuery: '',
    searchMode: false,
    lastFetch: 0
};

export default function MoviesView({ onPlay }: MoviesViewProps) {
    const isCacheValid = movieCache.sections.length > 0 && (Date.now() - movieCache.lastFetch < 3600000);
    
    const [sections, setSections] = useState<MovieSection[]>(movieCache.sections);
    const [heroMovie, setHeroMovie] = useState<any | null>(movieCache.heroMovie);
    const [loading, setLoading] = useState(!isCacheValid);
    
    const [searchQuery, setSearchQuery] = useState(movieCache.searchQuery);
    const [searchMode, setSearchMode] = useState(movieCache.searchMode);
    const [searchResults, setSearchResults] = useState<any[]>(movieCache.searchResults);
    const [isSearching, setIsSearching] = useState(false);
    
    const [selectedServerIndex, setSelectedServerIndex] = useState(0);
    
    // 🔥 NEW: State for the DNS Warning Banner
    const [showDnsWarning, setShowDnsWarning] = useState(true);

    const fetchInitialData = async () => {
        if (isCacheValid) return;

        setLoading(true);
        try {
            const heroRes = await fetch(`${BASE_URL}&i=tt3896198&plot=full`);
            const heroData = await heroRes.json();
            let newHero = null;
            if (heroData.Response === "True") {
                newHero = heroData;
                setHeroMovie(heroData);
            }

            const categories = [
                { title: '💥 Marvel Cinematic Universe', query: 'Marvel' },
                { title: '🦇 DC Extended Universe', query: 'Batman' },
                { title: '🚀 Epic Sci-Fi', query: 'Star Wars' },
                { title: '🏎️ Action Blockbusters', query: 'Fast' },
                { title: '🪄 Magical Worlds', query: 'Harry Potter' }
            ];

            const promises = categories.map(async (cat) => {
                const res = await fetch(`${BASE_URL}&s=${encodeURIComponent(cat.query)}&type=movie`);
                const data = await res.json();
                return {
                    title: cat.title,
                    movies: data.Response === "True" ? data.Search : []
                };
            });

            const results = await Promise.all(promises);
            const validSections = results.filter(s => s.movies.length > 0);
            setSections(validSections);

            movieCache = {
                ...movieCache,
                sections: validSections,
                heroMovie: newHero || movieCache.heroMovie,
                lastFetch: Date.now()
            };

        } catch (err) {
            console.error("OMDB API Error:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const searchOMDB = async (query: string) => {
        if (!query.trim()) {
            setSearchMode(false);
            movieCache.searchMode = false;
            movieCache.searchQuery = '';
            return;
        }
        
        setIsSearching(true);
        setSearchMode(true);
        setSearchResults([]);

        try {
            const res = await fetch(`${BASE_URL}&s=${encodeURIComponent(query)}&type=movie`);
            const data = await res.json();
            
            if (data.Response === "True") {
                setSearchResults(data.Search);
                movieCache.searchResults = data.Search;
            } else {
                setSearchResults([]);
                movieCache.searchResults = [];
            }
            movieCache.searchMode = true;
            movieCache.searchQuery = query;

        } catch (e) {
            console.error("Search failed:", e);
        }
        setIsSearching(false);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        searchOMDB(searchQuery);
    };

    const handlePlayMovie = (movie: any) => {
        const imdbId = movie.imdbID;
        const embedUrl = STREAMING_SERVERS[selectedServerIndex].getUrl(imdbId);
        const originalPoster = movie.Poster !== 'N/A' ? movie.Poster : '';

        onPlay({
            id: `cat-sultan-${imdbId}`, 
            team1: movie.Title,
            name: movie.Title,
            streamUrl: embedUrl,
            url: embedUrl,
            type: 'Iframe',
            logo: originalPoster,
            isSultan: true
        });
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#0f1115] text-white overflow-y-auto pb-24">
            
            {/* 🔍 SEARCH BAR */}
            <div className="sticky top-0 z-50 bg-[#0f1115]/90 backdrop-blur-md p-4 border-b border-white/10 shadow-lg">
                <form onSubmit={handleSearchSubmit} className="relative max-w-4xl mx-auto flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value === '') {
                                    setSearchMode(false);
                                    movieCache.searchMode = false;
                                }
                            }}
                            placeholder="Search the Global OMDB Movie Database..." 
                            className="w-full bg-[#1a1d24] border border-white/10 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#00b865] focus:ring-1 focus:ring-[#00b865] transition-all"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#00b865] w-5 h-5" />
                    </div>
                    <button type="submit" className="bg-[#00b865] text-black px-8 py-1.5 rounded-xl font-black text-sm hover:bg-white hover:scale-105 transition-all shadow-[0_0_15px_rgba(0,184,101,0.3)]">
                        Search
                    </button>
                </form>
            </div>

            {/* 🔥 DNS UNBLOCK WARNING BANNER */}
            {showDnsWarning && (
                <div className="bg-gradient-to-r from-blue-900/30 to-[#0f1115] border border-blue-500/30 p-4 mx-4 md:mx-8 mt-6 rounded-xl flex items-start md:items-center justify-between gap-4 relative overflow-hidden animate-in slide-in-from-top duration-500">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]"></div>
                    <div className="flex items-start md:items-center gap-4">
                        <div className="bg-blue-500/20 p-2.5 rounded-lg text-blue-400 shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1.5">Movies not loading or showing a blank screen?</h4>
                            <p className="text-xs text-gray-400 leading-relaxed max-w-4xl">
                                Your internet provider is blocking the stream. To bypass this instantly without a VPN, go to your phone's <b>Settings &gt; Network &gt; Private DNS</b> and set it to <code className="bg-black/50 text-blue-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-white/5">dns.google</code> or <code className="bg-black/50 text-blue-300 px-1.5 py-0.5 rounded font-mono text-[11px] border border-white/5">1dot1dot1dot1.cloudflare-dns.com</code>.
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setShowDnsWarning(false)} className="text-gray-500 hover:text-white p-2 shrink-0 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* 🎬 SEARCH RESULTS MODE */}
            {searchMode ? (
                <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                    <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest border-l-4 border-[#00b865] pl-3 flex items-center gap-2 mt-4">
                        Search Results for "{searchQuery}"
                    </h3>
                    
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center h-[50vh]">
                            <Activity className="w-12 h-12 text-[#00b865] animate-spin mb-4" />
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
                            <Film className="w-16 h-16 mb-4 opacity-30" />
                            <h2 className="text-xl font-bold">No movies found</h2>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {searchResults.map((movie, idx) => (
                                <div key={idx} onClick={() => handlePlayMovie(movie)} className="group cursor-pointer bg-[#1a1d24] rounded-xl overflow-hidden hover:ring-2 hover:ring-[#00b865] transition-all shadow-lg hover:shadow-[0_0_20px_rgba(0,184,101,0.3)] hover:-translate-y-1">
                                    <div className="relative aspect-[2/3] overflow-hidden bg-gray-900">
                                        <img src={movie.Poster !== 'N/A' ? movie.Poster : `https://ui-avatars.com/api/?name=${encodeURIComponent(movie.Title)}&background=00b865&color=fff&size=512`} alt={movie.Title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                            <div className="flex items-center justify-center w-10 h-10 bg-[#00b865] rounded-full mb-2 shadow-lg mx-auto">
                                                <Play fill="black" className="w-5 h-5 text-black ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-sm text-white line-clamp-1 mb-1 group-hover:text-[#00b865] transition-colors">{movie.Title}</h4>
                                        <span className="text-xs font-bold text-gray-400">{movie.Year}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* 🎬 DEFAULT MODE */
                <>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-[70vh]">
                            <Activity className="w-12 h-12 text-[#00b865] animate-spin mb-4" />
                        </div>
                    ) : (
                        <>
                            {/* 🌟 HERO BANNER */}
                            {heroMovie && (
                                <div className="relative w-full h-auto min-h-[60vh] md:min-h-[75vh] bg-black shrink-0 flex flex-col justify-end pb-8 mt-4 md:mt-0">
                                    <div className="absolute inset-0">
                                        <img src={heroMovie.Poster} alt={heroMovie.Title} className="w-full h-full object-cover opacity-30 blur-sm scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/80 to-transparent" />
                                    </div>
                                    
                                    <div className="relative z-10 px-6 md:px-16 w-full md:w-3/4 animate-in slide-in-from-bottom duration-1000 pt-32">
                                        <div className="flex items-end gap-8 mb-6">
                                            <div>
                                                <h2 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-2xl leading-tight text-white">{heroMovie.Title}</h2>
                                                <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-gray-300 mb-6">
                                                    <span className="flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5"><Star size={16} className="text-yellow-500" fill="currentColor"/> {heroMovie.imdbRating}/10</span>
                                                    <span className="flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5"><Calendar size={16}/> {heroMovie.Year}</span>
                                                    <span className="flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5"><Clock size={16}/> {heroMovie.Runtime}</span>
                                                </div>
                                                <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3 max-w-3xl drop-shadow-md mb-2">{heroMovie.Plot}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-black/40 backdrop-blur-md border border-white/5 p-4 rounded-2xl mb-6 max-w-2xl">
                                            <div className="flex items-center gap-2 mb-3 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                                <Server size={14} /> Select Streaming Server
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {STREAMING_SERVERS.map((server, idx) => (
                                                    <button key={server.id} onClick={() => setSelectedServerIndex(idx)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${selectedServerIndex === idx ? 'bg-[#00b865] text-black border-[#00b865]' : 'bg-black/50 text-gray-400 border-white/10 hover:text-white'}`}>
                                                        {server.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button onClick={() => handlePlayMovie(heroMovie)} className="flex items-center justify-center gap-3 bg-[#00b865] text-black px-10 py-4 rounded-xl font-black text-lg hover:scale-105 transition-all">
                                            <Play fill="currentColor" size={24}/> WATCH NOW
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 md:p-8 space-y-10 max-w-[1800px] mx-auto mt-4">
                                {sections.map((section, sectionIdx) => (
                                    <div key={sectionIdx} className="relative">
                                        <h3 className="text-xl md:text-2xl font-black text-white mb-4 uppercase tracking-wider">{section.title}</h3>
                                        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 [&::-webkit-scrollbar]:hidden" style={{ scrollSnapType: 'x mandatory' }}>
                                            {section.movies.map((movie, idx) => (
                                                <div key={`${sectionIdx}-${idx}`} onClick={() => handlePlayMovie(movie)} className="relative shrink-0 w-36 sm:w-44 md:w-48 group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 shadow-lg border border-white/5" style={{ scrollSnapAlign: 'start' }}>
                                                    <img src={movie.Poster !== 'N/A' ? movie.Poster : `https://ui-avatars.com/api/?name=${encodeURIComponent(movie.Title)}&background=00b865&color=fff&size=512`} alt={movie.Title} className="w-full aspect-[2/3] object-cover bg-[#1a1d24]" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform">
                                                            <h4 className="font-bold text-sm text-white line-clamp-2 leading-tight">{movie.Title}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}