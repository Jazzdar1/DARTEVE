import React from 'react';
import { Tv, LayoutGrid, Radio, Film } from 'lucide-react';

interface BottomNavProps {
  activeView: 'live-events' | 'categories' | 'radio' | 'movies' | any;
  onViewChange: (view: 'live-events' | 'categories' | 'radio' | 'movies' | any) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur-md border-t border-white/10 md:hidden z-40 pb-safe">
      <div className="flex justify-around items-center h-16">
        <button onClick={() => onViewChange('live-events')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeView === 'live-events' ? 'text-[#00b865]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Tv size={20} className={activeView === 'live-events' ? 'animate-pulse' : ''} />
          <span className="text-[10px] font-bold">Live TV</span>
        </button>
        <button onClick={() => onViewChange('categories')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeView === 'categories' ? 'text-[#00b865]' : 'text-gray-500 hover:text-gray-300'}`}>
          <LayoutGrid size={20} />
          <span className="text-[10px] font-bold">Playlists</span>
        </button>
        {/* 🎬 NAYA MOVIES TAB YAHAN HAI */}
        <button onClick={() => onViewChange('movies')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeView === 'movies' ? 'text-[#00b865]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Film size={20} />
          <span className="text-[10px] font-bold">Movies</span>
        </button>
        <button onClick={() => onViewChange('radio')} className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeView === 'radio' ? 'text-[#00b865]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Radio size={20} />
          <span className="text-[10px] font-bold">FM Radio</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;