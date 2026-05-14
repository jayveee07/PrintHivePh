import React, { useState, useEffect } from 'react';
import { Hero } from '../sections/Hero';
import { Services } from '../sections/Services';
import { SuppliesOverview } from '../sections/SuppliesOverview';
import { motion } from 'motion/react';
import { CheckCircle2, Zap, ShieldCheck, DollarSign, Palette, ShoppingBag } from 'lucide-react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';

const reasons = [
  { icon: <Zap />, title: 'Fast Turnaround', text: 'Get your orders ready in record time without compromising quality.' },
  { icon: <DollarSign />, title: 'Affordable Pricing', text: 'Premium results at prices that fit your budget perfectly.' },
  { icon: <CheckCircle2 />, title: 'High Quality', text: 'We use the latest printing technology for vibrant and durable results.' },
  { icon: <Palette />, title: 'Creative Designs', text: 'Our team helps bring your most creative visions to life.' },
];

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(3));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setFeaturedProducts(items);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'products');
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <main className="bg-black">
      <Hero />
      <Services />
      <SuppliesOverview />
      
      {/* Why Choose Us */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">Why <span className="text-[#A020F0]">PrintHive</span>?</h2>
            <p className="text-gray-400">Delivering excellence in every drop of ink.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {reasons.map((reason, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#12A8FF]/30 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#12A8FF] to-[#A020F0] flex items-center justify-center text-white mx-auto mb-6 shadow-[0_0_15px_rgba(160,32,240,0.3)]">
                  {reason.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{reason.title}</h3>
                <p className="text-gray-400 text-sm">{reason.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 px-6 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto">
           <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-extrabold text-white mb-4">Featured <span className="text-[#FFC107]">Merch</span></h2>
                <p className="text-gray-400">Popular items from our creative studio.</p>
              </div>
              <Link to="/supplies" className="text-[#12A8FF] font-bold hover:underline">View All Products &rarr;</Link>
           </div>

           {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1, 2, 3].map(i => (
                 <div key={i} className="bg-white/5 rounded-3xl border border-white/10 h-80 animate-pulse" />
               ))}
             </div>
           ) : featuredProducts.length === 0 ? (
             <div className="text-center py-20 text-gray-700 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <ShoppingBag size={64} className="mx-auto mb-6" />
                <p className="font-bold uppercase tracking-widest">Our catalog is coming soon.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((item, idx) => (
                   <motion.div 
                     key={item.id}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: idx * 0.1 }}
                     whileHover={{ y: -10 }}
                     className="group bg-white/5 rounded-3xl border border-white/10 overflow-hidden"
                   >
                      <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center relative overflow-hidden group-hover:p-8 transition-all">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-contain transition-transform duration-700 group-hover:rotate-6 scale-90"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-800">
                             <ShoppingBag size={80} />
                          </div>
                        )}
                      </div>
                      <div className="p-8 border-t border-white/5">
                         <div className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-2">{item.category}</div>
                         <h4 className="text-xl font-bold text-white mb-2 line-clamp-1">{item.name}</h4>
                         <div className="text-[#FFC107] font-black text-lg">{formatCurrency(item.price)}</div>
                      </div>
                   </motion.div>
                ))}
             </div>
           )}
        </div>
      </section>
    </main>
  );
}
