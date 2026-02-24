import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Match, Channel } from '../types';
import { 
  ArrowLeft, AlertCircle, Settings, Sun, Volume2, 
  Maximize, Minimize, PictureInPicture, Activity, Tv2, PlayCircle, Radio 
} from 'lucide-react';
import Hls from 'hls.js';

interface PlayerViewProps {
  match: Match | null;
  onBack: () => void;
  relatedChannels: Channel[];
  onSelectRelated: (channel: Channel) => void;
}

const PlayerView: React.FC<PlayerViewProps> = ({
  match, onBack, relatedChannels, onSelectRelated
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(100);
  const [qualities, setQualities] = useState<any[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);

  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const isVolumeArea = useRef(false);

  const similarChannels = useMemo(() => {
    if (!match || !match.team1) return [];
    try {
        const baseName = match.team1.split(' ')[0]?.toLowerCase() || ""; 
        return relatedChannels.filter(c => c.name?.toLowerCase().includes(baseName) && c.id !== match.id).slice(0, 10);
    } catch (e) {
        return [];
    }
  }, [match, relatedChannels]);

  useEffect(() => {
    if (!match || !match.streamUrl || !videoRef.current) return;
    
    setError(null);
    setLoading(true);
    const video = videoRef.current;
    
    // URL Saaf Karna
    const rawUrl = match.streamUrl;
    const cleanUrl = rawUrl.split('|')[0].trim();
    
    let customHeaders: Record<string, string> = {};
    if (rawUrl.includes('|')) {
       const headerString = rawUrl.split('|')[1];
       const urlParams = new URLSearchParams(headerString);
       urlParams.forEach((value, key) => { customHeaders[key] = value; });
    }

    // Purana HLS Engine Destroy Karna
    if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
    }

    // 🚀 ORIGINAL HLS.JS PLAYER (No DASH, No Proxy)
    console.log("🚀 Starting Original HLS Engine");
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        xhrSetup: (xhr) => {
            if (Object.keys(customHeaders).length > 0) {
                for (const key in customHeaders) {
                    xhr.setRequestHeader(key, customHeaders[key]);
                }
            }
        }
      });

      hlsRef.current = hls;
      hls.loadSource(cleanUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => {
        setQualities(data.levels);
        setLoading(false);
        video.play().catch(e => console.log("Autoplay issue"));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setLoading(false);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              console.error("HLS Network Error:", data);
              setError("Network error. Retrying...");
              hls.startLoad();
          } else {
              setError("Stream error. Link might be offline.");
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = cleanUrl;
      video.play();
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); }
    };
  }, [match?.streamUrl]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    isVolumeArea.current = touchStartX.current > window.innerWidth / 2;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!videoRef.current) return;
    const diffY = touchStartY.current - e.touches[0].clientY;
    
    if (Math.abs(diffY) > 5) { 
      if (isVolumeArea.current) {
        let newVol = volume + (diffY > 0 ? 2 : -2);
        setVolume(Math.max(0, Math.min(100, newVol)));
        videoRef.current.volume = Math.max(0, Math.min(100, newVol)) / 100;
      } else {
        let newBright = brightness + (diffY > 0 ? 2 : -2);
        setBrightness(Math.max(20, Math.min(200, newBright)));
      }
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(err => console.log(err));
      try { if (screen.orientation && (screen.orientation as any).lock) await (screen.orientation as any).lock('landscape'); } catch (e) {}
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      if (document.pictureInPictureElement) document.exitPictureInPicture();
      else await videoRef.current.requestPictureInPicture();
    }
  };

  if (!match) return <div className="h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-[#0f1115] overflow-hidden text-white">
      
      <div 
        ref={containerRef} 
        className={`relative w-full bg-black flex flex-col justify-center transition-all shrink-0 touch-none select-none ${isFullscreen ? 'h-screen fixed inset-0 z-50' : 'aspect-video'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onClick={() => setShowControls(!showControls)}
      >
        {loading && <div className="absolute inset-0 flex items-center justify-center z-20"><div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>}
        {error && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-30 p-4 text-center"><AlertCircle className="w-10 h-10 text-red-500 mb-2" /><p className="text-red-400 font-bold text-sm">{error}</p></div>}

        <video ref={videoRef} className="w-full h-full object-contain pointer-events-none" playsInline style={{ filter: `brightness(${brightness}%)` }} />

        <div className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/80 via-transparent to-black/80 transition-opacity duration-300 z-40 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center justify-between p-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={isFullscreen ? toggleFullscreen : onBack} className="p-2 bg-black/50 rounded-full pointer-events-auto"><ArrowLeft className="w-6 h-6 text-white" /></button>
            <h1 className="font-bold text-sm md:text-lg truncate px-4 drop-shadow-lg">{match.team1}</h1>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-black/50 rounded-full pointer-events-auto"><Settings className="w-6 h-6 text-white" /></button>
          </div>

          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-50"><Sun className="w-5 h-5 mb-1"/> <span className="text-[10px] font-bold">{brightness}%</span></div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-50"><Volume2 className="w-5 h-5 mb-1"/> <span className="text-[10px] font-bold">{volume}%</span></div>

          <div className="flex items-center justify-between p-4" onClick={(e) => e.stopPropagation()}>
            <span className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/20 px-2 py-1 rounded"><div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div> LIVE</span>
            <div className="flex items-center gap-4">
              <button onClick={togglePiP} className="p-2 hover:bg-white/20 rounded-full transition pointer-events-auto"><PictureInPicture className="w-6 h-6" /></button>
              <button onClick={toggleFullscreen} className="p-2 hover:bg-white/20 rounded-full transition pointer-events-auto">{isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}</button>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-black/95 border-l border-white/10 z-50 p-4 flex flex-col animate-in slide-in-from-right" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-sm text-gray-300">Settings</h3><button onClick={() => setShowSettings(false)} className="text-gray-400 font-bold pointer-events-auto">X</button></div>
            <label className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-2"><Activity size={14}/> Quality</label>
            <div className="space-y-2 flex-1 overflow-y-auto">
              <button onClick={() => { if(hlsRef.current) hlsRef.current.currentLevel = -1; setCurrentQuality(-1); setShowSettings(false); }} className={`w-full text-left px-3 py-2 rounded text-sm font-bold pointer-events-auto ${currentQuality === -1 ? 'bg-green-500 text-black' : 'bg-white/10 text-white'}`}>Auto</button>
              {qualities.map((level, index) => <button key={index} onClick={() => { if(hlsRef.current) hlsRef.current.currentLevel = index; setCurrentQuality(index); setShowSettings(false); }} className={`w-full text-left px-3 py-2 rounded text-sm font-bold pointer-events-auto ${currentQuality === index ? 'bg-green-500 text-black' : 'bg-white/10 text-white'}`}>{level.height ? `${level.height}p` : `Quality ${index + 1}`}</button>)}
            </div>
          </div>
        )}
      </div>

      {!isFullscreen && (
        <div className="flex-1 overflow-y-auto bg-[#0f1115] pb-24">
          
          {similarChannels.length > 0 && (
            <div className="p-4 border-b border-white/5">
              <h2 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Tv2 size={16} /> Similar</h2>
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                {similarChannels.map((channel, idx) => (
                  <button key={`sim-${idx}`} onClick={() => onSelectRelated(channel)} className="flex-shrink-0 w-64 flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:border-blue-500 transition-all text-left snap-start"><img src={channel.logo} className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1" alt="" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=TV&background=random` }} /><span className="text-xs font-bold text-blue-100 truncate flex-1">{channel.name}</span><Radio className="w-4 h-4 text-blue-500 shrink-0" /></button>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-4">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Tv2 size={16} /> All Channels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedChannels.map((channel, idx) => (
                <button key={idx} onClick={() => onSelectRelated(channel)} className={`flex items-center gap-4 p-3 border rounded-xl transition-all text-left ${match.id === channel.id ? 'bg-green-500/10 border-green-500/30' : 'bg-[#1a1d23] border-white/5'}`}><img src={channel.logo} className="w-10 h-10 rounded-lg object-contain bg-white/5" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=TV` }} /><div className="flex-1 min-w-0"><span className={`text-sm font-bold truncate block ${match.id === channel.id ? 'text-green-400' : 'text-gray-200'}`}>{channel.name}</span>{match.id === channel.id && <span className="text-[10px] text-green-500 font-bold uppercase">Playing Now</span>}</div>{match.id !== channel.id && <PlayCircle className="w-6 h-6 text-gray-600 shrink-0" />}</button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default PlayerView;