import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, GraduationCap, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SuppliesOverview() {
  return (
    <section className="py-24 px-6 bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
           initial={{ opacity: 0, x: -30 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            More Than Just <span className="text-[#FF1493]">Printing</span>.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            We provide a complete range of office and school supplies to keep you productive and inspired. Whether you're a student or a business professional, we've got you covered.
          </p>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#12A8FF]/10 flex items-center justify-center text-[#12A8FF] shrink-0">
                <Building2 size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Office Essentials</h4>
                <p className="text-gray-500 text-sm">Bond paper, ink, folders, and high-quality pens.</p>
              </div>
            </div>
            <div className="flex gap-4">
               <div className="w-12 h-12 rounded-lg bg-[#FF1493]/10 flex items-center justify-center text-[#FF1493] shrink-0">
                <GraduationCap size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">School Materials</h4>
                <p className="text-gray-500 text-sm">Art supplies, pads, index cards, and coloring kits.</p>
              </div>
            </div>
          </div>
          
          <Link 
            to="/supplies"
            className="inline-flex items-center gap-2 text-[#12A8FF] font-bold hover:gap-4 transition-all"
          >
            Browse Supplies Catalog <ShoppingCart size={20} />
          </Link>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="aspect-[4/5] bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 p-6 flex flex-col justify-end"
          >
             <div className="text-white font-bold mb-2">Yellow Pad</div>
             <div className="text-xs text-gray-500">Premium Quality</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="aspect-[4/5] bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 p-6 flex flex-col justify-end translate-y-8"
          >
             <div className="text-white font-bold mb-2">Vivid Pens</div>
             <div className="text-xs text-gray-500">Smooth Writing</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="aspect-[4/5] bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 p-6 flex flex-col justify-end"
          >
             <div className="text-white font-bold mb-2">HP Ink</div>
             <div className="text-xs text-gray-500">Genuine Refills</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="aspect-[4/5] bg-gradient-to-br from-white/5 to-white/0 rounded-2xl border border-white/10 p-6 flex flex-col justify-end translate-y-8"
          >
             <div className="text-white font-bold mb-2">Folder Sets</div>
             <div className="text-xs text-gray-500">Durable Storage</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
