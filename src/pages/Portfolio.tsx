import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { PortfolioItem } from '../types';
import { Briefcase, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const q = query(collection(db, 'portfolio'), orderBy('title', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
      setItems(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'T-Shirts', 'Tarp', 'Stickers', 'Merch'];
  
  const filteredItems = items.filter(i => activeTab === 'All' || i.category === activeTab);

  return (
    <main className="pt-32 pb-24 px-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-8"
          >
            Built at the <span className="text-[#A020F0]">Hive</span>
          </motion.h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10">A showcase of our best prints and creative collaborations.</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={cn(
                  "px-8 py-3 rounded-full text-sm font-bold transition-all",
                  activeTab === cat 
                    ? "bg-[#A020F0] text-white shadow-[0_0_20px_rgba(160,32,240,0.4)]" 
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Opening the gallery...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-gray-600 border border-white/5 bg-white/5 rounded-[40px]">
             <Briefcase size={64} className="mx-auto mb-6 opacity-20" />
             <p className="font-bold">Our showcase is currently being updated. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative rounded-[40px] overflow-hidden bg-[#0B0F19] border border-white/10 aspect-square"
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl || undefined} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-800 italic">Work Preview</div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-10">
                   <span className="text-xs font-black uppercase text-[#A020F0] mb-2 tracking-[4px]">{item.category}</span>
                   <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                   <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                </div>
                
                <div className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all group-hover:rotate-12 translate-y-4 group-hover:translate-y-0">
                   <Maximize2 size={24} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
