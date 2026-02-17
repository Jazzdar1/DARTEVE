import React from 'react';
import { Category } from '../types';
import { CATEGORIES } from '../constants';
import { Globe, Star, Tv, Trophy, Music, Film, Newspaper, Heart } from 'lucide-react';

interface CategoriesViewProps {
  onSelectCategory: (category: Category) => void;
  favoritesCount: number; // NEW
}

const CategoriesView: React.FC<CategoriesViewProps> = ({ onSelectCategory, favoritesCount }) => {

  const getCategoryIcon = (cat: Category) => {
    const id = cat.id.toLowerCase();
    const name = cat.name.toLowerCase();

    if (id.includes('wc2026') || id.includes('worldcup') || name.includes('sports')) return <Trophy className="w-8 h-8 text-green-500" />;
    if (id.includes('reg-')) return <Globe className="w-8 h-8 text-blue-500" />;
    if (id.includes('movie') || name.includes('movie')) return <Film className="w-8 h-8 text-purple-500" />;
    if (id.includes('music')) return <Music className="w-8 h-8 text-pink-500" />;
    if (id.includes('news')) return <Newspaper className="w-8 h-8 text-red-500" />;
    if (id.includes('combined')) return <Star className="w-8 h-8 text-yellow-500" />;
    return <Tv className="w-8 h-8 text-gray-400" />;
  };

  const premium = CATEGORIES.filter(c => c.id.includes('combined') || c.id.includes('wc2026') || c.id.includes('worldcup'));
  const content = CATEGORIES.filter(c => c.id.startsWith('cat-') && !premium.includes(c));
  const regions = CATEGORIES.filter(c => c.id.startsWith('reg-'));

  const CategorySection = ({ title, items }: { title: string, items: Category[] }) => {
    if (!items.length) return null;
    return (
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-white font-black uppercase tracking-[3px] text-sm mb-4 px-3 border-l-4 border-green-500">
            {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
          {items.map((cat) => (
            <button key={cat.id} onClick={() => onSelectCategory(cat)} className="bg-[#1a1d23] border border-white/5 p-5 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-green-500/50 hover:bg-[#252a33] hover:scale-[1.03] transition-all duration-300 shadow-xl group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="bg-[#0f1115] p-4 rounded-full border border-white/5 shadow-inner group-hover:shadow-green-500/20 transition-all z-10">
                {getCategoryIcon(cat)}
              </div>
              <span className="text-gray-200 group-hover:text-white font-bold text-xs sm:text-sm tracking-wide z-10 text-center">
                  {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 pb-24 max-w-7xl mx-auto">
      
      {/* NEW: Dedicated Favorites Banner */}
      <div className="mb-8 px-2">
        <button 
          onClick={() => onSelectCategory({ id: 'cat-favorites', name: 'My Favorites', playlistUrl: '' })}
          className="w-full bg-gradient-to-r from-red-600/20 to-[#1a1d23] border border-red-500/30 p-5 rounded-2xl flex items-center gap-5 hover:scale-[1.02] transition-all shadow-xl group"
        >
          <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
             <Heart className="w-8 h-8 text-red-500 fill-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          </div>
          <div className="text-left flex-1">
             <h3 className="text-white font-black text-lg tracking-wide group-hover:text-red-400 transition-colors">My Favorites</h3>
             <p className="text-gray-400 text-xs font-bold mt-1">
                {favoritesCount > 0 ? `${favoritesCount} Saved Channels` : 'No favorites yet. Add some!'}
             </p>
          </div>
        </button>
      </div>

      <CategorySection title="Premium M3U Playlists" items={premium} />
      <CategorySection title="Content Genres" items={content} />
      <CategorySection title="Global Regions" items={regions} />
    </div>
  );
};

export default CategoriesView;