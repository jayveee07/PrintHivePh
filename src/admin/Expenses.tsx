import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, TrendingDown, Calendar, Tag, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Expense } from '../types';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ description: '', amount: '', category: '' });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(data);
    } catch (error) {
       console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading('Recording expense...');
    try {
      await addDoc(collection(db, 'expenses'), {
        ...formData,
        amount: parseFloat(formData.amount),
        date: serverTimestamp()
      });
      toast.success('Expense recorded', { id: tid });
      setIsModalOpen(false);
      setFormData({ description: '', amount: '', category: '' });
      fetchExpenses();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'expenses');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this expense record?')) return;
    try {
      await deleteDoc(doc(db, 'expenses', id));
      toast.success('Record removed');
      fetchExpenses();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `expenses/${id}`);
    }
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 p-10 rounded-[40px] bg-[#0B0F19] border border-white/5">
            <div className="flex justify-between items-center mb-10">
               <h3 className="text-xl font-bold">Expense Ledger</h3>
               <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 rounded-xl bg-red-500/20 text-red-500 border border-red-500/20 font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                  <Plus size={20} /> Add Expense
               </button>
            </div>

            <div className="space-y-4">
               {loading ? (
                 <div className="text-center py-10 text-gray-600">Calculating costs...</div>
               ) : expenses.length === 0 ? (
                 <div className="text-center py-10 text-gray-600">No expenses recorded yet.</div>
               ) : (
                 expenses.map((expense) => (
                   <div key={expense.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                            <TrendingDown size={24} />
                         </div>
                         <div>
                            <h4 className="font-bold text-white uppercase text-sm tracking-widest">{expense.description}</h4>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                               <Tag size={12} /> {expense.category} • <Calendar size={12} /> {formatDate(expense.date)}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-lg font-black text-white">{formatCurrency(expense.amount)}</div>
                         <button onClick={() => handleDelete(expense.id)} className="p-2 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                      </div>
                   </div>
                 ))
               )}
            </div>
         </div>

         <div className="p-10 rounded-[40px] bg-red-500/10 border border-red-500/20 h-fit">
            <h3 className="text-sm font-black text-red-500 uppercase tracking-[4px] mb-8">Summary</h3>
            <div className="space-y-8">
               <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total Expenditures</p>
                  <p className="text-4xl font-black text-white">{formatCurrency(totalExpenses)}</p>
               </div>
               <div className="h-px bg-red-500/20" />
               <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Inventory</span>
                     <span className="text-white font-bold">{formatCurrency(totalExpenses * 0.6)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Operations</span>
                     <span className="text-white font-bold">{formatCurrency(totalExpenses * 0.3)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                     <span className="text-gray-500">Others</span>
                     <span className="text-white font-bold">{formatCurrency(totalExpenses * 0.1)}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-[#0B0F19] rounded-[40px] border border-white/10 overflow-hidden">
               <form onSubmit={handleSubmit}>
                  <div className="p-8 border-b border-white/5 flex items-center justify-between">
                     <h3 className="text-2xl font-bold text-red-500">Record Outflow</h3>
                     <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl"><X size={24} /></button>
                  </div>
                  <div className="p-8 space-y-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Description</label>
                        <input type="text" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-red-500 outline-none" placeholder="e.g. Printer Ink Restock" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Amount (₱)</label>
                        <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-red-500 outline-none" placeholder="0.00" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Category</label>
                        <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-red-500 outline-none">
                           <option value="">Select Category</option>
                           <option value="Inventory">Inventory</option>
                           <option value="Operations">Operations</option>
                           <option value="Rent">Rent</option>
                           <option value="Marketing">Marketing</option>
                           <option value="Others">Others</option>
                        </select>
                     </div>
                  </div>
                  <div className="p-8 bg-white/5">
                     <button type="submit" className="w-full py-5 rounded-[20px] bg-red-500 text-white font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(239,68,68,0.3)]">Post Expense</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
