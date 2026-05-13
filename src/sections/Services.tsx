import React from 'react';
import { Shirt, Image as ImageIcon, StickyNote, FileText, CreditCard, PanelsTopLeft, Mail, Gift } from 'lucide-react';
import { motion } from 'motion/react';

const services = [
  { icon: <Shirt size={32} />, title: 'T-Shirt Printing', desc: 'Custom designs on premium cotton tees.', color: '#12A8FF' },
  { icon: <PanelsTopLeft size={32} />, title: 'Tarpaulin', desc: 'Large format printing for events and ads.', color: '#FF1493' },
  { icon: <StickyNote size={32} />, title: 'Stickers & Labels', desc: 'Durable, vibrant, and perfectly cut.', color: '#A020F0' },
  { icon: <FileText size={32} />, title: 'Flyers & Brochures', desc: 'High-quality prints to market your business.', color: '#38BDF8' },
  { icon: <CreditCard size={32} />, title: 'Business Cards', desc: 'Make a lasting first impression.', color: '#FFC107' },
  { icon: <ImageIcon size={32} />, title: 'Acrylic Signage', desc: 'Modern and elegant office branding.', color: '#12A8FF' },
  { icon: <Mail size={32} />, title: 'Invitations', desc: 'Special designs for your special events.', color: '#FF1493' },
  { icon: <Gift size={32} />, title: 'Custom Merchandise', desc: 'Mugs, totes, posters, and more.', color: '#A020F0' },
];

export function Services() {
  return (
    <section className="py-24 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-white mb-6"
          >
            Our <span className="text-[#12A8FF]">Services</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            We offer a wide range of printing solutions tailored to your needs. From personal gifts to corporate branding.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all overflow-hidden"
            >
              {/* Highlight line */}
              <div 
                className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: service.color }}
              />
              
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:scale-110"
                style={{ color: service.color, backgroundColor: `${service.color}15` }}
              >
                {service.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {service.desc}
              </p>
              
              {/* Decorative glow */}
              <div 
                className="absolute -bottom-10 -right-10 w-24 h-24 blur-3xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: service.color }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
