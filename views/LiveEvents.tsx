import React, { useState, useEffect, useMemo } from 'react';
import { Match } from '../types';
import { Check, Dribbble, Target, Trophy, Globe, Activity, Circle, Gamepad2 } from 'lucide-react';

interface LiveEventsProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
}

const LiveEventsView: React.FC<LiveEventsProps> = ({ matches, onSelectMatch }) => {
  const [now, setNow] = useState(Date.now());
  const [activeSport, setActiveSport] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All'); // All, Live, Recent, Upcoming

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 🧠 PARSER: Categorize matches strictly according to App.tsx
  const { filteredMatches, counts, sportsList } = useMemo(() => {
    const st = { all: 0, live: 0, recent: 0, upcoming: 0 };
    const sportsCounts: Record<string, number> = { All: 0, Cricket: 0, Football: 0, Basketball: 0, Boxing: 0, Other: 0 };
    
    const processed: any[] = [];

    matches.forEach(match => {
      let status = String(match.status).toUpperCase();
      let sport = String(match.sport || 'Other').toUpperCase();
      let cleanSport = 'Other';

      if (sport.includes('CRICKET')) cleanSport = 'Cricket';
      else if (sport.includes('FOOTBALL') || sport.includes('SOCCER')) cleanSport = 'Football';
      else if (sport.includes('BASKETBALL')) cleanSport = 'Basketball';
      else if (sport.includes('BOXING') || sport.includes('WWE') || sport.includes('WRESTLING')) cleanSport = 'Boxing';

      let targetTime = 0;
      const timeNum = Number(match.time);
      if (!isNaN(timeNum) && timeNum > 0) {
        targetTime = timeNum < 10000000000 ? timeNum * 1000 : timeNum;
      }

      // Determine Final Status strictly
      let finalStatus = 'Live';
      if (status === 'COMPLETED' || status === 'ENDED' || status === 'RECENT') {
          finalStatus = 'Recent';
      } else if (status === 'UPCOMING') {
          finalStatus = 'Upcoming';
      }

      // Update Counts
      sportsCounts.All++;
      sportsCounts[cleanSport] = (sportsCounts[cleanSport] || 0) + 1;
      
      if (activeSport === 'All' || activeSport === cleanSport) {
        st.all++;
        if (finalStatus === 'Live') st.live++;
        if (finalStatus === 'Recent') st.recent++;
        if (finalStatus === 'Upcoming') st.upcoming++;
      }

      const matchData = { ...match, parsedTime: targetTime, cleanSport, finalStatus };

      const sportMatch = activeSport === 'All' || activeSport === cleanSport;
      const statusMatch = activeStatus === 'All' || activeStatus === finalStatus;

      if (sportMatch && statusMatch) {
        processed.push(matchData);
      }
    });

    return { 
      filteredMatches: processed, 
      counts: st,
      sportsList: sportsCounts 
    };
  }, [matches, now, activeSport, activeStatus]);

  // 🕒 Formatting Helpers (Matches CRICfy format exactly)
  const formatTime = (ts: number) => {
    if (!ts) return "";
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(); // "01:30 am"
  };

  const formatDate = (ts: number) => {
    if (!ts) return "";
    const d = new Date(ts);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`; // "26/02/2026"
  };

  const getCountdown = (targetTime: number) => {
    if (!targetTime) return "";
    const diff = targetTime - now;
    if (diff <= 0) return "Starting Now...";
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    
    if (h > 0) return `Match Starting in ${h}:${m}:${s}`;
    return `Match Starting in ${m}:${s}`;
  };

  const getSportIcon = (sportName: string) => {
    switch(sportName) {
      case 'All': return <Globe className="w-8 h-8 text-white" strokeWidth={1.5} />;
      case 'Cricket': return <Trophy className="w-8 h-8 text-white" strokeWidth={1.5} />;
      case 'Football': return <Gamepad2 className="w-8 h-8 text-white" strokeWidth={1.5} />;
      case 'Basketball': return <Dribbble className="w-8 h-8 text-white" strokeWidth={1.5} />;
      case 'Boxing': return <Target className="w-8 h-8 text-white" strokeWidth={1.5} />;
      default: return <Activity className="w-8 h-8 text-white" strokeWidth={1.5} />;
    }
  };

  return (
    <div className="bg-[#121212] min-h-screen pb-24 font-sans select-none">
      
      {/* 🚀 CUSTOM DARTV BANNER */}
      <div className="px-4 pt-4 mb-4">
        <div className="border border-[#00b865] rounded-lg p-3 bg-[#1a1c20] flex items-center justify-center text-center shadow-lg">
          <span className="text-[12px] md:text-sm font-medium text-gray-200">
            Welcome to DarTV. We are always updating our database to serve you better. If you have any suggestion you can reach us on WhatsApp <span className="text-[#00b865] font-bold">7006686584</span>. Stay tuned, love you all!
          </span>
        </div>
      </div>

      {/* 🏀 SPORTS ICONS */}
      <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide mb-6">
        {['All', 'Cricket', 'Football', 'Boxing', 'Basketball'].map(sport => {
           if (sport !== 'All' && sportsList[sport] === 0) return null; 
           const countStr = sportsList[sport] > 99 ? '99+' : sportsList[sport];
           
           return (
            <button 
              key={sport}
              onClick={() => { setActiveSport(sport); setActiveStatus('All'); }}
              className={`relative flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all ${activeSport === sport ? 'bg-[#1a1c20] border-[#00b865]' : 'bg-transparent border-gray-600'}`}
            >
              <div className="absolute -top-2 -right-2 bg-red-600 border-2 border-[#121212] rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold text-white shadow-lg z-10">
                {countStr}
              </div>
              {getSportIcon(sport)}
            </button>
           );
        })}
      </div>

      {/* 🎯 STATUS FILTER PILLS */}
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide mb-6 border-b border-white/5 pb-3">
        {[
          { id: 'All', label: 'All', count: counts.all },
          { id: 'Live', label: 'Live', count: counts.live },
          { id: 'Recent', label: 'Recent', count: counts.recent },
          { id: 'Upcoming', label: 'Upcoming', count: counts.upcoming }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveStatus(filter.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border transition-all whitespace-nowrap ${activeStatus === filter.id ? 'border-[#00b865] bg-[#00b865]/10 text-white' : 'border-gray-600 text-gray-400 bg-transparent'}`}
          >
            {activeStatus === filter.id && <Check className="w-4 h-4 text-[#00b865]" />}
            <span className="text-sm font-medium">{filter.label} ({filter.count})</span>
          </button>
        ))}
      </div>

      {/* 📺 EXACT CRICFY MATCH CARDS GRID */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match, idx) => {
            const isLive = match.finalStatus === 'Live';
            const isRecent = match.finalStatus === 'Recent';
            const isUpcoming = match.finalStatus === 'Upcoming';
            
            return (
              <button 
                key={`${match.id}-${idx}`}
                onClick={() => onSelectMatch(match)}
                className="w-full flex flex-col bg-[#1e2024] border border-[#00b865] rounded-[16px] overflow-hidden hover:bg-[#25282d] transition-colors text-left"
              >
                {/* Header (Sport | League) */}
                <div className="flex justify-center items-center py-2 bg-black/40 border-b border-white/5 gap-2">
                  <Activity className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] font-medium text-gray-300 truncate px-2 tracking-wide">{match.cleanSport} | {match.league}</span>
                </div>

                {/* Match Info Body */}
                <div className="flex items-center justify-between p-5">
                  
                  {/* Team 1 */}
                  <div className="flex flex-col items-center gap-2 w-[30%]">
                    <img src={match.team1Logo} className="w-12 h-12 md:w-14 md:h-14 object-contain" onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team1)}&background=1e2024&color=fff`} />
                    <span className="text-[13px] md:text-sm font-semibold text-white text-center line-clamp-1">{match.team1}</span>
                  </div>

                  {/* Center Logic (Timers/Status) */}
                  <div className="flex flex-col items-center justify-center w-[40%] text-center">
                    
                    {isLive && (
                       <>
                         <div className="flex flex-col items-center justify-center gap-1 mb-2">
                            <Circle className="w-2 h-2 text-[#ff4757] fill-[#ff4757] animate-pulse" />
                            <span className="text-[11px] text-[#ff4757] font-medium">Live</span>
                         </div>
                         <span className="text-[13px] text-gray-300 font-medium">Watch Now</span>
                       </>
                    )}

                    {isRecent && (
                       <>
                         <span className="text-sm md:text-base font-bold text-white mb-1 tracking-wider">{formatTime(match.parsedTime) || match.time}</span>
                         <span className="text-xs font-semibold text-[#00b865] mb-1">{formatDate(match.parsedTime) || "Recently"}</span>
                         <span className="text-[11px] font-medium text-gray-400">Match Ended</span>
                       </>
                    )}

                    {isUpcoming && (
                       <>
                         <span className="text-sm md:text-base font-bold text-white mb-1 tracking-wider">{formatTime(match.parsedTime) || match.time}</span>
                         <span className="text-xs font-semibold text-[#00b865] mb-2">{formatDate(match.parsedTime) || "Upcoming"}</span>
                         <span className="text-[11px] font-medium text-gray-400">{getCountdown(match.parsedTime)}</span>
                       </>
                    )}

                  </div>

                  {/* Team 2 */}
                  <div className="flex flex-col items-center gap-2 w-[30%]">
                    <img src={match.team2Logo} className="w-12 h-12 md:w-14 md:h-14 object-contain" onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team2)}&background=1e2024&color=fff`} />
                    <span className="text-[13px] md:text-sm font-semibold text-white text-center line-clamp-1">{match.team2}</span>
                  </div>

                </div>
              </button>
            )
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-600">
            <Activity className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No matches found for selected filter</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default LiveEventsView;