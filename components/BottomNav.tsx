
import React from 'react';
import { View } from '../types';
import { Radio, MonitorPlay } from 'lucide-react';

interface BottomNavProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0f1115] border-t border-gray-800/50 flex justify-around items-center pt-2 pb-5 z-50 md:hidden">
      <button 
        className={`flex flex-col items-center gap-1 p-2 flex-1 transition-all ${activeView === 'live-events' ? 'text-green-500' : 'text-gray-500'}`}
        onClick={() => onViewChange('live-events')}
      >
        <Radio className={`w-7 h-7 ${activeView === 'live-events' ? 'animate-pulse' : ''}`} />
        <span className="text-[11px] font-bold">Live Events</span>
      </button>
      <button 
        className={`flex flex-col items-center gap-1 p-2 flex-1 transition-all ${activeView === 'categories' || activeView === 'channel-detail' ? 'text-green-500' : 'text-gray-500'}`}
        onClick={() => onViewChange('categories')}
      >
        <MonitorPlay className="w-7 h-7" />
        <span className="text-[11px] font-bold">Categories</span>
      </button>
    </nav>
  );
};

export default BottomNav;
