import React, { useState, useEffect, useMemo } from 'react';
import { Match } from '../types';
import { Check, Trophy, Target, Globe, Activity, Circle, Gamepad2, Lock, Car, Flag } from 'lucide-react';

interface LiveEventsProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
}

const LiveEventsView: React.FC<LiveEventsProps> = ({ matches, onSelectMatch }) => {
  const [now, setNow] = useState(Date.now());
  const [activeSport, setActiveSport] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { filteredMatches, counts, sportsList } = useMemo(() => {
    const st = { all: 0, live: 0, recent: 0, upcoming: 0 };
    const sportsCounts: Record<string, number> = { All: 0, Football: 0, Cricket: 0, Baseball: 0, 'Formula 1': 0, Basketball: 0, Boxing: 0, Other: 0 };
    
    const processed: any[] = [];

    matches.forEach(match => {
      let status = String(match.status).toUpperCase();
      let sport = String(match.sport || 'Other').toUpperCase();
      let cleanSport = 'Other';

      if (sport.includes('CRICKET')) cleanSport = 'Cricket';
      else if (sport.includes('FOOTBALL') || sport.includes('SOCCER')) cleanSport = 'Football';
      else if (sport.includes('BASEBALL')) cleanSport = 'Baseball';
      else if (sport.includes('FORMULA 1') || sport.includes('F1') || sport.includes('RACING')) cleanSport = 'Formula 1';
      else if (sport.includes('BASKETBALL')) cleanSport = 'Basketball';
      else if (sport.includes('BOXING') || sport.includes('WWE') || sport.includes('WRESTLING')) cleanSport = 'Boxing';

      let targetTime = 0;
      const timeNum = Number(match.time);
      if (!isNaN(timeNum) && timeNum > 0) {
        targetTime = timeNum < 10000000000 ? timeNum * 1000 : timeNum;
      }

      let finalStatus = 'Live';
      if (status === 'COMPLETED' || status === 'ENDED' || status === 'RECENT') {
          finalStatus = 'Recent';
      } else if (status === 'UPCOMING') {
          finalStatus = 'Upcoming';
      }

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

  const formatTime = (ts: number) => {
    if (!ts) return "";
    const diff = Math.max(0, ts - now);
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    return h > 0 ? `${String(h).padStart(2, '0')}:${m}:${s}` : `${m}:${s}`;
  };

  const getSportIcon = (sportName: string) => {
    switch(sportName) {
      case 'All': return <Globe className="w-7 h-7 text-white" strokeWidth={1.5} />;
      case 'Football': return <Circle className="w-7 h-7 text-white border-dashed border-2 rounded-full" strokeWidth={1.5} />;
      case 'Cricket': return <Trophy className="w-7 h-7 text-white" strokeWidth={1.5} />;
      case 'Baseball': return <Target className="w-7 h-7 text-white" strokeWidth={1.5} />;
      case 'Formula 1': return <Car className="w-7 h-7 text-white" strokeWidth={1.5} />;
      case 'Basketball': return <Activity className="w-7 h-7 text-white" strokeWidth={1.5} />;
      default: return <Gamepad2 className="w-7 h-7 text-white" strokeWidth={1.5} />;
    }
  };

  const displaySports = ['All', 'Football', 'Cricket', 'Baseball', 'Formula 1', 'Basketball', 'Boxing'];

  return (
    <div className="bg-[#0a0c10] min-h-screen pb-24 font-sans select-none">
      
      {/* 🌟 1. SCROLLING LOCK BANNER (DarTV Name Fixed) */}
      <div className="px-3 pt-3 mb-5">
        <div className="border border-[#00b865]/60 rounded-full px-3 py-1.5 bg-[#121418] flex items-center shadow-md">
          <Lock className="w-3.5 h-3.5 text-[#e1b12c] mr-2 shrink-0" />
          <marquee className="text-[12px] font-semibold text-gray-200 tracking-wide" scrollamount="4">
            use latest version always Tap here 🌟🌟 Welcome to DarTV. Stay tuned for the best live sports experience!
          </marquee>
        </div>
      </div>

      {/* ⚽ 2. SPORT CIRCLES WITH RED BADGES */}
      <div className="flex gap-4 px-4 overflow-x-auto scrollbar-hide mb-6 pb-2">
        {displaySports.map(sport => {
           if (sport !== 'All' && sportsList[sport] === 0) return null; 
           const countStr = sportsList[sport] > 99 ? '99+' : sportsList[sport];
           const isActive = activeSport === sport;
           
           return (
            <div 
              key={sport} 
              onClick={() => { setActiveSport(sport); setActiveStatus('All'); }}
              className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0"
            >
              <div className={`relative flex items-center justify-center w-[60px] h-[60px] rounded-full border-2 transition-all ${isActive ? 'border-[#00b865] bg-[#00b865]/10' : 'border-gray-600 bg-[#121418]'}`}>
                {/* Red Notification Badge */}
                <div className="absolute -top-1.5 -right-1.5 bg-[#ff4757] border-2 border-[#0a0c10] rounded-full min-w-[22px] h-[22px] flex items-center justify-center text-[9px] font-black text-white px-1 z-10">
                  {countStr}
                </div>
                {getSportIcon(sport)}
              </div>
              <span className={`text-[10px] font-bold tracking-wider ${isActive ? 'text-white' : 'text-gray-400'}`}>{sport}</span>
            </div>
           );
        })}
      </div>

      {/* 🏷️ 3. WHITE CHECK FILTER PILLS */}
      <div className="flex gap-2.5 px-3 overflow-x-auto scrollbar-hide mb-5 pb-3">
        {[
          { id: 'All', label: 'All', count: counts.all },
          { id: 'Live', label: 'Live', count: counts.live },
          { id: 'Upcoming', label: 'Upcoming', count: counts.upcoming },
          { id: 'Recent', label: 'Ended', count: counts.recent }
        ].map(filter => {
          const isActive = activeStatus === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setActiveStatus(filter.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border transition-all whitespace-nowrap text-[13px] font-semibold ${isActive ? 'border-white bg-[#1a1c24] text-white' : 'border-gray-700 text-gray-400 bg-transparent'}`}
            >
              {isActive && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
              <span>{filter.label} ({filter.count})</span>
            </button>
          )
        })}
      </div>

      {/* 🏏 4. STACKED MATCH CARDS */}
      <div className="px-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match, idx) => {
            const isLive = match.finalStatus === 'Live';
            const isRecent = match.finalStatus === 'Recent';
            const isUpcoming = match.finalStatus === 'Upcoming';
            
            return (
              <button 
                key={`${match.id}-${idx}`}
                onClick={() => onSelectMatch(match)}
                className="w-full relative flex flex-col bg-[#121418] border border-[#00b865] rounded-2xl overflow-hidden hover:bg-[#1a1c24] transition-colors text-left shadow-lg mb-1"
              >
                {match.isHot && (
                  <div className="absolute top-3 -right-8 bg-red-600 text-white text-[10px] font-black py-0.5 w-[110px] text-center rotate-45 shadow-md uppercase tracking-wider z-10">
                    Hot
                  </div>
                )}

                <div className="flex justify-center items-center py-2 bg-black/30 border-b border-white/5">
                  <span className="text-[11.5px] font-semibold text-gray-200 tracking-wide pr-4 pl-2">
                    🏏 {match.cleanSport} | {match.league}
                  </span>
                </div>

                <div className="flex flex-row items-center justify-between p-3.5">
                  <div className="flex flex-col gap-3.5 w-[48%]">
                    <div className="flex items-center gap-2.5">
                      <img src={match.team1Logo} className="w-5 h-5 rounded-full object-contain bg-white/10 p-0.5" onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team1)}&background=1e2024&color=fff`} />
                      <span className="text-[13px] font-semibold text-white truncate">{match.team1}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <img src={match.team2Logo} className="w-5 h-5 rounded-full object-contain bg-white/10 p-0.5" onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team2)}&background=1e2024&color=fff`} />
                      <span className="text-[13px] font-semibold text-white truncate">{match.team2}</span>
                    </div>
                  </div>

                  <div className="w-[20%] flex justify-center">
                    {isLive ? (
                       <div className="bg-[#ff4757]/10 border border-[#ff4757] rounded px-2.5 py-0.5 flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,71,87,0.2)]">
                          <Circle className="w-2 h-2 text-[#ff4757] fill-[#ff4757] animate-pulse" />
                          <span className="text-[10px] font-black text-[#ff4757] uppercase tracking-wider">Live</span>
                       </div>
                    ) : (
                       <div className="bg-gray-600/20 border border-gray-500 rounded px-2.5 py-0.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{isRecent ? 'Ended' : 'Soon'}</span>
                       </div>
                    )}
                  </div>

                  <div className="w-[32%] text-right pr-2">
                    {isLive ? (
                        <span className="text-[13px] font-bold text-gray-300 tracking-wider font-mono">
                            {formatTime(match.parsedTime) || "00:00:00"}
                        </span>
                    ) : isUpcoming ? (
                        <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[11px] font-bold text-[#00b865]">{formatTime(match.parsedTime)}</span>
                        </div>
                    ) : (
                        <span className="text-[11px] font-semibold text-gray-500">Completed</span>
                    )}
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