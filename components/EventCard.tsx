
import React from 'react';
import { Match } from '../types';

interface EventCardProps {
  match: Match;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ match, onClick }) => {
  return (
    <div 
      className="relative bg-[#1a1d23] border border-white/5 rounded-[2.5rem] overflow-hidden cursor-pointer hover:scale-[1.03] md:hover:scale-[1.05] transition-all duration-300 shadow-2xl group"
      onClick={onClick}
    >
      {/* Hot Ribbon */}
      {match.isHot && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-red-600 text-[9px] font-black text-white px-6 py-2 transform rotate-45 translate-x-4 -translate-y-1 uppercase shadow-2xl flex items-center justify-center min-w-[100px] border-b border-white/20">
            Hot Feed
          </div>
        </div>
      )}

      {/* League Header */}
      <div className="px-6 pt-6 pb-2">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/5 rounded-full px-4 py-1.5 backdrop-blur-md">
          <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center shadow-inner">
             <img src={match.team1Logo} alt="" className="w-full h-full object-cover scale-150" />
          </div>
          <span className="text-white text-[10px] font-black uppercase tracking-widest">
            {match.sport} | {match.league}
          </span>
        </div>
      </div>

      <div className="flex flex-col p-6 gap-6">
        {/* Teams Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between group/team">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform group-hover/team:scale-110 p-2 bg-white flex items-center justify-center">
                 <img src={match.team1Logo} className="w-full h-full object-contain" alt="" />
              </div>
              <span className="font-black text-sm text-gray-100 uppercase tracking-tight">{match.team1}</span>
            </div>
          </div>
          <div className="flex items-center justify-between group/team">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform group-hover/team:scale-110 p-2 bg-white flex items-center justify-center">
                 <img src={match.team2Logo} className="w-full h-full object-contain" alt="" />
              </div>
              <span className="font-black text-sm text-gray-100 uppercase tracking-tight">{match.team2}</span>
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="flex items-center justify-between border-t border-white/5 pt-5">
          <div className="flex items-center gap-4">
             {match.status === 'Live' ? (
               <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-ping absolute inset-0" />
                    <div className="w-3 h-3 bg-red-600 rounded-full relative" />
                  </div>
                  <span className="text-xs font-mono font-black text-red-500 uppercase tracking-widest">{match.time}</span>
               </div>
             ) : (
               <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Scheduled</span>
                  <span className="text-xs font-black text-green-500 mt-0.5">{match.time}</span>
               </div>
             )}
          </div>
          
          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[2px] transition-colors ${match.status === 'Live' ? 'bg-green-500 text-black shadow-[0_5px_15px_rgba(34,197,94,0.4)]' : 'bg-white/5 text-gray-500 border border-white/5'}`}>
            {match.status === 'Live' ? 'Watch Now' : 'Upcoming'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
