import React, { useState } from 'react';
import { Play, Star, Info, X } from 'lucide-react';

interface MoviesViewProps {
  movies: any[];
  onPlay: (movie: any) => void;
}

export default function MoviesView({ movies, onPlay }: MoviesViewProps) {
    const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

    if (!movies || movies.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500 font-bold">No movies found...</div>;
    }

    const heroMovie = movies[0];

    return (
        <div className="flex flex-col w-full min-h-screen bg-[#0f1115] text-white">
            {/* 🌟 HERO SECTION (Top Featured Movie) */}
            <div className="relative w-full h-[55vh] md:h-[70vh] bg-black">
                <div className="absolute inset-0">
                    <img src={heroMovie.backdrop || heroMovie.poster} alt="Hero" className="w-full h-full object-cover opacity-50" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/40 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full md:w-2/3 z-10 animate-in slide-in-from-bottom duration-700">
                    <span className="text-[#00b865] font-black tracking-widest text-xs uppercase mb-3 block border border-[#00b865]/50 bg-[#00b865]/10 w-max px-3 py-1 rounded-full">{heroMovie.genre}</span>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 shadow-black drop-shadow-2xl leading-tight">{heroMovie.title}</h1>
                    <p className="text-sm md:text-base text-gray-300 mb-6 line-clamp-3 max-w-xl">{heroMovie.description}</p>
                    <div className="flex gap-3 md:gap-4">
                        <button onClick={() => onPlay(heroMovie)} className="flex items-center justify-center gap-2 bg-[#00b865] text-black px-6 py-3 md:px-8 md:py-3.5 rounded-xl font-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,184,101,0.4)]">
                            <Play fill="currentColor" size={20} /> PLAY NOW
                        </button>
                        <button onClick={() => setSelectedMovie(heroMovie)} className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors">
                            <Info size={20} /> Details
                        </button>
                    </div>
                </div>
            </div>

            {/* 🎬 MOVIES GRID (Netflix Style) */}
            <div className="px-4 md:px-12 -mt-6 md:-mt-10 z-20 relative pb-24">
                <h2 className="text-lg md:text-xl font-black mb-6 border-l-4 border-[#00b865] pl-3 tracking-wide">Trending Now</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 md:gap-4">
                    {movies.slice(1).map((movie, idx) => (
                        <div key={idx} className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.05] hover:z-30 hover:shadow-[0_0_25px_rgba(0,184,101,0.2)] bg-[#1a1d24]" onClick={() => setSelectedMovie(movie)}>
                            <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                <h3 className="text-xs font-bold text-white truncate">{movie.title}</h3>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="flex items-center gap-1 text-[9px] text-yellow-500 font-bold"><Star size={10} fill="currentColor"/> {movie.rating}</span>
                                    <span className="text-[9px] text-gray-400 font-bold">{movie.year}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🍿 DETAILS MODAL */}
            {selectedMovie && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedMovie(null)}>
                    <div className="bg-[#1a1d24] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="relative h-64 md:h-80 w-full">
                            <img src={selectedMovie.backdrop || selectedMovie.poster} className="w-full h-full object-cover opacity-40" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1d24] via-[#1a1d24]/50 to-transparent" />
                            <button onClick={() => setSelectedMovie(null)} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md"><X size={20}/></button>
                            <div className="absolute bottom-6 left-6 right-6">
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-3 drop-shadow-lg">{selectedMovie.title}</h2>
                                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-gray-300">
                                    <span className="bg-[#00b865]/20 text-[#00b865] px-2 py-1 rounded uppercase tracking-wider">{selectedMovie.genre}</span>
                                    <span className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded backdrop-blur-md"><Star size={12} className="text-yellow-500" fill="currentColor"/> {selectedMovie.rating}</span>
                                    <span className="bg-black/40 px-2 py-1 rounded backdrop-blur-md">{selectedMovie.year}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 md:p-8">
                            <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8">{selectedMovie.description}</p>
                            <button onClick={() => { onPlay(selectedMovie); setSelectedMovie(null); }} className="w-full flex items-center justify-center gap-3 bg-[#00b865] text-black py-4 rounded-xl font-black text-lg hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,184,101,0.3)]">
                                <Play fill="currentColor" size={24}/> START WATCHING
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}