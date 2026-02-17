import React, { useState } from 'react';
import { Menu, Share2, Star, RefreshCw, Search, ArrowLeft, X } from 'lucide-react';

interface HeaderProps {
  title: string;
  onOpenSidebar: () => void;
  showBack?: boolean;
  onBack?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, onOpenSidebar, showBack, onBack, searchQuery, onSearchChange }) => {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <header className="bg-[#12141a] px-4 py-3 flex items-center justify-between sticky top-0 z-50 border-b border-gray-800/50 min-h-[60px]">
      
      {/* Search Input Mode */}
      {isSearching ? (
        <div className="flex-1 flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-200">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            autoFocus
            type="text"
            placeholder="Search all channels globally..."
            className="flex-1 bg-transparent border-none text-white focus:outline-none text-sm font-medium placeholder-gray-600"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
          <button 
            onClick={() => { setIsSearching(false); onSearchChange && onSearchChange(''); }}
            className="p-1 hover:bg-gray-800 rounded-full transition text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      ) : (
        /* Normal Header Mode */
        <>
          <div className="flex items-center gap-4 md:gap-5 flex-1 min-w-0">
            {showBack ? (
              <button onClick={onBack} className="p-1 hover:bg-gray-800 rounded-full transition text-white shrink-0">
                <ArrowLeft className="w-6 h-6" />
              </button>
            ) : (
              <button onClick={onOpenSidebar} className="p-1 hover:bg-gray-800 rounded-full transition text-gray-200 shrink-0">
                <Menu className="w-7 h-7" />
              </button>
            )}
            <h1 className="text-lg md:text-[22px] font-bold text-white tracking-tight leading-none truncate">{title}</h1>
          </div>
          
          <div className="flex items-center gap-4 text-gray-200 shrink-0 ml-4">
            <Share2 className="w-5 h-5 cursor-pointer opacity-80 hover:opacity-100 hidden sm:block" />
            <RefreshCw className="w-5 h-5 cursor-pointer opacity-80 hover:opacity-100 hidden sm:block" />
            <button onClick={() => setIsSearching(true)} className="p-1.5 hover:bg-gray-800 rounded-full transition">
               <Search className="w-5 h-5 cursor-pointer opacity-80 hover:opacity-100" />
            </button>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;