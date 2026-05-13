import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Filter,
  Image as ImageIcon,
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
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(items);
    } catch (error) {
       console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        category: product.category,
        imageUrl: product.imageUrl
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(editingProduct ? 'Updating product...' : 'Adding product...');

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        imageUrl: formData.imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated successfully', { id: toastId });
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        toast.success('Product added successfully', { id: toastId });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#12A8FF]"
          />
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3 rounded-xl bg-[#12A8FF] text-white font-bold flex items-center gap-2 hover:shadow-[0_0_20px_rgba(18,168,255,0.4)] transition-all"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Product List */}
      <div className="bg-[#0B0F19] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs text-gray-400 uppercase tracking-widest font-bold">
              <tr>
                <th className="px-8 py-4">Product</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Price</th>
                <th className="px-8 py-4">Stock</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                   <td colSpan={5} className="p-12 text-center text-gray-500">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                   <td colSpan={5} className="p-12 text-center text-gray-500">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                           {product.imageUrl ? (
                             <img src={product.imageUrl || undefined} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <ImageIcon size={20} className="text-gray-700" />
                           )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{product.name}</p>
                          <p className="text-xs text-gray-500 max-w-xs truncate">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-300">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-[#12A8FF]">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <span className={cn(
                            "w-2 h-2 rounded-full",
                            product.stock > 10 ? "bg-green-500" : "bg-red-500"
                          )} />
                          {product.stock}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-2 hover:bg-[#12A8FF]/10 text-[#12A8FF] rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                           onClick={() => handleDelete(product.id)}
                           className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-2xl bg-[#0B0F19] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSubmit}>
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl"><X size={24} /></button>
                </div>

                <div className="p-8 grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm text-gray-500 font-bold uppercase tracking-widest">Product Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-[#12A8FF] outline-none"
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm text-gray-500 font-bold uppercase tracking-widest">Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-[#12A8FF] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-500 font-bold uppercase tracking-widest">Price (₱)</label>
                    <input 
                      type="number" 
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-[#12A8FF] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-500 font-bold uppercase tracking-widest">Initial Stock</label>
                    <input 
                      type="number" 
                      required
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-[#12A8FF] outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-500 font-bold uppercase tracking-widest">Category</label>
                    <select 
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-[#12A8FF] outline-none"
                    >
                      <option value="">Select Category</option>
                      <option value="T-Shirt Printing">T-Shirt Printing</option>
                      <option value="Tarpaulin">Tarpaulin</option>
                      <option value="Stickers & Labels">Stickers & Labels</option>
                      <option value="Business Cards">Business Cards</option>
                      <option value="Office Supplies">Office Supplies</option>
                      <option value="School Supplies">School Supplies</option>
                      <option value="Merchandise">Merchandise</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-500 font-bold uppercase tracking-widest">Image URL</label>
                    <input 
                      type="text" 
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-[#12A8FF] outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="p-8 bg-white/5 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl bg-[#12A8FF] text-white font-bold shadow-[0_0_20px_rgba(18,168,255,0.4)]"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
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
