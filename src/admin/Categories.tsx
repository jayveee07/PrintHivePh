import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Tag as TagIcon,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Category } from '../types';
import { toast } from 'react-hot-toast';

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'merchandise' as Category['type']
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      const categoryData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoryData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCategory) {
        await updateDoc(doc(db, 'categories', editingCategory.id), formData);
        toast.success('Category updated successfully');
      } else {
        await addDoc(collection(db, 'categories'), formData);
        toast.success('Category added successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
      setFormData({ name: '', type: 'merchandise' });
      setEditingCategory(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'categories');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B0F19] border border-white/5 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Category Management</h1>
          <p className="text-gray-500 text-sm">Organize your products with custom categories.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', type: 'merchandise' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#12A8FF] hover:bg-[#0070FF] text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(18,168,255,0.3)]"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#12A8FF] transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && !categories.length ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse" />
          ))
        ) : (
          filteredCategories.map((c) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-[#0B0F19] border border-white/5 p-6 rounded-3xl hover:border-[#12A8FF]/50 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-[#12A8FF]/10 group-hover:text-[#12A8FF] transition-all">
                  <TagIcon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{c.type}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(c)}
                  className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(c.id)}
                  className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0B0F19] border border-white/10 rounded-[32px] w-full max-w-lg p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  {editingCategory ? 'Edit Category' : 'New Category'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Category Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#12A8FF] outline-none"
                    placeholder="e.g. T-Shirt Printing, Office Supplies"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Category Type</label>
                  <select 
                    required
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as Category['type']})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#12A8FF] outline-none"
                  >
                    <option value="printing" className="bg-[#0B0F19]">Printing Service</option>
                    <option value="office" className="bg-[#0B0F19]">Office Supplies</option>
                    <option value="school" className="bg-[#0B0F19]">School Supplies</option>
                    <option value="merchandise" className="bg-[#0B0F19]">Merchandise</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 rounded-2xl bg-[#12A8FF] text-white font-bold hover:bg-[#0070FF] transition-all shadow-lg"
                  >
                    {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
