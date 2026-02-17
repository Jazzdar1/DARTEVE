import React from 'react';
import { ShieldAlert, Lock, Server, EyeOff } from 'lucide-react';

const PrivacyPolicyView: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-black tracking-wide text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="text-green-500 w-8 h-8 md:w-10 md:h-10" /> Privacy Policy
        </h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Last Updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6 text-gray-300 text-sm md:text-base leading-relaxed">
        
        <div className="bg-[#1a1d23] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h2 className="text-white font-black uppercase tracking-wider mb-3 flex items-center gap-2">
             <Server size={18} className="text-blue-500"/> 1. Content Disclaimer
          </h2>
          <p>
            DAR TEVE is strictly a media player and aggregator. We do not host, provide, or broadcast any video content, streams, or media files on our own servers. The app solely reads and parses user-provided or publicly available M3U playlists. We hold no liability for the content streamed through these external links.
          </p>
        </div>

        <div className="bg-[#1a1d23] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h2 className="text-white font-black uppercase tracking-wider mb-3 flex items-center gap-2">
             <EyeOff size={18} className="text-orange-500"/> 2. Data Collection
          </h2>
          <p>
            We respect your privacy. DAR TEVE does not collect, store, or share sensitive personal information (such as your name, physical address, or payment details) on our servers without your explicit consent. 
          </p>
        </div>

        <div className="bg-[#1a1d23] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h2 className="text-white font-black uppercase tracking-wider mb-3 flex items-center gap-2">
             <Lock size={18} className="text-green-500"/> 3. Local Storage (Favorites & Settings)
          </h2>
          <p>
            Any personalized data, such as your "Favorites" list or "Custom Playlists," is saved locally on your own device using your browser's Local Storage. This data never leaves your device and is not accessible by our team.
          </p>
        </div>

        <div className="bg-[#1a1d23] border border-white/5 rounded-2xl p-6 shadow-lg">
          <h2 className="text-white font-black uppercase tracking-wider mb-3">4. Contact Us</h2>
          <p className="mb-2">If you have any questions or concerns regarding our privacy practices, please reach out to us:</p>
          <ul className="list-disc list-inside text-gray-400 font-bold space-y-1 ml-2">
            <li>Email: <a href="mailto:contact@darteve.in" className="text-blue-400 hover:underline">contact@darteve.in</a></li>
            <li>WhatsApp/Phone: <span className="text-green-400">+91 7006686584</span></li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicyView;