import React from 'react';
import { motion } from 'motion/react';
import { Target, Users, Zap, Shield } from 'lucide-react';

export function About() {
  return (
    <main className="pt-32 pb-24 px-6 bg-[#06080E] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
          >
             <h4 className="text-[#12A8FF] font-black uppercase tracking-[6px] text-xs mb-4">Our Origin</h4>
             <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 border-l-8 border-[#12A8FF] pl-8">
               More Than <br /> Just Ink.
             </h1>
             <p className="text-gray-400 text-lg leading-relaxed mb-8">
               PrintHive PH was founded on the belief that high-quality, professional printing should be accessible to everyone. We've combined cutting-edge technology with a passion for creative arts to build the ultimate printing hub.
             </p>
             <p className="text-gray-500 italic border-l border-white/10 pl-8">
               "We don't just print products; we print memories, identities, and success stories."
             </p>
          </motion.div>
          <div className="relative">
             <div className="aspect-[4/3] bg-gradient-to-br from-white/10 to-transparent rounded-[40px] border border-white/10 overflow-hidden relative z-10 p-8 flex items-center justify-center">
                <div className="text-8xl font-black text-white/5 uppercase select-none">PrintHive</div>
             </div>
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#12A8FF]/20 blur-[100px] rounded-full" />
             <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#FF1493]/10 blur-[100px] rounded-full" />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
           {[
             { i: <Target />, t: 'Our Mission', d: 'To provide innovative and high-quality printing solutions that help businesses and individuals shine.' },
             { i: <Shield />, t: 'Our Quality', d: 'We use premium materials and rigorous quality checks to ensure every piece is a masterpiece.' },
             { i: <Users />, t: 'Our Community', d: 'Building lasting relationships with our clients through exceptional service and support.' },
             { i: <Zap />, t: 'Our Tech', d: 'Leveraging the latest in digital and offset printing technology for efficient production.' },
           ].map((item, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="p-10 rounded-[32px] bg-white/5 border border-white/5 text-center"
             >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#12A8FF] mx-auto mb-6">
                  {item.i}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{item.t}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
             </motion.div>
           ))}
        </section>

        <section className="p-16 rounded-[60px] bg-white/5 border border-white/10 text-center relative overflow-hidden">
           <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl font-extrabold text-white mb-6 italic">Creative Prints Made Easy</h2>
              <p className="text-gray-400 mb-10">Experience the PrintHive difference today. Join thousands of satisfied clients who trust us with their vision.</p>
              <button className="px-10 py-5 rounded-full bg-white text-black font-black hover:scale-110 transition-all uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Start Printing
              </button>
           </div>
           <div className="absolute top-0 left-0 w-full h-full opacity-10 flex flex-wrap gap-12 rotate-[-20deg] scale-150 pointer-events-none">
              {Array.from({length: 40}).map((_, i) => (
                <span key={i} className="text-white font-black text-2xl uppercase tracking-widest shrink-0">HIVE</span>
              ))}
           </div>
        </section>
      </div>
    </main>
  );
}
