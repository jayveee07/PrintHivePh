import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, ShoppingBag, Filter, ChevronRight } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';

export function Supplies() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchSupplies();
  }, [activeCategory]);

  const fetchSupplies = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // Filter only for supplies categories
      const supplyItems = items.filter(p => p.category.includes('Supplies'));
      setProducts(supplyItems);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'products');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Office Supplies', 'School Supplies'];

  const filteredProducts = products.filter(p => 
     (activeCategory === 'All' || p.category === activeCategory) &&
     (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="pt-32 pb-24 px-6 bg-[#06080E] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16">
          <motion.h1 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="text-5xl font-extrabold text-white mb-6"
          >
            Essentials <span className="text-[#FF1493]">Catalog</span>
          </motion.h1>
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
             <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-none">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border",
                      activeCategory === cat 
                        ? "bg-[#FF1493] border-[#FF1493] text-white shadow-[0_0_20px_rgba(255,20,147,0.3)]" 
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                    )}
                  >
                    {cat}
                  </button>
                ))}
             </div>
             
             <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#FF1493] transition-all"
                />
             </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Scanning inventory...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-600 bg-white/5 rounded-[40px] border border-white/5">
             <ShoppingBag size={64} className="mx-auto mb-6 opacity-20" />
             <p className="text-xl font-bold">No supplies found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-[#0B0F19] rounded-[32px] border border-white/5 overflow-hidden hover:border-[#FF1493]/30 transition-all hover:shadow-[0_0_30px_rgba(255,20,147,0.05)]"
              >
                <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent p-10 flex items-center justify-center relative">
                   {product.imageUrl ? (
                     <img src={product.imageUrl || undefined} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                   ) : (
                     <ShoppingBag size={60} className="text-gray-800" />
                   )}
                   <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                      {product.category}
                   </div>
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-[#FF1493] transition-colors">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2">{product.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-white">{formatCurrency(product.price)}</span>
                    <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-[#FF1493] transition-all group-hover:rotate-12">
                       <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
