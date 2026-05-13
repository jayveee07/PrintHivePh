import React from 'react';
import { motion } from 'motion/react';
import { Shirt, Image as ImageIcon, StickyNote, FileText, CreditCard, PanelsTopLeft, Mail, Gift, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const fullServices = [
  { icon: <Shirt size={40} />, title: 'T-Shirt Printing', desc: 'Custom designs on premium cotton tees using high-quality DTF or vinyl.', category: 'printing' },
  { icon: <PanelsTopLeft size={40} />, title: 'Tarpaulin', desc: 'Large format printing for events, banners, and billboard advertisements.', category: 'printing' },
  { icon: <StickyNote size={40} />, title: 'Stickers & Labels', desc: 'Durable, waterproof, and vibrant stickers for branding and packaging.', category: 'printing' },
  { icon: <FileText size={40} />, title: 'Flyers & Brochures', desc: 'Professional marketing materials to boost your brand visibility.', category: 'printing' },
  { icon: <CreditCard size={40} />, title: 'Business Cards', desc: 'Modern card designs that make a lasting first impression.', category: 'printing' },
  { icon: <ImageIcon size={40} />, title: 'Acrylic Signage', desc: 'Premium laser-cut acrylic signs for offices and store decorations.', category: 'printing' },
  { icon: <Mail size={40} />, title: 'Invitations', desc: 'Exquisite designs for weddings, birthdays, and special events.', category: 'printing' },
  { icon: <Gift size={40} />, title: 'Custom Merchandise', desc: 'Personalized mugs, tote bags, pillows, and more creative gifts.', category: 'printing' },
];

export function Services() {
  return (
    <main className="pt-32 pb-24 px-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-8"
          >
            Creative <span className="text-[#12A8FF]">Solutions</span>
          </motion.h1>
          <p className="text-gray-400 max-w-2xl mx-auto">From concept to final print, we help you communicate your identity with clarity and punch.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {fullServices.map((service, idx) => (
             <motion.div
               key={idx}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="group p-10 rounded-[40px] bg-[#0B0F19] border border-white/5 hover:border-[#12A8FF]/50 transition-all flex flex-col items-center text-center"
             >
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-[#12A8FF] mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-gray-500 mb-10 leading-relaxed">{service.desc}</p>
                <Link 
                  to="/contact"
                  className="mt-auto px-6 py-3 rounded-full border border-[#12A8FF]/30 text-[#12A8FF] text-sm font-bold flex items-center gap-2 hover:bg-[#12A8FF] hover:text-white transition-all"
                >
                  Request Quote <ArrowRight size={16} />
                </Link>
             </motion.div>
           ))}
        </div>

        {/* Process Section */}
        <section className="mt-32 p-12 lg:p-20 rounded-[60px] bg-gradient-to-br from-white/5 to-transparent border border-white/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-[#12A8FF]/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                 <h2 className="text-4xl font-extrabold text-white mb-6">Our Workflow</h2>
                 <p className="text-gray-400 mb-12">We've streamlined our process to ensure you get the best results with minimum friction.</p>
                 <div className="space-y-10">
                    {[
                      { n: '01', t: 'Vision Capture', d: 'Send us your design or work with our artists to create one.' },
                      { n: '02', t: 'Precision Printing', d: 'We use high-end equipment to print your vision with accuracy.' },
                      { n: '03', t: 'Ready for Flight', d: 'Quality check and packing for pickup or delivery.' },
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-6">
                        <span className="text-4xl font-black text-white/10">{step.n}</span>
                        <div>
                          <h4 className="text-xl font-bold text-white mb-2">{step.t}</h4>
                          <p className="text-sm text-gray-500 leading-relaxed">{step.d}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="aspect-square bg-black rounded-[40px] border border-white/10 flex items-center justify-center p-10">
                 <div className="w-full h-full border-4 border-dashed border-[#12A8FF]/30 rounded-[30px] flex items-center justify-center text-gray-800 italic">
                    Quality Process Visual
                 </div>
              </div>
           </div>
        </section>
      </div>
    </main>
  );
}
