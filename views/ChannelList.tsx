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

  // 🔥 THE CRASH FIX: String(ch.name || '') lagaya taake app kabhi Black Screen na de!
  const filtered = channels.filter(ch => 
    String(ch.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#2E8B57]/20 border-t-[#2E8B57] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Tv className="w-6 h-6 text-[#2E8B57] animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em] animate-pulse">
          Fetching Channels...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-28 max-w-[1600px] mx-auto min-h-screen">
      
      {/* 🌟 Premium Header & Search Bar */}
      <div className="relative mb-8 max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input 
          type="text" 
          placeholder={`Search in ${category?.name || 'Live TV'}...`}
          className="w-full bg-[#1a1d24]/80 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2E8B57]/50 focus:border-[#2E8B57] transition-all shadow-2xl"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#2E8B57]/20 text-[#2E8B57] px-3 py-1 rounded-lg text-xs font-bold">
          {filtered.length} CH
        </div>
      </div>

      {/* 📺 VIP Channel Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
          {filtered.map((channel) => (
            <button 
              key={channel.id}
              onClick={() => onSelectChannel(channel)}
              className="relative flex flex-col items-center gap-3 p-5 bg-gradient-to-b from-[#1a1d24] to-[#121419] border border-white/5 rounded-3xl hover:border-[#2E8B57]/50 hover:shadow-[0_0_30px_rgba(46,139,87,0.15)] hover:-translate-y-1 transition-all duration-300 text-center group overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-black/40 p-3 flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                 <img 
                   src={channel.logo} 
                   alt={channel.name} 
                   className="w-full h-full object-contain drop-shadow-lg" 
                   onError={(e) => {
                     e.currentTarget.onerror = null; 
                     e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name || 'TV')}&background=2E8B57&color=fff&rounded=true&bold=true`;
                   }} 
                 />
                 <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full border-2 border-[#1a1d24] animate-pulse">
                   LIVE
                 </div>
              </div>
              
              <div className="flex flex-col w-full items-center mt-2 z-10">
                <span className="text-sm font-bold text-gray-200 line-clamp-2 w-full leading-tight group-hover:text-white transition-colors">
                  {channel.name}
                </span>
              </div>
              
              <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#2E8B57] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Activity className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Koi channel nahi mila</p>
        </div>
      )}
    </div>
  );
};

export default ChannelListView;