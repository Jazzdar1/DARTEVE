
import React from 'react';
import { Match } from '../types';
import { X, Maximize2 } from 'lucide-react';

interface FloatingPlayerProps {
  match: Match;
  onExpand: () => void;
  onClose: () => void;
}

const FloatingPlayer: React.FC<FloatingPlayerProps> = ({ match, onExpand, onClose }) => {
  return (
    <div className="fixed bottom-24 right-4 w-48 aspect-video bg-[#1a1d23] border border-green-500/50 rounded-xl shadow-2xl z-[55] overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="relative w-full h-full group">
        <img 
          src="https://images.unsplash.com/photo-1540747913346-19e3adbb17c1?auto=format&fit=crop&q=80&w=400" 
          className="w-full h-full object-cover opacity-70"
          alt="PIP Player"
        />
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
           <button onClick={onExpand} className="p-1.5 bg-black/60 rounded-full hover:text-green-400">
              <Maximize2 className="w-4 h-4 text-white" />
           </button>
           <button onClick={onClose} className="p-1.5 bg-black/60 rounded-full hover:text-red-400">
              <X className="w-4 h-4 text-white" />
           </button>
        </div>

        {/* Live Badge */}
        <div className="absolute top-2 left-2 flex items-center bg-red-600 px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-widest pointer-events-none">
          LIVE
        </div>

        {/* Info Label */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
          <p className="text-[9px] font-bold text-white truncate">{match.team1} vs {match.team2}</p>
        </div>
      </div>
    </div>
  );
};

export default FloatingPlayer;
