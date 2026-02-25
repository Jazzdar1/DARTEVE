import React, { useState } from 'react';
import { Channel, Category } from '../types';
import { PlayCircle, Search, Tv, Activity } from 'lucide-react';

interface ChannelListViewProps {
  channels: Channel[];
  category: Category | null;
  loading: boolean;
  onBack: () => void;
  onSelectChannel: (channel: Channel) => void;
}

const ChannelListView: React.FC<ChannelListViewProps> = ({ channels, category, loading, onSelectChannel }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 🛡️ THE CRASH FIX: "String()" laga diya gaya hai taake Black Screen ka masla kabhi na ho
  const filtered = channels.filter(ch => 
    String(ch.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-8 h-8 border-4 border-[#00b865]/20 border-t-[#00b865] rounded-full animate-spin" />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Channels...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-24 max-w-7xl mx-auto">
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input 
          type="text" 
          placeholder={`Search in ${category?.name || 'playlist'}...`}
          className="w-full bg-[#1a1d23] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00b865]/50 transition-colors shadow-inner"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((channel) => (
            <button 
              key={channel.id}
              onClick={() => onSelectChannel(channel)}
              className="flex items-center gap-4 p-4 bg-[#1a1d23] border border-white/5 rounded-2xl hover:border-[#00b865]/50 hover:bg-[#252a33] transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 p-2 flex-shrink-0 shadow-inner">
                 <img 
                   src={channel.logo} 
                   alt="" 
                   className="w-full h-full object-contain" 
                   onError={(e) => {
                     e.currentTarget.onerror = null;
                     // Safe Fallback taake Image Error se crash na ho
                     e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(String(channel.name || 'TV'))}&background=random`;
                   }} 
                 />
              </div>
              <span className="text-sm font-bold text-gray-200 truncate flex-1">{channel.name}</span>
              <PlayCircle className="w-6 h-6 text-gray-600 group-hover:text-[#00b865] transition-colors" />
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600">
           <Activity className="w-12 h-12 mb-3 opacity-20" />
           <p className="text-sm font-medium">Koi channel nahi mila</p>
        </div>
      )}
    </div>
  );
};

export default ChannelListView;