import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Package,
  X,
  CheckCircle,
  XCircle,
  Shirt,
  PanelsTopLeft,
  StickyNote,
  FileText,
  CreditCard,
  ImageIcon,
  Mail,
  Gift
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
import { db } from '../firebase/config';
import { Service } from '../types';
import { toast } from 'react-hot-toast';

const icons = [
  { name: 'shirt', icon: <Shirt size={20} /> },
  { name: 'panels', icon: <PanelsTopLeft size={20} /> },
  { name: 'sticky', icon: <StickyNote size={20} /> },
  { name: 'file', icon: <FileText size={20} /> },
  { name: 'card', icon: <CreditCard size={20} /> },
  { name: 'image', icon: <ImageIcon size={20} /> },
  { name: 'mail', icon: <Mail size={20} /> },
  { name: 'gift', icon: <Gift size={20} /> },
];

const getErrorMessage = (error: any, fallback: string) => {
  if (error?.code === 'permission-denied') {
    return 'Permission denied. You must be an authorized admin.';
  }
  return error?.message || fallback;
};

export function ServicesAdmin() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'printing',
    iconName: 'shirt',
    active: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const q = query(collection(db, 'services'), orderBy('title', 'asc'));
      const querySnapshot = await getDocs(q);
      const serviceData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(serviceData);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast.error(getErrorMessage(error, 'Failed to load services'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      price: parseFloat(formData.price) || 0
    };

    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), data);
        toast.success('Service updated successfully');
      } else {
        await addDoc(collection(db, 'services'), data);
        toast.success('Service added successfully');
      }
      setIsModalOpen(false);
      fetchServices();
      setFormData({ title: '', description: '', price: '', category: 'printing', iconName: 'shirt', active: true });
      setEditingService(null);
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.error(getErrorMessage(error, 'Failed to save service'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      category: service.category,
      iconName: service.iconName,
      active: service.active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await deleteDoc(doc(db, 'services', id));
      toast.success('Service deleted');
      fetchServices();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error(getErrorMessage(error, 'Failed to delete service'));
    }
  };

  const toggleStatus = async (service: Service) => {
    try {
      await updateDoc(doc(db, 'services', service.id), { active: !service.active });
      fetchServices();
      toast.success(`Service ${!service.active ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      console.error('Error updating service status:', error);
      toast.error(getErrorMessage(error, 'Failed to update service'));
    }
  };

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (name: string) => {
    return icons.find(i => i.name === name)?.icon || <Package size={20} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B0F19] border border-white/5 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Service Management</h1>
          <p className="text-gray-500 text-sm">Manage your professional printing and creative services.</p>
        </div>
        <button 
          onClick={() => {
            setEditingService(null);
            setFormData({ title: '', description: '', price: '', category: 'printing', iconName: 'shirt', active: true });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#A020F0] hover:bg-[#8B1AD2] text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(160,32,240,0.3)]"
        >
          <Plus size={20} />
          Add Service
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#A020F0] transition-all"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading && !services.length ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse" />
          ))
        ) : (
          filteredServices.map((s) => (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-[#0B0F19] border border-white/5 p-6 rounded-3xl hover:border-[#A020F0]/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-[#A020F0] group-hover:bg-[#A020F0]/10 transition-all">
                    {getIcon(s.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{s.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 max-w-xs">{s.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                    <span className="font-black text-[#A020F0] text-lg">₱{s.price}</span>
                    <button 
                      onClick={() => toggleStatus(s)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all",
                        s.active ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}
                    >
                      {s.active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {s.active ? 'Active' : 'Inactive'}
                    </button>
                </div>
              </div>
              <div className="h-px bg-white/5 my-6" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">{s.category}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(s)}
                    className="p-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id)}
                    className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0B0F19] border border-white/10 rounded-[32px] w-full max-w-2xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter">
                  {editingService ? 'Edit Service' : 'New Service'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Service Title</label>
                        <input 
                            required
                            type="text" 
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#A020F0] outline-none"
                            placeholder="e.g. Logo Design, T-Shirt Printing"
                        />
                    </div>
                    <div className="space-y-2 col-span-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Description</label>
                        <textarea 
                            required
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#A020F0] outline-none h-24 resize-none"
                            placeholder="Describe what's included..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Base Price (₱)</label>
                        <input 
                            type="number" 
                            required
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#A020F0] outline-none font-black"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Icon</label>
                        <div className="grid grid-cols-4 gap-2">
                            {icons.map(ic => (
                                <button
                                    key={ic.name}
                                    type="button"
                                    onClick={() => setFormData({...formData, iconName: ic.name})}
                                    className={cn(
                                        "p-3 rounded-xl border flex items-center justify-center transition-all",
                                        formData.iconName === ic.name 
                                            ? "bg-[#A020F0] border-[#A020F0] text-white shadow-lg" 
                                            : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                                    )}
                                >
                                    {ic.icon}
                                </button>
                            ))}
                        </div>
                    </div>
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
                    className="flex-1 py-4 rounded-2xl bg-[#A020F0] text-white font-bold hover:bg-[#8B1AD2] transition-all shadow-lg"
                  >
                    {loading ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
