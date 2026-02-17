
import React from 'react';
import { 
  X, List, Radio, Maximize, Settings, Trophy, 
  Send, Globe, Mail, Share2, Shield, LogOut 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: <List className="w-5 h-5" />, label: 'All Playlists' },
    { icon: <Radio className="w-5 h-5" />, label: 'Network Streams' },
    { icon: <Maximize className="w-5 h-5" />, label: 'PiP Controls' },
    { icon: <Settings className="w-5 h-5" />, label: 'Data Saver' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Live Scores' },
    { icon: <Send className="w-5 h-5" />, label: 'Join Telegram' },
    { icon: <Globe className="w-5 h-5" />, label: 'CricPK Web' },
    { icon: <Mail className="w-5 h-5" />, label: 'Report Issue' },
    { icon: <Share2 className="w-5 h-5" />, label: 'Share with Friends' },
    { icon: <Shield className="w-5 h-5" />, label: 'DMCA Policy' },
    { icon: <LogOut className="w-5 h-5" />, label: 'Exit Application' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer Container */}
      <div 
        className={`fixed md:relative left-0 top-0 h-full w-72 bg-[#1a1d23] z-[70] md:z-auto border-r border-white/5 transform transition-transform duration-300 shadow-2xl md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 border-b border-gray-800 flex flex-col items-center gap-4 bg-[#252a33]">
           <div className="w-24 h-24 bg-green-500 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-[0_10px_30px_rgba(34,197,94,0.3)]">
             C<span className="text-2xl mt-1">PK</span>
           </div>
           <div className="text-center">
             <h3 className="text-white font-black uppercase tracking-[4px] text-xs">CricPK Pro</h3>
             <p className="text-gray-500 text-[9px] font-bold mt-1">v4.2.0 Desktop Ready</p>
           </div>
        </div>
        
        <div className="p-3 overflow-y-auto h-[calc(100vh-180px)] scrollbar-hide">
          <div className="space-y-1">
            {menuItems.map((item, idx) => (
              <button 
                key={idx} 
                className="w-full flex items-center gap-4 px-5 py-4 text-gray-400 hover:bg-white/5 hover:text-green-500 transition-all rounded-2xl group text-left"
                onClick={() => { if (window.innerWidth < 768) onClose(); }}
              >
                <span className="transition-transform group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-6 left-6 right-6 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
           <p className="text-[9px] font-black text-green-500/60 uppercase text-center tracking-widest">Premium Active</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
