import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Printer, MousePointer2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../firebase/config';
import { toast } from 'react-hot-toast';
import coverImg from '../assets/cover.png';

export function Hero() {
  const { user } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast.error(`Add "${window.location.hostname}" to Firebase Console → Auth → Authorized domains`, { duration: 8000 });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Sign in failed. Please try again.');
      }
    }
  };

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
            {!user ? (
              <button
                onClick={handleSignIn}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#12A8FF] to-[#A020F0] text-white font-bold flex items-center gap-2 group hover:shadow-[0_0_25px_rgba(18,168,255,0.4)] transition-all"
              >
                Get Started
                <Zap size={18} className="fill-current group-hover:scale-110 transition-transform" />
              </button>
            ) : (
              <Link
                to="/services"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#12A8FF] to-[#0070FF] text-white font-bold flex items-center gap-2 group hover:shadow-[0_0_25px_rgba(18,168,255,0.4)] transition-all"
              >
                View Services
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link
              to="/contact"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2"
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
          {/* Main Visual */}
          <div className="relative z-10 w-full aspect-square rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
             <img 
               src={coverImg} 
               alt="Professional Printing Services" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
               onError={(e) => {
                 (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&q=80&w=1200';
               }}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
             
             {/* Floating Elements on Top */}
             <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                >
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#12A8FF]/20 flex items-center justify-center text-[#12A8FF]">
                         <Printer size={20} />
                      </div>
                      <div>
                         <div className="text-white font-bold text-sm">Precision Print</div>
                         <div className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Node-01 Active</div>
                      </div>
                   </div>
                </motion.div>
             </div>
          </div>
          
          {/* Decorative floating icons */}
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-6 -right-6 p-4 bg-[#FFC107] text-black rounded-2xl shadow-xl z-20"
          >
             <Sparkles size={24} />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-10 -left-10 p-4 bg-[#12A8FF] text-white rounded-2xl shadow-xl z-20"
          >
             <MousePointer2 size={24} />
          </motion.div>
          
          {/* Neon Glow effect behind */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#12A8FF] to-[#FF1493] opacity-30 blur-[100px] -z-10 rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
