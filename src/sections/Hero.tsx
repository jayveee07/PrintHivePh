import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Printer, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#0B0F19]">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#12A8FF]/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#FF1493]/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Sparkles size={16} className="text-[#FFC107]" />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Premium Printing Solutions</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Creative Prints <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#12A8FF] via-[#FF1493] to-[#A020F0]">
              Made Easy.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
            Elevate your brand with high-quality custom prints, office essentials, and vibrant merchandise. Fast, affordable, and futuristic.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/services"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#12A8FF] to-[#0070FF] text-white font-bold flex items-center gap-2 group hover:shadow-[0_0_25px_rgba(18,168,255,0.4)] transition-all"
            >
              Our Services
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
            >
              Get a Quote
            </Link>
          </div>
          
          <div className="flex items-center gap-8 pt-8 border-t border-white/5">
            <div>
              <div className="text-2xl font-bold text-white">5k+</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Happy Clients</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">10k+</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Projects Done</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">4.9/5</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Average Rating</div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1, type: 'spring' }}
           className="relative"
        >
          {/* Mockup Floating Elements */}
          <div className="relative z-10 w-full aspect-square bg-gradient-to-br from-white/10 to-transparent rounded-3xl border border-white/10 backdrop-blur-3xl p-8 flex items-center justify-center">
             <div className="relative">
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-48 h-64 bg-white rounded-lg shadow-2xl relative z-20 flex flex-col items-center justify-center p-4"
                >
                   <div className="w-full h-full border-2 border-dashed border-gray-200 rounded flex items-center justify-center italic text-gray-300 text-sm">
                      Your Design Here
                   </div>
                </motion.div>
                
                {/* Decorative blobs */}
                <motion.div 
                   animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                   transition={{ duration: 10, repeat: Infinity }}
                   className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF1493]/30 rounded-full blur-2xl" 
                />
                <motion.div 
                   animate={{ scale: [1, 1.3, 1], rotate: [0, -45, 0] }}
                   transition={{ duration: 8, repeat: Infinity }}
                   className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#12A8FF]/30 rounded-full blur-2xl" 
                />
             </div>
             
             {/* Floating Icons */}
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
               className="absolute top-10 right-10 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-[#12A8FF]"
             >
                <Printer size={24} />
             </motion.div>
             <motion.div 
               animate={{ y: [0, 15, 0] }}
               transition={{ duration: 4, repeat: Infinity, delay: 1 }}
               className="absolute bottom-20 left-10 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-[#FFC107]"
             >
                <MousePointer2 size={24} />
             </motion.div>
          </div>
          
          {/* Neon Glow effect behind */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#12A8FF] to-[#FF1493] opacity-20 blur-[100px] -z-10 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
