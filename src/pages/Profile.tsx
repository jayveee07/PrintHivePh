import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Mail, Calendar } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { motion } from 'motion/react';

export function Profile() {
  const { profile, user, signOut } = useAuth();

  if (!user) return (
    <div className="pt-32 pb-24 px-6 text-center text-gray-500">
       Please sign in to view your profile.
    </div>
  );

  return (
    <main className="pt-40 pb-24 px-6 bg-black min-h-screen flex justify-center">
      <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-xl bg-white/5 border border-white/10 rounded-[40px] overflow-hidden"
      >
         <div className="h-32 bg-gradient-to-r from-[#12A8FF] via-[#FF1493] to-[#A020F0]" />
         <div className="px-10 pb-10">
            <div className="relative -top-12 flex justify-center">
               <img src={user.photoURL || undefined} alt="" className="w-24 h-24 rounded-full border-4 border-black" />
            </div>
            
            <div className="text-center -mt-8 mb-10">
               <h1 className="text-3xl font-extrabold text-white mb-2">{user.displayName}</h1>
               <div className="flex justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest text-[#12A8FF]">
                     Hive Member
                  </span>
                  {profile?.role === 'admin' && (
                    <span className="px-3 py-1 rounded-full bg-[#12A8FF]/20 text-[#12A8FF] text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                       <Shield size={10} /> Authorized Admin
                    </span>
                  )}
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                  <Mail size={20} className="text-gray-500" />
                  <div>
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Address</p>
                     <p className="text-white font-medium">{user.email}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                  <Calendar size={20} className="text-gray-500" />
                  <div>
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Member Since</p>
                     <p className="text-white font-medium">{formatDate(profile?.createdAt)}</p>
                  </div>
               </div>
            </div>

            <button 
               onClick={() => signOut()}
               className="w-full mt-10 py-4 rounded-2xl border border-white/10 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
            >
               <LogOut size={20} /> Sign Out
            </button>
         </div>
      </motion.div>
    </main>
  );
}
