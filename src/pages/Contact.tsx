import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { toast } from 'react-hot-toast';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Sending message...');

    try {
      await addDoc(collection(db, 'inquiries'), {
        ...formData,
        status: 'unread',
        createdAt: serverTimestamp()
      });
      toast.success('Message sent! We will get back to you soon.', { id: toastId });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'inquiries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-32 pb-24 px-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">Get in <span className="text-[#12A8FF]">Touch</span></h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Have a question or a special project in mind? We're here to help you bring it to life.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-[#12A8FF]/10 flex items-center justify-center text-[#12A8FF] mb-6">
                     <Mail size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Email Us</h3>
                  <p className="text-gray-500 text-sm">hello@printhiveph.com</p>
               </div>
               <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF1493]/10 flex items-center justify-center text-[#FF1493] mb-6">
                     <Phone size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Call Us</h3>
                  <p className="text-gray-500 text-sm">+(63) 912 345 6789</p>
               </div>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
               <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-[#A020F0]/10 flex items-center justify-center text-[#A020F0] shrink-0">
                     <MapPin size={24} />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-white mb-2">Visit Our Studio</h3>
                     <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        123 Printing Ave, Creative District<br />
                        Manila, Philippines 1000
                     </p>
                     <div className="w-full h-48 bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                        {/* Placeholder for Google Maps */}
                        <div className="w-full h-full flex items-center justify-center text-gray-700 italic text-sm">
                           Google Maps Embed
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
               <button className="flex-1 py-4 rounded-2xl bg-[#12A8FF]/10 text-[#12A8FF] font-bold flex items-center justify-center gap-3 hover:bg-[#12A8FF] hover:text-white transition-all">
                  <MessageCircle size={20} /> Messenger
               </button>
               <button className="flex-1 py-4 rounded-2xl bg-[#FF1493]/10 text-[#FF1493] font-bold flex items-center justify-center gap-3 hover:bg-[#FF1493] hover:text-white transition-all">
                  <Mail size={20} /> Gmail
               </button>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
             className="p-10 rounded-[40px] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-xl shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white mb-8">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-[#12A8FF] transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-[#FF1493] transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Message</label>
                <textarea 
                  rows={5}
                  required
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-[#A020F0] transition-all resize-none"
                  placeholder="Tell us about your project..."
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#12A8FF] to-[#A020F0] text-white font-black text-lg shadow-[0_0_25px_rgba(18,168,255,0.3)] hover:shadow-[0_0_40px_rgba(18,168,255,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                Send Hive Message <Send size={22} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
