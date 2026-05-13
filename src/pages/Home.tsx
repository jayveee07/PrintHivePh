import React from 'react';
import { Hero } from '../sections/Hero';
import { Services } from '../sections/Services';
import { SuppliesOverview } from '../sections/SuppliesOverview';
import { motion } from 'motion/react';
import { CheckCircle2, Zap, ShieldCheck, DollarSign, Palette } from 'lucide-react';

const reasons = [
  { icon: <Zap />, title: 'Fast Turnaround', text: 'Get your orders ready in record time without compromising quality.' },
  { icon: <DollarSign />, title: 'Affordable Pricing', text: 'Premium results at prices that fit your budget perfectly.' },
  { icon: <CheckCircle2 />, title: 'High Quality', text: 'We use the latest printing technology for vibrant and durable results.' },
  { icon: <Palette />, title: 'Creative Designs', text: 'Our team helps bring your most creative visions to life.' },
];

export function Home() {
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
              <button className="text-[#12A8FF] font-bold hover:underline">View All Products &rarr;</button>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: 'Custom Cotton Tee', price: '₱350.00', img: 'shirts' },
                { name: 'Magic Mug', price: '₱180.00', img: 'mugs' },
                { name: 'Eco Canvas Tote', price: '₱120.00', img: 'totes' },
              ].map((item, idx) => (
                 <motion.div 
                   key={idx}
                   whileHover={{ y: -10 }}
                   className="group bg-white/5 rounded-3xl border border-white/10 overflow-hidden"
                 >
                    <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center p-12 overflow-hidden">
                       <motion.div 
                         whileHover={{ scale: 1.1, rotate: 5 }}
                         className="w-full h-full border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-white/20 text-xl font-bold"
                       >
                          {item.name} Image
                       </motion.div>
                    </div>
                    <div className="p-6">
                       <h4 className="text-xl font-bold text-white mb-1">{item.name}</h4>
                       <div className="text-[#FFC107] font-bold">{item.price}</div>
                    </div>
                 </motion.div>
              ))}
           </div>
        </div>
      </section>
    </main>
  );
}
