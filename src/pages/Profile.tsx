import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Mail, Calendar, Package, Clock } from 'lucide-react';
import { formatDate, formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Order } from '../types';

export function Profile() {
  const { profile, user, signOut } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      // Query orders by email (since that's what we have)
      const q = query(
        collection(db, 'orders'), 
        where('email', '==', user?.email),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setRecentOrders(items);
    } catch (error) {
      console.error('Error fetching my orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!user) return (
    <div className="pt-32 pb-24 px-6 text-center text-gray-500">
       Please sign in to view your profile.
    </div>
  );

  return (
    <main className="pt-32 pb-24 px-6 bg-black min-h-screen flex justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Sidebar */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="lg:col-span-1"
        >
          <div className="bg-white/5 border border-white/10 rounded-[40px] overflow-hidden sticky top-32">
            <div className="h-24 bg-gradient-to-r from-[#12A8FF] via-[#FF1493] to-[#A020F0]" />
            <div className="px-8 pb-8">
                <div className="relative -top-8 flex justify-center">
                  <img src={user.photoURL || undefined} alt="" className="w-20 h-20 rounded-full border-4 border-black" />
                </div>
                
                <div className="text-center -mt-6 mb-8">
                  <h1 className="text-2xl font-extrabold text-white mb-2">{user.displayName}</h1>
                  <div className="flex flex-col items-center gap-2">
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

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                      <Mail size={16} className="text-gray-500" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">{user.email}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                      <Calendar size={16} className="text-gray-500" />
                      <div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Joined</p>
                        <p className="text-white text-xs font-medium">{formatDate(profile?.createdAt)}</p>
                      </div>
                  </div>
                </div>

                <button 
                  onClick={() => signOut()}
                  className="w-full mt-8 py-3 rounded-xl border border-white/10 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={16} /> Sign Out
                </button>
            </div>
          </div>
        </motion.div>

        {/* Recent Orders section */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="lg:col-span-2 space-y-6"
        >
          <div className="p-8 rounded-[40px] bg-white/5 border border-white/10 h-full">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-xl bg-[#FF1493]/10 flex items-center justify-center text-[#FF1493]">
                  <Package size={20} />
               </div>
               <h2 className="text-2xl font-bold text-white">My Recent Orders</h2>
            </div>

            {loadingOrders ? (
               <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                  ))}
               </div>
            ) : recentOrders.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-gray-600 bg-black/40 rounded-3xl border border-dashed border-white/5">
                  <Clock size={48} className="mb-4 opacity-10" />
                  <p className="font-bold uppercase tracking-widest text-xs">No orders found.</p>
                  <Link to="/supplies" className="mt-4 text-[#12A8FF] text-sm font-bold hover:underline">Start Shopping &rarr;</Link>
               </div>
            ) : (
               <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div 
                      key={order.id}
                      className="p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                           <span className="text-xs font-mono text-[#12A8FF] font-bold">#ORD-{order.id.slice(0, 8)}</span>
                           <h3 className="text-white font-bold">{order.items.length} items ordered</h3>
                           <p className="text-[10px] text-gray-500 uppercase tracking-widest">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                           <div className="text-lg font-black text-white">{formatCurrency(order.total)}</div>
                           <span className={cn(
                             "inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                             order.status === 'completed' ? "bg-green-500/10 text-green-500" : "bg-[#FFC107]/10 text-[#FFC107]"
                           )}>
                              {order.status}
                           </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                         {order.items.map((item, idx) => (
                           <span key={idx} className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400">
                             {item.quantity}x {item.name}
                           </span>
                         ))}
                      </div>
                    </div>
                  ))}
               </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

// Dummy Link component just in case React Router Link is needed
import { Link } from 'react-router-dom';
