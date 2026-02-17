import React from 'react';
import { X, Play, Server } from 'lucide-react';

const LinkModal = ({ match, onClose, onSelect }) => {
    if (!match) return null;
    
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1d23] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#252a33]">
                    <h2 className="text-white font-black uppercase tracking-widest text-sm">Select Server</h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-4 mb-4 bg-black/20 p-3 rounded-xl">
                        <img src={match.team1Logo} className="w-10 h-10 object-contain drop-shadow-lg" alt="" />
                        <div>
                            <h3 className="text-white font-bold text-sm truncate max-w-[200px]">{match.team1}</h3>
                            <span className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span> Live
                            </span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => onSelect('Server 1')}
                        className="flex items-center justify-between w-full p-4 bg-green-500 hover:bg-green-600 text-black rounded-xl font-black uppercase transition-all hover:scale-[1.02] active:scale-95 shadow-[0_5px_15px_rgba(34,197,94,0.3)]"
                    >
                        <div className="flex items-center gap-3">
                            <Play size={18} fill="currentColor" />
                            <span>Main Stream</span>
                        </div>
                        <span className="text-[10px] bg-black/20 px-2 py-1 rounded">Auto</span>
                    </button>

                    <button 
                        onClick={() => onSelect('Server 2')}
                        className="flex items-center justify-between w-full p-4 bg-[#252a33] hover:bg-[#2d333f] text-gray-300 border border-white/5 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <div className="flex items-center gap-3">
                            <Server size={18} />
                            <span>Mirror 1 (Backup)</span>
                        </div>
                        <span className="text-[10px] text-gray-500 uppercase">HLS</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkModal;