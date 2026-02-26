import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Radio, Globe, Volume2, VolumeX, SkipBack, SkipForward, Power, ChevronLeft, ChevronRight, Activity, Search } from 'lucide-react';

interface RadioViewProps {
  onBack: () => void;
}

const COUNTRIES = [
  'Global', 'India', 'Pakistan', 'United Arab Emirates', 'United Kingdom', 'United States', 
  'Bangladesh', 'Canada', 'Australia', 'Saudi Arabia', 'Sri Lanka', 'Nepal'
];

const GENRES = ['All', 'News', 'Sports/Cricket', 'Music', 'Talk', 'Religion'];

const BANDS = {
  FM: { min: 87.5, max: 108.0, step: 0.1, unit: 'MHz' },
  MW: { min: 520, max: 1610, step: 10, unit: 'kHz' },
  SW: { min: 2.3, max: 26.1, step: 0.1, unit: 'MHz' }
};

type BandType = 'FM' | 'MW' | 'SW';

// 🎁 EXCLUSIVE JAMMU & KASHMIR + PREMIUM LOCAL STATIONS (As per onlineradiofm.in)
const PREMIUM_LOCAL_STATIONS = [
  { stationuuid: 'local-jk-1', name: 'BIG FM 92.7 (Srinagar)', url_resolved: 'https://stream.zeno.fm/5u2c0yh0ekhvv', mappedBand: 'FM', mappedFreq: 92.7, favicon: 'https://ui-avatars.com/api/?name=BIG+92.7&background=ff4757&color=fff', country: 'India', tags: 'Kashmir, Srinagar, Local, Bollywood' },
  { stationuuid: 'local-jk-2', name: 'Radio Mirchi 98.3 (Srinagar)', url_resolved: 'http://stream2.oppocast.com/mi_stream', mappedBand: 'FM', mappedFreq: 98.3, favicon: 'https://ui-avatars.com/api/?name=Mirchi+98.3&background=ff4757&color=fff', country: 'India', tags: 'Kashmir, Srinagar, Local, Hits' },
  { stationuuid: 'local-jk-3', name: 'RED FM 93.5 (J&K)', url_resolved: 'https://stream.zeno.fm/0az0qx8e4p8uv', mappedBand: 'FM', mappedFreq: 93.5, favicon: 'https://ui-avatars.com/api/?name=RED+93.5&background=ff4757&color=fff', country: 'India', tags: 'Kashmir, Jammu, Local, Bollywood' },
  { stationuuid: 'local-jk-4', name: 'AIR Srinagar (102.6 FM)', url_resolved: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio002/hlspbaudio002_Auto.m3u8', mappedBand: 'FM', mappedFreq: 102.6, favicon: 'https://ui-avatars.com/api/?name=AIR+Srinagar&background=00b865&color=fff', country: 'India', tags: 'Kashmir, Srinagar, News, Local' },
  { stationuuid: 'local-jk-5', name: 'Radio Sharda 90.4 FM (Jammu)', url_resolved: 'https://stream.zeno.fm/qgqrxfte41zuv', mappedBand: 'FM', mappedFreq: 90.4, favicon: 'https://ui-avatars.com/api/?name=Sharda+90.4&background=ff4757&color=fff', country: 'India', tags: 'Kashmir, Jammu, Local, Community' },
  { stationuuid: 'local-jk-6', name: 'AIR Jammu (103.5 FM)', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio021/chunklist.m3u8', mappedBand: 'FM', mappedFreq: 103.5, favicon: 'https://ui-avatars.com/api/?name=AIR+Jammu&background=00b865&color=fff', country: 'India', tags: 'Kashmir, Jammu, Local, News' },
  { stationuuid: 'local-jk-7', name: 'Akashvani Bhaderwah', url_resolved: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio002/hlspbaudio002_Auto.m3u8', mappedBand: 'FM', mappedFreq: 101.0, favicon: 'https://ui-avatars.com/api/?name=Bhaderwah&background=00b865&color=fff', country: 'India', tags: 'Kashmir, Bhaderwah, Local' },
  { stationuuid: 'local-jk-8', name: 'AIR Leh & Kargil', url_resolved: 'https://air.pc.cdn.bitgravity.com/air/live/pbaudio021/chunklist.m3u8', mappedBand: 'FM', mappedFreq: 100.3, favicon: 'https://ui-avatars.com/api/?name=AIR+Leh&background=00b865&color=fff', country: 'India', tags: 'Kashmir, Leh, Kargil, Local' }
];

const RadioView: React.FC<RadioViewProps> = ({ onBack }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 🌍 Global Search States
  const [country, setCountry] = useState('India');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [activeSearch, setActiveSearch] = useState(''); 
  const [genre, setGenre] = useState('All');
  
  // 📻 Radio States
  const [isPowered, setIsPowered] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState('');
  
  // 🎛️ Tuning States
  const [band, setBand] = useState<BandType>('FM');
  const [frequency, setFrequency] = useState<number>(92.7);
  const [currentStation, setCurrentStation] = useState<any | null>(null);
  const [directFreqInput, setDirectFreqInput] = useState('');

  // 🧠 SMART REAL-FREQUENCY EXTRACTOR
  const extractRealFrequency = (name: string): number | null => {
    const fmMatch = name.match(/(\d{2,3}\.\d)/);
    if (fmMatch) {
        const val = parseFloat(fmMatch[1]);
        if (val >= 87.5 && val <= 108.0) return val;
    }
    return null;
  };

  const getStableFrequency = (uuid: string, b: BandType): number => {
      let hash = 0;
      for (let i = 0; i < uuid.length; i++) hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
      hash = Math.abs(hash);
      if (b === 'FM') return Number((87.5 + (hash % 205) * 0.1).toFixed(1));
      if (b === 'MW') return 520 + (hash % 109) * 10;
      if (b === 'SW') return Number((2.3 + (hash % 238) * 0.1).toFixed(1));
      return 88.1;
  };

  // 🌐 THE GLOBAL API ENGINE + LOCAL J&K PACK
  const fetchStations = async () => {
    setLoading(true);
    setError('');
    if (audioRef.current) { audioRef.current.pause(); }
    setIsPlaying(false);
    setCurrentStation(null);

    try {
      let url = `https://all.api.radio-browser.info/json/stations/search?limit=150&hidebroken=true&order=clickcount&reverse=true`;
      
      if (country !== 'Global') url += `&country=${encodeURIComponent(country)}`;
      if (activeSearch) url += `&name=${encodeURIComponent(activeSearch)}`;
      
      if (genre === 'Sports/Cricket') url += `&tagList=cricket,sports`;
      else if (genre !== 'All') url += `&tag=${encodeURIComponent(genre.toLowerCase())}`;

      let res = await fetch(url);
      let data = await res.json();

      if (data.length === 0 && activeSearch) {
         let fallbackUrl = `https://all.api.radio-browser.info/json/stations/search?limit=150&hidebroken=true&order=clickcount&reverse=true&state=${encodeURIComponent(activeSearch)}`;
         if (country !== 'Global') fallbackUrl += `&country=${encodeURIComponent(country)}`;
         if (genre === 'Sports/Cricket') fallbackUrl += `&tagList=cricket,sports`;
         else if (genre !== 'All') fallbackUrl += `&tag=${encodeURIComponent(genre.toLowerCase())}`;
         
         res = await fetch(fallbackUrl);
         data = await res.json();
      }
      
      let mappedStations = data.map((st: any, i: number) => {
          let stFreq = extractRealFrequency(st.name);
          let stBand: BandType = 'FM';

          if (stFreq) {
              stBand = 'FM';
          } else {
              const amMatch = st.name.match(/(\d{3,4})\s?(AM|MW|kHz)/i);
              if (amMatch && parseInt(amMatch[1]) >= 520 && parseInt(amMatch[1]) <= 1610) {
                  stBand = 'MW'; stFreq = parseInt(amMatch[1]);
              } else {
                  if (i % 4 === 0) stBand = 'MW';
                  else if (i % 7 === 0) stBand = 'SW';
                  else stBand = 'FM';
                  stFreq = getStableFrequency(st.stationuuid, stBand);
              }
          }
          return { ...st, mappedBand: stBand, mappedFreq: stFreq };
      });

      // 🎁 INJECT JAMMU & KASHMIR PREMIUM PACK IF APPLICABLE
      if (country === 'India' || country === 'Global') {
          const searchLow = activeSearch.toLowerCase();
          const localPack = PREMIUM_LOCAL_STATIONS.filter(s => 
              searchLow === '' || s.tags.toLowerCase().includes(searchLow) || s.name.toLowerCase().includes(searchLow)
          );
          
          // Remove API duplicates of our premium local stations
          mappedStations = mappedStations.filter((m: any) => !localPack.some(l => l.mappedFreq === m.mappedFreq && l.mappedBand === m.mappedBand));
          
          // Push J&K local stations to the top!
          mappedStations = [...localPack, ...mappedStations];
      }

      setStations(mappedStations);
      
      if (mappedStations.length > 0) {
         setBand(mappedStations[0].mappedBand);
         setFrequency(mappedStations[0].mappedFreq);
      }
    } catch (err) {
      setError('Signal Lost. Check Internet.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchStations(); }, [country, activeSearch, genre]);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);

  // 📡 TUNING LOCK ENGINE
  useEffect(() => {
    if (!isPowered) return;
    const matched = stations.find(s => s.mappedBand === band && Math.abs(s.mappedFreq - frequency) < 0.05);
    
    if (matched) {
      if (currentStation?.stationuuid !== matched.stationuuid) {
         setCurrentStation(matched);
         setError('');
         if (isPlaying) {
            setTimeout(() => {
              if (audioRef.current) audioRef.current.play().catch(() => setError('Tuning Error...'));
            }, 100);
         }
      }
    } else {
      setCurrentStation(null);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    }
  }, [frequency, band, isPowered]);

  const togglePower = () => {
    setIsPowered(!isPowered);
    if (isPowered && audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
  };

  const togglePlay = () => {
    if (!isPowered) return;
    if (!audioRef.current || !currentStation) { setError('STATIC (NO SIGNAL)'); return; }
    
    if (isPlaying) {
      audioRef.current.pause(); setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => { setIsPlaying(true); setError(''); }).catch(() => setError('Stream Offline'));
    }
  };

  const manualTune = (direction: 1 | -1) => {
    if (!isPowered) return;
    let f = frequency + (BANDS[band].step * direction);
    f = Math.round(f * 10) / 10; 
    if (f > BANDS[band].max) f = BANDS[band].min;
    if (f < BANDS[band].min) f = BANDS[band].max;
    setFrequency(f);
  };

  const seekStation = (direction: 1 | -1) => {
    if (!isPowered) return;
    const currentBandStations = stations.filter(s => s.mappedBand === band).sort((a,b) => a.mappedFreq - b.mappedFreq);
    if (currentBandStations.length === 0) {
        setError(`NO STATIONS IN ${band}`);
        return;
    }

    let nextSt;
    if (direction === 1) {
       nextSt = currentBandStations.find(s => s.mappedFreq > frequency) || currentBandStations[0];
    } else {
       nextSt = [...currentBandStations].reverse().find(s => s.mappedFreq < frequency) || currentBandStations[currentBandStations.length - 1];
    }
    
    setFrequency(nextSt.mappedFreq);
    setIsPlaying(true); 
  };

  const handleDirectFreqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPowered) setIsPowered(true);
    const f = parseFloat(directFreqInput);
    if (!isNaN(f)) {
      let targetBand = band;
      if (f >= 87.5 && f <= 108) targetBand = 'FM';
      else if (f >= 520 && f <= 1610) targetBand = 'MW';
      else if (f >= 2.0 && f <= 30.0) targetBand = 'SW';
      
      setBand(targetBand);
      setFrequency(Number(f.toFixed(1)));
      setDirectFreqInput('');
      setIsPlaying(true);
    }
  };

  const directPlayFromList = (st: any) => {
    if (!isPowered) setIsPowered(true);
    setBand(st.mappedBand);
    setFrequency(st.mappedFreq);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f1115] text-white font-sans select-none overflow-hidden">
      
      {/* 📌 STATIC RADIO SET (Sticky Top) */}
      <div className="bg-[#121212] pt-4 px-4 md:px-8 pb-4 shadow-[0_20px_30px_rgba(0,0,0,0.6)] z-50 shrink-0 border-b border-white/5">
        
        <div className="max-w-[1200px] mx-auto bg-gradient-to-b from-[#2c2f33] to-[#1a1c20] rounded-3xl border-[6px] border-[#121418] shadow-[inset_0_5px_15px_rgba(255,255,255,0.1)] p-4 md:p-6 relative">
          
          <div className="flex justify-between items-center mb-4">
            <button onClick={onBack} className="p-2 bg-black/40 rounded-full hover:bg-[#00b865] transition text-white shadow-inner">
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex bg-black/60 p-1 rounded-lg border border-white/5 shadow-inner">
              {(['FM', 'MW', 'SW'] as BandType[]).map(b => (
                <button 
                  key={b} 
                  onClick={() => { if(isPowered) { setBand(b); setFrequency(BANDS[b].min); } }}
                  className={`px-4 py-1 rounded text-xs font-bold transition-all ${band === b && isPowered ? 'bg-[#00b865] text-black shadow-[0_0_10px_#00b865]' : 'text-gray-500 hover:text-white'}`}
                >
                  {b}
                </button>
              ))}
            </div>
            <Radio className={`w-6 h-6 ${isPowered ? 'text-[#00b865]' : 'text-gray-600'}`} />
          </div>

          <div className="bg-[#050807] border-4 border-[#020302] rounded-xl p-4 flex flex-col items-center justify-center h-32 md:h-40 mb-5 shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative overflow-hidden">
            {!isPowered ? (
               <h2 className="text-gray-800 font-mono text-3xl font-black tracking-widest">POWER OFF</h2>
            ) : (
              <>
                <div className="absolute top-2 left-3 text-[#00ff88] text-[9px] font-mono tracking-widest flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]' : 'bg-red-600 shadow-[0_0_8px_red]'}`}></span> 
                  TUNER {band}
                </div>
                <div className="absolute top-2 right-3 text-[#00ff88] text-[9px] font-mono tracking-widest opacity-60">
                  VOL: {Math.round(volume * 10)}
                </div>

                <h1 className="text-[#00ff88] font-mono text-4xl md:text-5xl font-black tracking-tight drop-shadow-[0_0_15px_rgba(0,255,136,0.8)] mt-2">
                   {frequency.toFixed(1)} <span className="text-lg text-[#00ff88]/60">{BANDS[band].unit}</span>
                </h1>
                
                <p className="text-[#00ff88] font-mono text-xs opacity-80 mt-1 tracking-widest uppercase truncate max-w-[90%] text-center">
                  {error ? error : (currentStation ? currentStation.name : 'STATIC / NO SIGNAL')}
                </p>

                {isPlaying && currentStation && !error && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-1 h-5">
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                        <div key={i} className="w-[3px] bg-[#00ff88] rounded-t-sm shadow-[0_0_5px_#00ff88]" style={{ height: `${Math.random() * 100}%`, animation: `bounce ${0.2 + Math.random()}s infinite alternate` }}></div>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center px-1 md:px-4 gap-4">
            
            <form onSubmit={handleDirectFreqSubmit} className="flex bg-black/60 border border-gray-700 rounded-lg overflow-hidden shadow-inner h-10 w-full md:w-auto">
               <input 
                 type="number" step="0.1" 
                 placeholder="Enter Freq (92.7)" 
                 value={directFreqInput}
                 onChange={(e) => setDirectFreqInput(e.target.value)}
                 className="bg-transparent text-[#00ff88] font-mono px-3 outline-none text-xs w-full md:w-32 placeholder-gray-600" 
               />
               <button type="submit" className="bg-gray-800 text-xs px-4 font-bold text-gray-300 hover:text-[#00ff88] hover:bg-gray-700 transition">TUNE</button>
            </form>

            <div className="flex items-center justify-between w-full md:w-auto gap-3 md:gap-5">
                <button onClick={togglePower} className={`p-2.5 md:p-3 rounded-full border shadow-xl transition active:scale-95 ${isPowered ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-gray-800 border-gray-600 text-gray-400'}`}>
                   <Power className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                
                <div className="flex items-center gap-1.5 md:gap-3 bg-black/50 p-1.5 md:p-2 rounded-full border border-white/5">
                   <button onClick={() => seekStation(-1)} className="p-2 md:p-3 bg-gradient-to-b from-gray-700 to-gray-900 rounded-full border border-gray-600 shadow-xl active:scale-95"><SkipBack className="w-3 h-3 md:w-4 md:h-4 text-[#00ff88]" /></button>
                   <button onClick={() => manualTune(-1)} className="p-1.5 md:p-2 bg-gray-800 rounded-full active:scale-95 text-gray-400"><ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /></button>
                   
                   <button onClick={togglePlay} className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 shadow-[0_10px_20px_rgba(0,0,0,0.5)] active:scale-95 ${currentStation && isPowered ? 'bg-gradient-to-b from-[#00b865] to-green-900 border-green-950 text-white' : 'bg-gray-800 border-gray-900 text-gray-500'}`}>
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                   </button>
                   
                   <button onClick={() => manualTune(1)} className="p-1.5 md:p-2 bg-gray-800 rounded-full active:scale-95 text-gray-400"><ChevronRight className="w-4 h-4 md:w-5 md:h-5" /></button>
                   <button onClick={() => seekStation(1)} className="p-2 md:p-3 bg-gradient-to-b from-gray-700 to-gray-900 rounded-full border border-gray-600 shadow-xl active:scale-95"><SkipForward className="w-3 h-3 md:w-4 md:h-4 text-[#00ff88]" /></button>
                </div>

                <div className="flex flex-col gap-1 bg-black/40 p-1 rounded-full border border-white/5">
                  <button onClick={() => setVolume(Math.min(1, volume + 0.1))} className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 active:scale-95"><Volume2 className="w-3 h-3" /></button>
                  <button onClick={() => setVolume(Math.max(0, volume - 0.1))} className="p-1.5 bg-gray-800 rounded-full hover:bg-gray-700 active:scale-95"><VolumeX className="w-3 h-3" /></button>
                </div>
            </div>

          </div>
          {currentStation && isPowered && <audio ref={audioRef} src={currentStation.url_resolved || currentStation.url} preload="none" />}
        </div>
      </div>

      {/* 🌍 SMART GLOBAL SEARCH & CATEGORIES */}
      <div className="flex-1 overflow-y-auto pb-6">
        
        <div className="flex flex-col gap-3 mt-6 mx-4 md:mx-8">
          {/* Top Row: Country & Search */}
          <div className="flex flex-col md:flex-row gap-3">
             <div className="flex items-center gap-2 bg-[#1a1c20] px-3 py-2 rounded-xl border border-white/5 shadow-inner flex-shrink-0">
               <Globe className="w-5 h-5 text-[#00b865]" />
               <select 
                 value={country} 
                 onChange={(e) => { setCountry(e.target.value); setSearchQuery(''); setActiveSearch(''); setGenre('All'); }}
                 className="bg-transparent text-white font-bold outline-none cursor-pointer text-sm pr-4"
               >
                 {COUNTRIES.map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
               </select>
             </div>
             
             <div className="flex items-center gap-2 bg-[#1a1c20] px-4 py-2 rounded-xl border border-white/5 shadow-inner flex-1">
               <Search className="w-4 h-4 text-gray-500" />
               <input 
                  type="text" 
                  placeholder="Search Global City, State, or Station (e.g. Kashmir, 92.7, BBC)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter') setActiveSearch(searchQuery); }}
                  className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
               />
               <button 
                  onClick={() => setActiveSearch(searchQuery)}
                  className="bg-[#00b865]/20 text-[#00b865] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#00b865] hover:text-black transition"
               >
                  SCAN
               </button>
             </div>
          </div>

          {/* Bottom Row: Genres */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
             {GENRES.map(g => (
                <button 
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${genre === g ? 'bg-[#00b865] text-black border-[#00b865]' : 'bg-[#1a1c20] text-gray-400 border-white/10 hover:text-white'}`}
                >
                  {g}
                </button>
             ))}
          </div>
        </div>

        {/* 📻 HORIZONTALLY SCROLLING STATIONS LIST */}
        <div className="px-4 md:px-8 mt-4">
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">
             {activeSearch ? `Results for "${activeSearch}"` : `Top Stations in ${country}`} • {genre}
          </h3>
          
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
               {[1,2,3,4,5].map(i => <div key={i} className="w-36 h-44 bg-white/5 rounded-2xl animate-pulse shrink-0"></div>)}
            </div>
          ) : (
            <>
              <div className="flex gap-4 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x">
                {stations.map((st, idx) => (
                  <button
                    key={idx}
                    onClick={() => directPlayFromList(st)}
                    className={`snap-center shrink-0 w-36 flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all text-center group hover:-translate-y-2 ${currentStation?.stationuuid === st.stationuuid && isPowered ? 'bg-gradient-to-b from-[#00b865]/20 to-[#00b865]/5 border-[#00b865] shadow-[0_10px_20px_rgba(0,184,101,0.2)]' : 'bg-[#1a1c20] border-white/5 hover:border-white/20'}`}
                  >
                    <div className="w-16 h-16 rounded-full bg-black/40 border-2 border-white/10 flex items-center justify-center p-2 shadow-inner group-hover:border-[#00b865]/50 transition-colors">
                      {st.favicon ? (
                        <img src={st.favicon} alt="logo" className="w-full h-full object-contain rounded-full bg-white/5" onError={(e) => e.currentTarget.style.display='none'} />
                      ) : (
                        <Radio className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex flex-col w-full">
                      <span className={`text-sm font-bold truncate ${currentStation?.stationuuid === st.stationuuid && isPowered ? 'text-[#00ff88]' : 'text-gray-200'}`}>
                        {st.name}
                      </span>
                      <span className="text-[10px] bg-black/40 border border-white/5 rounded-md px-2 py-1 mt-2 font-mono text-gray-400 shadow-inner">
                        {st.mappedBand} {st.mappedFreq}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {stations.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-10">
                    <Activity className="w-10 h-10 text-gray-600 mb-3" />
                    <p className="text-gray-500 text-sm">No working stations found. Try another search or genre.</p>
                 </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes bounce {
          0% { transform: scaleY(0.2); opacity: 0.5; }
          100% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default RadioView;