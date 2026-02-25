import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Tv2, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const LiveScoreCard = () => {
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const fetchCricbuzzLive = useCallback(async () => {
    setLoading(true);
    try {
      // 🚀 Cricbuzz API ka exact link jo aapne bheja
      const url = 'https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live';
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'cricbuzz-cricket.p.rapidapi.com',
          'x-rapidapi-key': '8b6c43e956msh7aeacbd10df30e4p1a16b0jsn2e866e6bd634'
        }
      };

      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      
      const result = await response.json();
      
      // 🧐 Cricbuzz Logic: Yeh data 'typeMatches' ke andar hota hai
      // Hum pehle International (index 0) matches dhoondte hain
      const typeMatches = result.typeMatches || [];
      let liveMatchFound = null;

      for (let category of typeMatches) {
        if (category.seriesMatches) {
          for (let series of category.seriesMatches) {
            if (series.seriesAdWrapper && series.seriesAdWrapper.matches) {
              liveMatchFound = series.seriesAdWrapper.matches[0];
              break;
            }
          }
        }
        if (liveMatchFound) break;
      }

      setMatch(liveMatchFound);
      setError(null);
    } catch (err: any) {
      setError(err.message === "429" ? "Limit Full" : "API Offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCricbuzzLive();
    const interval = setInterval(fetchCricbuzzLive, 120000); // 2 min sync
    return () => clearInterval(interval);
  }, [fetchCricbuzzLive]);

  return (
    <div className="bg-gradient-to-br from-[#1a1d24] to-[#0f1115] border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden mb-6">
      
      {/* 🔴 LIVE INDICATOR */}
      <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg flex items-center gap-1 animate-pulse z-10">
        <Activity size={12} /> CRICBUZZ LIVE
      </div>

      <div className="flex justify-between items-center mb-4">
        <button onClick={fetchCricbuzzLive} disabled={loading} className="text-gray-600 hover:text-white transition-all">
          <RefreshCw size={14} className={loading ? "animate-spin text-green-500" : ""} />
        </button>
      </div>

      {match ? (
        <div className="animate-in fade-in duration-500">
          <div className="text-center text-gray-400 text-[10px] font-bold mb-4 uppercase tracking-widest border-b border-white/5 pb-2">
            {match.matchInfo?.seriesName || "Live Match"}
          </div>

          <div className="flex justify-between items-center mb-6 px-2">
            {/* Team 1 */}
            <div className="flex flex-col items-center w-1/3">
              <span className="font-black text-lg text-white">{match.matchInfo?.team1?.teamSName || "T1"}</span>
              <span className="text-xl font-black text-green-400">{match.matchScore?.team1Score?.inngs1?.runs || "0"}/{match.matchScore?.team1Score?.inngs1?.wickets || "0"}</span>
            </div>

            <div className="text-gray-700 font-black italic text-xl">VS</div>

            {/* Team 2 */}
            <div className="flex flex-col items-center w-1/3">
              <span className="font-black text-lg text-gray-300">{match.matchInfo?.team2?.teamSName || "T2"}</span>
              <span className="text-xl font-black text-gray-400">{match.matchScore?.team2Score?.inngs1?.runs || "0"}/{match.matchScore?.team2Score?.inngs1?.wickets || "0"}</span>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-center mb-4">
            <p className="text-[10px] text-yellow-500 font-bold uppercase">{match.matchInfo?.status || "Live"}</p>
          </div>

          <button className="w-full bg-green-500 hover:bg-green-600 text-black font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Tv2 size={18} /> WATCH ON DARTV
          </button>
        </div>
      ) : (
        <div className="py-10 text-center flex flex-col items-center">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
            {loading ? "Stadium Connecting..." : "No Cricbuzz Live Matches"}
          </p>
        </div>
      )}

      {/* 🛠️ DEV TOOLS */}
      <div className="mt-4 border-t border-white/5 pt-2">
        <button onClick={() => setShowRaw(!showRaw)} className="text-[9px] text-gray-700 uppercase font-bold w-full text-center">
          {showRaw ? "Hide JSON" : "Show Cricbuzz Raw JSON"}
        </button>
        {showRaw && (
          <div className="mt-2 bg-black p-2 rounded text-[8px] text-green-500 h-32 overflow-auto font-mono">
            {JSON.stringify(match, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveScoreCard;