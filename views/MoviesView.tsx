import React, { useEffect, useRef, useState } from 'react';
import { Match, Channel } from '../types';
import { ArrowLeft, Maximize, Minimize, Tv2, PlayCircle, Radio, Clock, AlertCircle } from 'lucide-react';
import Hls from 'hls.js';

interface PlayerViewProps {
  match: Match | null;
  onBack: () => void;
  relatedChannels: Channel[];
  onSelectRelated: (channel: Channel) => void;
  isPlaylistMode?: boolean;
}

const PlayerView: React.FC<PlayerViewProps> = ({ match, onBack, relatedChannels, onSelectRelated, isPlaylistMode = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const streamUrl = match?.streamUrl || '';
  const isUpcoming = streamUrl === 'upcoming' || streamUrl === '';
  
  // Basic Check: Kya isay iframe mein chalana hai?
  const isIframe = 
      match?.type === 'Iframe' || 
      (match as any)?.isSultan || 
      streamUrl.includes('.html') || 
      streamUrl.includes('.php') || 
      streamUrl.includes('embed');

  useEffect(() => {
    if (!streamUrl || isUpcoming || isIframe) {
        if (isIframe) {
            // Iframe ke liye loading jaldi hata do
            const t = setTimeout(() => setLoading(false), 1000);
            return () => clearTimeout(t);
        }
        return;
    }

    setLoading(true);
    setError(null);
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setLoading(false);
    video.addEventListener('playing', handlePlay);

    // Simple HLS Setup
    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      const hls = new Hls({ maxMaxBufferLength: 30 });
      hlsRef.current = hls;
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(e => console.log("Auto-play prevented", e));
      });
      
      hls.on(Hls.Events.ERROR, (e, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else {
            setError("Stream is offline or format not supported.");
            setLoading(false);
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari (Native HLS)
      video.src = streamUrl;
      video.play().catch(e => console.log("Auto-play prevented", e));
    } else {
      // For raw mp4 or other basic formats
      video.src = streamUrl;
      video.play().catch(e => console.log("Auto-play prevented", e));
    }

    return () => {
      video.removeEventListener('playing', handlePlay);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, isUpcoming, isIframe]);

  // Fullscreen Logic
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(e => console.log(e));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!match) return null;

  return (
    <div className="flex flex-col h-screen bg-[#0f1115] overflow-hidden text-white">
      
      {/* VIDEO CONTAINER */}
      <div ref={containerRef} className={`relative w-full bg-black flex flex-col justify-center select-none ${isFullscreen && !isIframe ? 'h-screen fixed inset-0 z-50' : 'aspect-video'}`}>
        
        {isUpcoming ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f1115] z-50 p-6 text-center">
             <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
               <button onClick={onBack} className="p-2 bg-white/10 rounded-full hover:bg-[#00b865]"><ArrowLeft /></button>
             </div>
             <Clock className="w-16 h-16 text-yellow-500 mb-4 animate-pulse" />
             <h2 className="text-2xl font-black mb-2">{match.team1}</h2>
             <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4">Upcoming Match</span>
             <p className="text-gray-400 text-xs">Link will be available when the match starts.</p>
           </div>
        ) : (
          <>
            {/* Loading & Error Overlays */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-40 bg-black/80">
                <div className="w-12 h-12 border-4 border-[#00b865] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#00b865] text-xs font-bold uppercase tracking-widest animate-pulse">Loading...</p>
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 p-4 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-gray-200 font-bold mb-4">{error}</p>
                <button onClick={onBack} className="px-6 py-2 bg-gray-700 rounded-lg font-bold">Go Back</button>
              </div>
            )}

            {/* PLAYER: Iframe OR Native Video */}
            <div className="absolute inset-0 w-full h-full z-10" onClick={() => setShowControls(!showControls)}>
                {isIframe ? (
                    <iframe 
                        src={streamUrl} 
                        className="w-full h-full border-none bg-black" 
                        allow="autoplay; fullscreen" 
                        allowFullScreen 
                    />
                ) : (
                    <video 
                        ref={videoRef} 
                        className="w-full h-full object-contain bg-black" 
                        playsInline 
                        autoPlay 
                        controls={showControls} // Native controls on click
                    />
                )}
            </div>

            {/* CUSTOM OVERLAY CONTROLS (Only for top/bottom bar) */}
            <div className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/80 via-transparent to-black/80 transition-opacity duration-300 z-40 pointer-events-none ${showControls ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* TOP BAR */}
              <div className="flex items-center justify-between p-4 pointer-events-auto">
                <button onClick={isFullscreen ? toggleFullscreen : onBack} className="p-2 bg-black/50 rounded-full hover:bg-[#00b865]"><ArrowLeft /></button>
                <h1 className="font-bold text-sm truncate px-4">{match.team1}</h1>
                <div className="w-10"></div> {/* Spacer */}
              </div>

              {/* BOTTOM BAR (Fullscreen toggle for Native video) */}
              {!isIframe && (
                  <div className="flex items-center justify-end p-4 pointer-events-auto pb-8 md:pb-4">
                    <button onClick={toggleFullscreen} className="p-2 bg-black/50 hover:bg-white/20 rounded-full">
                        {isFullscreen ? <Minimize /> : <Maximize />}
                    </button>
                  </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* CHANNELS LIST (Below Player) */}
      {!isFullscreen && (
        <div className="flex-1 overflow-y-auto bg-[#0f1115] pb-24 p-4">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Tv2 size={16} /> {isPlaylistMode ? 'Channels from this Playlist' : 'All Channels'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedChannels.map((channel, idx) => (
              <button 
                key={idx} 
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  onSelectRelated(channel);
                }} 
                className={`flex items-center gap-4 p-3 border rounded-xl text-left transition-colors ${match.id === channel.id ? 'bg-[#00b865]/10 border-[#00b865]/50' : 'bg-[#1a1d23] border-white/5 hover:bg-white/5'}`}
              >
                <img src={channel.logo} className="w-10 h-10 rounded-lg object-contain bg-black" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=TV` }} />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-bold truncate block ${match.id === channel.id ? 'text-[#00b865]' : 'text-gray-200'}`}>{channel.name}</span>
                </div>
                <PlayCircle className="w-6 h-6 text-gray-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerView;