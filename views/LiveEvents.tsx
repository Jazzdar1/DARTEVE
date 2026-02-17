
import React, { useState } from 'react';
import { Match } from '../types';
import EventCard from '../components/EventCard';
import { CircleCheck, Trophy } from 'lucide-react';

interface LiveEventsProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
}

const LiveEvents: React.FC<LiveEventsProps> = ({ matches, onSelectMatch }) => {
  const [filter, setFilter] = useState<'All' | 'Football' | 'Cricket'>('All');
  const [status, setStatus] = useState<'All' | 'Live' | 'Upcoming' | 'Ended'>('All');

  const filteredMatches = matches.filter(m => {
    const filterMatch = filter === 'All' || m.sport === filter;
    const statusMatch = status === 'All' || m.status === status;
    return filterMatch && statusMatch;
  });

  const totalCount = matches.length;
  const footballCount = matches.filter(m => m.sport === 'Football').length;
  const cricketCount = matches.filter(m => m.sport === 'Cricket').length;

  const liveCount = matches.filter(m => m.status === 'Live').length;
  const upcomingCount = matches.filter(m => m.status === 'Upcoming').length;
  const endedCount = matches.filter(m => m.status === 'Ended').length;

  return (
    <div className="p-4 md:p-8 flex flex-col h-full bg-[#0f1115]">
      {/* Marquee Banner */}
      <div className="relative border border-green-500/50 rounded-full py-2 px-6 mb-8 overflow-hidden bg-black/40">
        <div className="whitespace-nowrap flex gap-12 animate-marquee">
          <span className="text-[11px] md:text-xs font-bold text-white flex items-center gap-3">
            <Trophy className="w-4 h-4 text-yellow-500" /> EURO 2024 & T20 World Cup Super 8s are LIVE! 
            <span className="text-gray-500 text-[10px] font-normal italic">Powered by Gemini AI Link Discovery</span>
          </span>
          <span className="text-[11px] md:text-xs font-bold text-white flex items-center gap-3">
            <Trophy className="w-4 h-4 text-yellow-500" /> Tap any match to find multi-server mirrors.
          </span>
        </div>
      </div>

      {/* Top Sport Filters */}
      <div className="flex gap-6 md:gap-10 justify-start mb-8 px-2 overflow-x-auto scrollbar-hide">
        {[
          { 
            label: 'All Streams', 
            key: 'All', 
            count: totalCount,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v4l2 2" />
                <path d="M12 4a8 8 0 0 1 8 8" strokeDasharray="2 2" />
              </svg>
            )
          },
          { 
            label: 'Soccer', 
            key: 'Football', 
            count: footballCount,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                <circle cx="12" cy="12" r="6" />
                <path d="M12 12l2 2M12 12l-2-2M12 12v-4M12 12h4" />
                <path d="M4 20l2-2 1 3" strokeLinecap="round" />
              </svg>
            )
          },
          { 
            label: 'Cricket', 
            key: 'Cricket', 
            count: cricketCount,
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M8 4v16M12 4v16M16 4v16" />
                <path d="M6 18h12" />
                <circle cx="12" cy="10" r="2" />
              </svg>
            )
          },
        ].map(item => (
          <button 
            key={item.key}
            onClick={() => setFilter(item.key as any)}
            className={`flex flex-col items-center gap-2 group transition-all shrink-0 ${filter === item.key ? 'text-green-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-[2rem] border-2 flex items-center justify-center transition-all duration-300 ${filter === item.key ? 'border-green-500 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'border-gray-800 bg-[#1a1d23]'}`}>
              {item.icon}
              <div className="absolute -top-1 -right-1 bg-red-600 border border-white/20 text-[10px] font-black text-white min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1.5 shadow-xl">
                {item.count}
              </div>
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Pill Filters */}
      <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide">
        {[
          { label: 'Show All', count: totalCount, key: 'All' },
          { label: 'Live Events', count: liveCount, key: 'Live' },
          { label: 'Coming Soon', count: upcomingCount, key: 'Upcoming' },
          { label: 'Results', count: endedCount, key: 'Ended' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setStatus(s.key as any)}
            className={`px-6 py-2.5 rounded-2xl text-[12px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${status === s.key ? 'bg-white text-black border-white shadow-xl scale-105' : 'bg-[#1a1d23] border-gray-800 text-gray-500 hover:border-gray-600'}`}
          >
            <div className="flex items-center gap-3">
              {status === s.key && <CircleCheck className="w-4 h-4" />}
              {s.label} <span className="opacity-50 text-[10px] ml-1">{s.count}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
        {filteredMatches.map(match => (
          <EventCard key={match.id} match={match} onClick={() => onSelectMatch(match)} />
        ))}
        {filteredMatches.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-40 text-gray-500">
             <span className="text-sm font-black uppercase tracking-[8px] opacity-10">Empty Feed</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveEvents;
