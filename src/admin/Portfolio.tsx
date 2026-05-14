import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { PortfolioItem } from '../types';
import { toast } from 'react-hot-toast';

export function PortfolioManagement() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    imageUrl: ''
  });

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

  const handleOpenModal = (item: PortfolioItem | null = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        imageUrl: item.imageUrl
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const action = editingItem ? 'Updating' : 'Adding';
    const toastId = toast.loading(`${action} portfolio item...`);

    try {
      if (editingItem) {
        await updateDoc(doc(db, 'portfolio', editingItem.id), formData);
      } else {
        await addDoc(collection(db, 'portfolio'), formData);
      }
      toast.success('Gallery updated!', { id: toastId });
      setIsModalOpen(false);
      fetchPortfolio();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'portfolio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this work from portfolio?')) return;
    try {
      await deleteDoc(doc(db, 'portfolio', id));
      toast.success('Removed from gallery');
      fetchPortfolio();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `portfolio/${id}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <h3 className="text-xl font-bold">Gallery Management</h3>
         <button
           onClick={() => handleOpenModal()}
           className="px-6 py-3 rounded-xl bg-[#A020F0] text-white font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(160,32,240,0.4)] transition-all"
         >
           <Plus size={20} /> Add Work
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-gray-500 italic uppercase tracking-widest">Opening Gallery...</div>
        ) : items.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-600 bg-white/5 border border-white/5 rounded-[40px]">No portfolio items found.</div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              className="group relative rounded-3xl bg-[#0B0F19] border border-white/5 overflow-hidden transition-all hover:border-[#A020F0]/50"
            >
              <div className="aspect-square bg-white/5 relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl || undefined} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-800"><ImageIcon size={40} /></div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                   <button onClick={() => handleOpenModal(item)} className="w-10 h-10 rounded-xl bg-[#A020F0] text-white flex items-center justify-center shadow-lg"><Edit2 size={18} /></button>
                   <button onClick={() => handleDelete(item.id)} className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="p-4">
                 <span className="text-[10px] font-black uppercase text-[#A020F0] tracking-widest">{item.category || 'General'}</span>
                 <h4 className="font-bold text-white truncate">{item.title}</h4>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-lg bg-[#0B0F19] rounded-[40px] border border-white/10 overflow-hidden shadow-2xl">
               <form onSubmit={handleSubmit}>
                 <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-2xl font-bold">Manage Work</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl"><X size={24} /></button>
                 </div>
                 <div className="p-8 space-y-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Title</label>
                       <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#A020F0] outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Category</label>
                       <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#A020F0] outline-none">
                          <option value="" className="bg-[#0B0F19] text-white">Select Category</option>
                          <option value="T-Shirts" className="bg-[#0B0F19] text-white">T-Shirts</option>
                          <option value="Tarp" className="bg-[#0B0F19] text-white">Tarp</option>
                          <option value="Stickers" className="bg-[#0B0F19] text-white">Stickers</option>
                          <option value="Merch" className="bg-[#0B0F19] text-white">Merch</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Description</label>
                       <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#A020F0] outline-none resize-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Image URL</label>
                       <input type="text" required value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#A020F0] outline-none" />
                    </div>
                 </div>
                 <div className="p-8 bg-white/5 flex gap-4">
                    <button type="submit" className="w-full py-5 rounded-[20px] bg-[#A020F0] text-white font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(160,32,240,0.3)] hover:scale-105 transition-all">Save Project</button>
                 </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
