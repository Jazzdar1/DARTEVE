import React from 'react';
import { Tv2, Mail, Phone, MessageCircle, ShieldCheck, Code } from 'lucide-react';

const AboutView: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center justify-center text-center mb-10 mt-6">
        <div className="bg-green-500/10 p-5 rounded-3xl border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)] mb-6">
          <Tv2 className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-[0.2em] text-white mb-2">DAR TEVE</h1>
        <p className="text-gray-400 font-bold tracking-widest uppercase text-xs md:text-sm">Version 2.0 • Pro Edition</p>
      </div>

      <div className="bg-[#1a1d23] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl mb-8">
        <h2 className="text-lg font-black text-white uppercase tracking-widest mb-4 flex items-center gap-3">
            <ShieldCheck className="text-green-500" /> About The App
        </h2>
        <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-6">
          DAR TEVE is an advanced, high-performance IPTV aggregator and media player. We provide a seamless experience for streaming your favorite live sports, news, and entertainment channels. Our platform utilizes a state-of-the-art Tri-Core playback engine to ensure smooth streaming across all your devices.
        </p>
      </div>

      {/* Contact Section */}
      <h2 className="text-sm font-black text-gray-500 uppercase tracking-[3px] mb-4 px-2">Contact Support</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* WhatsApp Button */}
        <a 
          href="https://wa.me/917006686584" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-3 bg-[#1a1d23] hover:bg-[#252a33] border border-green-500/20 hover:border-green-500/50 p-6 rounded-2xl transition-all group shadow-lg"
        >
          <div className="bg-green-500/10 p-3 rounded-full group-hover:bg-green-500/20 transition-colors">
            <MessageCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold text-sm">WhatsApp</h3>
            <p className="text-green-400 font-black tracking-wider text-xs mt-1">+91 7006686584</p>
          </div>
        </a>

        {/* Email Button */}
        <a 
          href="mailto:contact@darteve.in" 
          className="flex flex-col items-center justify-center gap-3 bg-[#1a1d23] hover:bg-[#252a33] border border-blue-500/20 hover:border-blue-500/50 p-6 rounded-2xl transition-all group shadow-lg"
        >
          <div className="bg-blue-500/10 p-3 rounded-full group-hover:bg-blue-500/20 transition-colors">
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold text-sm">Email Us</h3>
            <p className="text-blue-400 font-black tracking-wider text-xs mt-1">contact@darteve.in</p>
          </div>
        </a>

        {/* Phone Button */}
        <a 
          href="tel:+917006686584" 
          className="flex flex-col items-center justify-center gap-3 bg-[#1a1d23] hover:bg-[#252a33] border border-orange-500/20 hover:border-orange-500/50 p-6 rounded-2xl transition-all group shadow-lg"
        >
          <div className="bg-orange-500/10 p-3 rounded-full group-hover:bg-orange-500/20 transition-colors">
            <Phone className="w-8 h-8 text-orange-500" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold text-sm">Call Support</h3>
            <p className="text-orange-400 font-black tracking-wider text-xs mt-1">+91 7006686584</p>
          </div>
        </a>

      </div>

      <div className="mt-12 text-center flex flex-col items-center justify-center text-gray-600 gap-2">
         <Code size={20} />
         <p className="text-[10px] font-black uppercase tracking-widest">Developed with ❤️ for Streaming Enthusiasts</p>
         <p className="text-[10px] uppercase">© {new Date().getFullYear()} DAR TEVE. All rights reserved.</p>
      </div>

    </div>
  );
};

export default AboutView;