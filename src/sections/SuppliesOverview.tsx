import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, GraduationCap, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import yellowPad from '../assets/yellowp.png';
import pen from '../assets/pen.png';
import ink from '../assets/ink.png';
import folder from '../assets/folder.png';

const supplyCards = [
  { title: 'Yellow Pad', subtitle: 'Premium Quality', image: yellowPad, y: 20, delay: 0, offset: false },
  { title: 'Vivid Pens', subtitle: 'Smooth Writing', image: pen, y: 40, delay: 0.2, offset: true },
  { title: 'HP Ink', subtitle: 'Genuine Refills', image: ink, y: 20, delay: 0.1, offset: false },
  { title: 'Folder Sets', subtitle: 'Durable Storage', image: folder, y: 40, delay: 0.3, offset: true },
];

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
          {supplyCards.map((card) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: card.y }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: card.delay }}
              className={`group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col justify-end ${card.offset ? 'translate-y-8' : ''}`}
            >
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              <div className="relative z-10">
                <div className="text-white font-bold mb-2">{card.title}</div>
                <div className="text-xs text-gray-300">{card.subtitle}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
