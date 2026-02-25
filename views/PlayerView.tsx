import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Match, Channel } from '../types';
import { ArrowLeft, AlertCircle, Settings, Sun, Volume2, Maximize, Minimize, PictureInPicture, Tv2, PlayCircle, Radio, MonitorPlay, Server, RefreshCw } from 'lucide-react';
import Hls from 'hls.js';

interface PlayerViewProps {
  match: Match | null;
  onBack: () => void;
  relatedChannels: Channel[];
  onSelectRelated: (channel: Channel) => void;
}

type EngineType = 'default' | 'clappr' | 'dplayer' | 'videojs';

const PlayerView: React.FC<PlayerViewProps> = ({ match, onBack, relatedChannels, onSelectRelated }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const retryCount = useRef(0);

  const [currentStream, setCurrentStream] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerEngine, setPlayerEngine] = useState<EngineType>('default');
  const [isSultanIframe, setIsSultanIframe] = useState(false);
  const [customIframeHtml, setCustomIframeHtml] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (match?.streamUrl) {
      setCurrentStream(match.streamUrl);
      setPlayerEngine('default');
      setError(null);
    }
  }, [match?.id, match?.streamUrl]);

  const handleFallback = useCallback(() => {
    setPlayerEngine(prev => {
      const engines: EngineType[] = ['default', 'clappr', 'dplayer', 'videojs'];
      const idx = engines.indexOf(prev);
      if (idx < engines.length - 1) {
        setError(`30s Timeout! Switching to ${engines[idx + 1].toUpperCase()}...`);
        setLoading(true);
        return engines[idx + 1];
      } else {
        setError("All players failed. Stream link is dead or offline.");
        setLoading(false);
        return prev;
      }
    });
  }, []);

  const generatePlayerHtml = (engine: EngineType, url: string) => {
    const errorSpy = `<script>function sendErr() { window.parent.postMessage({action: 'STREAM_ERROR'}, '*'); } window.onerror = sendErr;</script>`;
    if (engine === 'clappr') return `<!DOCTYPE html><html><head><script src="https://cdn.jsdelivr.net/npm/clappr@latest/dist/clappr.min.js"></script></head><body style="margin:0;background:#000;overflow:hidden;"><div id="player"></div>${errorSpy}<script>new Clappr.Player({source: "${url}", parentId: "#player", autoPlay: true, width: "100%", height: "100vh"});</script></body></html>`;
    if (engine === 'dplayer') return `<!DOCTYPE html><html><head><script src="https://cdn.jsdelivr.net/npm/hls.js/dist/hls.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/dplayer/1.27.1/DPlayer.min.js"></script></head><body style="margin:0;background:#000;overflow:hidden;"><div id="dplayer" style="width:100%;height:100vh;"></div>${errorSpy}<script>var dp = new DPlayer({container: document.getElementById('dplayer'), autoplay: true, video: {url: '${url}', type: 'hls'}}); dp.on('error', sendErr);</script></body></html>`;
    if (engine === 'videojs') return `<!DOCTYPE html><html><head><link href="https://vjs.zencdn.net/8.3.0/video-js.css" rel="stylesheet" /><script src="https://vjs.zencdn.net/8.3.0/video.min.js"></script></head><body style="margin:0;background:#000;overflow:hidden;"><video id="my-video" class="video-js vjs-default-skin vjs-fill" controls autoplay preload="auto" style="width:100%;height:100vh;"><source src="${url}" type="application/x-mpegURL" /></video>${errorSpy}<script>videojs('my-video').on('error', sendErr);</script></body></html>`;
    return '';
  };

  useEffect(() => {
    let isMounted = true;
    if (!currentStream) return;
    setLoading(true);
    
    // ⏱️ TIMER START HOTA HAI
    let fallbackTimer = setTimeout(() => {
        if (isMounted) handleFallback();
    }, 30000);

    const handleSuccess = () => {
        if (isMounted) {
            clearTimeout(fallbackTimer);
            setLoading(false);
            if (error?.includes("Timeout!")) setError(null);
        }
    };

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    // 🔥 STRICT SULTAN VIP / IFRAME DETECTOR
    const isSultanStream = match?.id.includes('cat-sultan') || 
                           ((match as any)?.multiLinks || []).some((l:any) => l.url === currentStream && l.name.includes('(VIP)'));
                           
    const isIframeLink = currentStream.includes('.html') || currentStream.includes('.php') || 
                         ((match as any)?.multiLinks || []).find((l:any) => l.url === currentStream)?.type === 'Iframe';
    
    // 🛑 AGAR SULTAN VIP YA IFRAME HAI TOH TIMER FAURAN KILL (DESTROY) KAR DO
    if (isSultanStream || isIframeLink || match?.type === 'Iframe') {
        clearTimeout(fallbackTimer); // <--- Timer Blocked!
        setIsSultanIframe(true); 
        setCustomIframeHtml(''); 
        return () => { isMounted = false; clearTimeout(fallbackTimer); };
    } else { 
        setIsSultanIframe(false); 
    }

    if (playerEngine !== 'default') {
        setCustomIframeHtml(generatePlayerHtml(playerEngine, currentStream));
        return () => { isMounted = false; clearTimeout(fallbackTimer); };
    } else { setCustomIframeHtml(''); }

    const video = videoRef.current;
    if (!video) { clearTimeout(fallbackTimer); return; }

    if (Hls.isSupported()) {
      const hls = new Hls({ maxMaxBufferLength: 30, liveSyncDurationCount: 3 });
      hlsRef.current = hls;
      hls.loadSource(currentStream);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => { 
          handleSuccess(); 
          video.play().catch(()=>console.log("Autoplay block")); 
      });
      
      hls.on(Hls.Events.ERROR, (e, data) => {
        if (data.fatal && isMounted) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) { 
              if(retryCount.current < 2) { retryCount.current++; hls.startLoad(); } 
              else { clearTimeout(fallbackTimer); handleFallback(); } 
          } 
          else { clearTimeout(fallbackTimer); handleFallback(); }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = currentStream; 
      video.play(); 
      video.addEventListener('loadeddata', handleSuccess);
      video.addEventListener('error', () => { if (isMounted) { clearTimeout(fallbackTimer); handleFallback(); } });
    }

    return () => { 
        isMounted = false;
        clearTimeout(fallbackTimer);
        if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    };
  }, [currentStream, playerEngine, match, handleFallback]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(e => console.log(e));
      setIsFullscreen(true);
    } else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  if (!match) return null;
  const multiLinks = (match as any).multiLinks || [];

  return (
    <div className="flex flex-col h-screen bg-[#0f1115] overflow-hidden text-white">
      <div ref={containerRef} key={match.id} className={`relative w-full bg-black flex flex-col justify-center select-none ${isFullscreen && !isSultanIframe ? 'h-screen fixed inset-0 z-50' : 'aspect-video'}`}>
        {loading && <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/60"><div className="w-10 h-10 border-4 border-[#00b865] border-t-transparent rounded-full animate-spin"></div></div>}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 p-4 text-center">
            {error.includes("Timeout!") ? <RefreshCw className="w-10 h-10 text-yellow-500 mb-4 animate-spin" /> : <AlertCircle className="w-10 h-10 text-red-500 mb-4" />}
            <p className="text-gray-200 font-bold text-sm mb-4">{error}</p>
            {!error.includes("Timeout!") && (
               <button onClick={() => { setError(null); setLoading(true); setPlayerEngine('default'); }} className="px-6 py-2 bg-[#00b865] rounded-lg font-bold text-white shadow-lg">Retry Default</button>
            )}
          </div>
        )}

        {isSultanIframe ? (
          <>
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
              <button onClick={onBack} className="p-2 bg-black/50 rounded-full hover:bg-[#00b865] transition"><ArrowLeft className="w-6 h-6 text-white" /></button>
            </div>
            <iframe 
                src={currentStream.split('|')[0].trim()} 
                className="w-full h-full border-none absolute inset-0 z-10 bg-black" 
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture" 
                allowFullScreen 
                referrerPolicy="no-referrer" 
                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups" 
                onLoad={() => { setLoading(false); if (error) setError(null); }} 
            />
          </>
        ) : customIframeHtml !== '' ? (
          <>
             <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
              <button onClick={onBack} className="p-2 bg-black/50 rounded-full hover:bg-[#00b865] transition"><ArrowLeft className="w-6 h-6 text-white" /></button>
              <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-black/50 rounded-full"><Settings className="w-6 h-6 text-white" /></button>
            </div>
            <iframe srcDoc={customIframeHtml} className="w-full h-full border-none absolute inset-0 z-10 bg-black" allow="autoplay; fullscreen" allowFullScreen onLoad={() => { setLoading(false); if (error) setError(null); }} />
          </>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-contain pointer-events-none z-10" playsInline onClick={() => setShowControls(!showControls)} />
            <div className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/80 via-transparent to-black/80 transition-opacity duration-300 z-40 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex items-center justify-between p-4 pointer-events-auto">
                <button onClick={isFullscreen ? toggleFullscreen : onBack} className="p-2 bg-black/50 rounded-full hover:bg-[#00b865] transition"><ArrowLeft className="w-6 h-6 text-white" /></button>
                <h1 className="font-bold text-sm md:text-lg truncate px-4">{match.team1}</h1>
                <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-black/50 rounded-full"><Settings className="w-6 h-6 text-white" /></button>
              </div>
              <div className="flex items-center justify-between p-4 pointer-events-auto">
                <span className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-500/20 px-2 py-1 rounded"><span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span> LIVE</span>
                <button onClick={toggleFullscreen} className="p-2 hover:bg-white/20 rounded-full transition">{isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}</button>
              </div>
            </div>
          </>
        )}

        {showSettings && (
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-black/95 border-l border-white/10 z-50 p-4 flex flex-col animate-in slide-in-from-right pointer-events-auto">
            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-sm">Engine Select</h3><button onClick={() => setShowSettings(false)}>X</button></div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setPlayerEngine('default'); setShowSettings(false); }} className={`px-2 py-2 rounded text-[10px] font-bold ${playerEngine === 'default' ? 'bg-[#00b865]' : 'bg-white/10'}`}>Native</button>
              <button onClick={() => { setPlayerEngine('clappr'); setShowSettings(false); }} className={`px-2 py-2 rounded text-[10px] font-bold ${playerEngine === 'clappr' ? 'bg-[#00b865]' : 'bg-white/10'}`}>Clappr</button>
              <button onClick={() => { setPlayerEngine('dplayer'); setShowSettings(false); }} className={`px-2 py-2 rounded text-[10px] font-bold ${playerEngine === 'dplayer' ? 'bg-[#00b865]' : 'bg-white/10'}`}>DPlayer</button>
              <button onClick={() => { setPlayerEngine('videojs'); setShowSettings(false); }} className={`px-2 py-2 rounded text-[10px] font-bold ${playerEngine === 'videojs' ? 'bg-[#00b865]' : 'bg-white/10'}`}>VideoJS</button>
            </div>
          </div>
        )}
      </div>

      {!isFullscreen && (
        <div className="flex-1 overflow-y-auto bg-[#0f1115] pb-24">
          
          {/* 🔥 SULTAN VIP AND OTHER SERVERS LIST */}
          {multiLinks.length > 0 && (
            <div className="p-4 border-b border-white/5 bg-[#1a1d24]">
              <h2 className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Server size={14} /> Available Streams ({multiLinks.length})</h2>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {multiLinks.map((link: any, idx: number) => (
                  <button 
                    key={`svr-${idx}`} 
                    onClick={() => setCurrentStream(link.url)} 
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${currentStream === link.url ? 'bg-[#00b865] text-white shadow-[0_0_15px_rgba(0,184,101,0.3)]' : 'bg-black/40 text-gray-400 border border-white/5 hover:border-white/20 hover:text-white'}`}
                  >
                    <Radio className={`w-3.5 h-3.5 ${currentStream === link.url ? 'animate-pulse text-white' : 'text-gray-500'}`} />
                    {link.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="p-4">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Tv2 size={16} /> All Channels</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedChannels.map((channel, idx) => (
                <button key={idx} onClick={() => onSelectRelated(channel)} className={`flex items-center gap-4 p-3 border rounded-xl transition-all text-left ${match.id === channel.id ? 'bg-[#00b865]/10 border-[#00b865]/50' : 'bg-[#1a1d23] border-white/5 hover:border-white/20'}`}><img src={channel.logo} loading="lazy" className="w-10 h-10 rounded-lg object-contain bg-white/5" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=TV` }} /><div className="flex-1 min-w-0"><span className={`text-sm font-bold truncate block ${match.id === channel.id ? 'text-[#00b865]' : 'text-gray-200'}`}>{channel.name}</span></div><PlayCircle className="w-6 h-6 text-gray-600 shrink-0" /></button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerView;