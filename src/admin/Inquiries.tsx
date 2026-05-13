import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Trash2, 
  CheckCircle2, 
  Search,
  Mail,
  User,
  Calendar,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Inquiry } from '../types';
import { formatDate, cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

export function Inquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
      setInquiries(items);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Inquiry['status']) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), { status });
      toast.success(`Marked as ${status}`);
      fetchInquiries();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `inquiries/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      toast.success('Inquiry deleted');
      fetchInquiries();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `inquiries/${id}`);
    }
  };

  const filteredInquiries = inquiries.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#12A8FF]"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading inquiries...</div>
      ) : filteredInquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-600 bg-[#0B0F19] rounded-3xl border border-white/5">
           <Inbox size={60} className="mb-4 opacity-20" />
           <p className="font-medium">No inquiries found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredInquiries.map((inquiry) => (
            <motion.div
              key={inquiry.id}
              layout
              className={cn(
                "p-8 rounded-3xl bg-[#0B0F19] border transition-all",
                inquiry.status === 'unread' ? "border-[#12A8FF]/30 shadow-[0_0_20px_rgba(18,168,255,0.05)]" : "border-white/5 opacity-80"
              )}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap gap-6 items-center">
                    <div className="flex items-center gap-2 text-white font-bold">
                       <User size={16} className="text-[#12A8FF]" />
                       {inquiry.name}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                       <Mail size={16} className="text-[#FF1493]" />
                       {inquiry.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                       <Calendar size={16} className="text-[#A020F0]" />
                       {formatDate(inquiry.createdAt)}
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5",
                      inquiry.status === 'unread' ? "text-[#12A8FF]" : inquiry.status === 'replied' ? "text-[#FFC107]" : "text-green-500"
                    )}>
                      {inquiry.status}
                    </span>
                  </div>

                  <p className="text-gray-300 leading-relaxed bg-white/5 p-6 rounded-2xl italic border border-white/5">
                    "{inquiry.message}"
                  </p>
                </div>

                <div className="flex lg:flex-col gap-3 shrink-0">
                  <button 
                    onClick={() => handleStatusChange(inquiry.id, 'resolved')}
                    className="flex-1 lg:w-40 py-3 rounded-xl bg-green-500/10 text-green-500 font-bold text-sm hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Resolve
                  </button>
                  <button 
                    onClick={() => handleStatusChange(inquiry.id, 'replied')}
                    className="flex-1 lg:w-40 py-3 rounded-xl bg-[#FFC107]/10 text-[#FFC107] font-bold text-sm hover:bg-[#FFC107] hover:text-black transition-all"
                  >
                    Mark Replied
                  </button>
                  <button 
                    onClick={() => handleDelete(inquiry.id)}
                    className="flex-1 lg:w-40 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
