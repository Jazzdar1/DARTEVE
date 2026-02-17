import React from 'react';
import { X, Tv2, Radio, ListVideo, Shield, Info, MessageCircle } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  onNavigate: (view: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeView, onNavigate }) => {
  
  // Yeh function screen change karega aur mobile par menu ko auto-close kar dega
  const handleLink = (view: string) => {
      onNavigate(view);
      onClose(); 
  };

  return (
    <>
      {/* Mobile Dark Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden" onClick={onClose} />
      )}

      {/* Main Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#12141a] border-r border-white/5 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex-shrink-0 flex flex-col`}>
        
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 h-[60px] shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/10 p-2 rounded-lg border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <Tv2 className="w-5 h-5 text-green-500" />
            </div>
            <h1 className="text-white font-black tracking-[0.2em] text-[15px]">DAR TEVE</h1>
          </div>
          <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 scrollbar-hide">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-2">Main Menu</p>
          
          {/* Live Sports Button */}
          <button 
            onClick={() => handleLink('live-events')}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeView === 'live-events' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
          >
            <Radio className="w-5 h-5" /> Live Sports
          </button>

          {/* Playlists Button */}
          <button 
            onClick={() => handleLink('categories')}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeView === 'categories' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
          >
            <ListVideo className="w-5 h-5" /> All Playlists
          </button>

          <div className="my-4 border-t border-white/5" />
          
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 px-2">Information</p>

          {/* Privacy Policy Button */}
          <button 
            onClick={() => handleLink('privacy')}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeView === 'privacy' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
          >
            <Shield className="w-5 h-5" /> Privacy Policy
          </button>
          
          {/* About App Button */}
          <button 
            onClick={() => handleLink('about')}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeView === 'about' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
          >
            <Info className="w-5 h-5" /> About App
          </button>

        </div>

        {/* Footer Area */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <button className="flex items-center justify-center gap-2 w-full py-3 bg-[#1a1d23] hover:bg-[#252a33] text-gray-300 rounded-xl font-bold text-xs transition border border-white/5 shadow-lg">
            <MessageCircle size={16} /> Join Telegram
          </button>
          <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-4">Version 2.0 • Pro Edition</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;