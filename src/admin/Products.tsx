import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Filter,
  Image as ImageIcon,
  X,
  Barcode as BarcodeIcon,
  RefreshCw,
  PlusCircle as PlusCircleIcon,
  Scan,
  Package,
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';
import Barcode from 'react-barcode';
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
  orderBy,
  increment
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Product, Category } from '../types';
import { formatCurrency, cn, playScannerBeep } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../firebase/logger';

export function ProductManagement() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'stock' | 'price'>('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quickUpdateProduct, setQuickUpdateProduct] = useState<Product | null>(null);
  const [quickUpdateAmount, setQuickUpdateAmount] = useState('1');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: '',
    barcode: ''
  });

  // Keyboard Barcode Scanner Hook
  useBarcodeScanner((code) => {
    playScannerBeep();
    
    // If modal is open, update barcode field
    if (isModalOpen) {
      setFormData(prev => ({ ...prev, barcode: code }));
      toast.success('Barcode scanned to form');
      return;
    }

    // Find existing product
    const product = products.find(p => p.barcode === code);
    if (product) {
      setQuickUpdateProduct(product);
      setQuickUpdateAmount('1');
      toast.success(`Product detected: ${product.name}`);
    } else {
      // If not found, open new product modal with this barcode
      handleOpenModal(null);
      setFormData(prev => ({ ...prev, barcode: code }));
      toast.success('New barcode! Add this product.');
    }
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(items);
    } catch (error) {
       console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(items);
    } catch (error) {
       handleFirestoreError(error, OperationType.GET, 'products');
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
        imageUrl: product.imageUrl,
        barcode: product.barcode || ''
      });
    } else {
      setEditingProduct(null);
      // Auto-generate barcode for new product
      const newBarcode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: '',
        barcode: newBarcode
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const priceVal = parseFloat(formData.price);
    const stockVal = parseInt(formData.stock);
    
    if (isNaN(priceVal) || priceVal < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (isNaN(stockVal) || stockVal < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    const toastId = toast.loading(editingProduct ? 'Updating product...' : 'Adding product...');

    try {
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: priceVal,
        stock: stockVal,
        category: formData.category,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1586075010633-2442cf3ca701?auto=format&fit=crop&q=80&w=800', // Fallback image
        barcode: formData.barcode,
        updatedAt: serverTimestamp(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        await logActivity(user, 'PRODUCT_UPDATE', `Updated product: ${formData.name}`, editingProduct.id, 'product');
        toast.success('Product updated successfully', { id: toastId });
      } else {
        const docRef = await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        await logActivity(user, 'PRODUCT_CREATE', `Created product: ${formData.name}`, docRef.id, 'product');
        toast.success('Product added successfully', { id: toastId });
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      let errorMsg = 'Failed to save product';
      
      // Try to parse JSON error from handleFirestoreError if it looks like one
      try {
        if (error.message && error.message.startsWith('{')) {
          const errInfo = JSON.parse(error.message);
          errorMsg = `Error: ${errInfo.error}`;
        } else if (error.code === 'permission-denied') {
          errorMsg = 'Permission denied. You must be an authorized admin.';
        }
      } catch (e) {
        // Fallback to error message
        errorMsg = error.message || 'An unexpected error occurred';
      }
      
      toast.error(errorMsg, { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!confirm(`Are you sure you want to delete ${product?.name}?`)) return;
    
    try {
      await deleteDoc(doc(db, 'products', id));
      await logActivity(user, 'PRODUCT_DELETE', `Deleted product: ${product?.name}`, id, 'product');
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const handleQuickStockUpdate = async (id: string, amount: number) => {
    const product = products.find(p => p.id === id);
    try {
      await updateDoc(doc(db, 'products', id), {
        stock: increment(amount),
        updatedAt: serverTimestamp()
      });
      await logActivity(user, 'STOCK_UPDATE', `Updated stock for ${product?.name}: +${amount}`, id, 'product');
      toast.success(`Stock updated (+${amount})`);
      fetchProducts();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  const generateBarcode = () => {
    const randomCode = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setFormData(prev => ({ ...prev, barcode: randomCode }));
  };

  const handleBarcodeScan = (code: string) => {
    setIsScannerOpen(false);
    playScannerBeep();
    
    const product = products.find(p => p.barcode === code);
    if (product) {
      setQuickUpdateProduct(product);
      setQuickUpdateAmount('1');
      toast.success(`Product detected: ${product.name}`);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        imageUrl: '',
        barcode: code
      });
      setIsModalOpen(true);
      toast.success('New barcode! Add this product.');
    }
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.barcode && p.barcode.includes(searchTerm));
      
      const matchesStock = filterLowStock ? p.stock <= 10 : true;
      
      return matchesSearch && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock') return a.stock - b.stock;
      if (sortBy === 'price') return a.price - b.price;
      return 0; // Default newest (already sorted by fetch)
    });

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, category or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#12A8FF] text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0B0F19] border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-gray-400 focus:outline-none outline-none focus:border-[#12A8FF]"
            >
              <option value="newest">Newest First</option>
              <option value="name">Sort by Name</option>
              <option value="stock">Low Stock First</option>
              <option value="price">Price (Low to High)</option>
            </select>

            <button
               onClick={() => setFilterLowStock(!filterLowStock)}
               className={cn(
                 "px-4 py-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all",
                 filterLowStock 
                  ? "bg-red-500/10 border-red-500/50 text-red-500" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
               )}
            >
               <AlertTriangle size={14} /> Low Stock Only
            </button>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title="Camera Scan"
            >
              <Scan size={20} />
            </button>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="w-full xl:w-auto px-8 py-4 rounded-2xl bg-[#12A8FF] text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(18,168,255,0.3)] transition-all active:scale-95"
        >
          <Plus size={18} /> New Product
        </button>
      </div>

      {/* Product List */}
      <div className="bg-[#0B0F19] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.02] text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black">
              <tr>
                <th className="px-8 py-6">Product Insight</th>
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Asset Value</th>
                <th className="px-8 py-6">Inventory Status</th>
                <th className="px-8 py-6 text-right">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                   <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-gray-600">
                         <RefreshCw className="animate-spin" size={32} />
                         <span className="font-black uppercase tracking-widest text-xs">Accessing Inventory...</span>
                      </div>
                   </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                   <td colSpan={6} className="p-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-gray-600">
                         <ShoppingBag size={32} />
                         <span className="font-black uppercase tracking-widest text-xs">No Results in the Hive</span>
                      </div>
                   </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:border-white/10 transition-all">
                           {product.imageUrl ? (
                             <img src={product.imageUrl || undefined} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           ) : (
                             <Package size={24} className="text-gray-700" />
                           )}
                        </div>
                        <div className="max-w-[200px]">
                          <p className="font-black text-white text-base tracking-tight leading-tight">{product.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate mt-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {product.barcode ? (
                        <div className="flex flex-col gap-1 items-start scale-90 origin-left opacity-30 group-hover:opacity-100 transition-opacity">
                          <Barcode 
                            value={product.barcode} 
                            width={1.2} 
                            height={25} 
                            fontSize={10} 
                            background="transparent" 
                            lineColor="#ffffff" 
                            text={product.barcode}
                          />
                        </div>
                      ) : (
                        <span className="text-gray-600 text-[10px] font-black uppercase">Uncoded</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-lg text-white">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                               "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]",
                               product.stock > 10 ? "text-green-500 bg-green-500" : "text-red-500 bg-red-500 animate-pulse"
                             )} />
                             <span className="font-black text-base text-white">{product.stock}</span>
                             {product.stock <= 10 && (
                               <span className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">LOW</span>
                             )}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                            <button 
                              onClick={() => handleQuickStockUpdate(product.id, 10)}
                              className="px-2 py-1 bg-white/5 border border-white/5 text-gray-500 rounded-lg text-[10px] font-black hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/20 transition-all"
                            >
                              +10
                            </button>
                            <button 
                              onClick={() => handleQuickStockUpdate(product.id, 50)}
                              className="px-2 py-1 bg-white/5 border border-white/5 text-gray-500 rounded-lg text-[10px] font-black hover:bg-green-500/10 hover:text-green-500 hover:border-green-500/20 transition-all"
                            >
                              +50
                            </button>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="w-10 h-10 flex items-center justify-center bg-[#12A8FF]/5 text-[#12A8FF] rounded-xl border border-[#12A8FF]/10 hover:bg-[#12A8FF] hover:text-white transition-all transform hover:-translate-y-1"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                           onClick={() => handleDelete(product.id)}
                           className="w-10 h-10 flex items-center justify-center bg-red-500/5 text-red-500 rounded-xl border border-red-500/10 hover:bg-red-500 hover:text-white transition-all transform hover:-translate-y-1"
                        >
                          <Trash2 size={16} />
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
                    <label className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                       {editingProduct ? 'Current Stock' : 'Initial Stock'}
                    </label>
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
                      className="w-full bg-[#0B0F19] border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#12A8FF] outline-none"
                    >
                      <option value="" className="bg-[#0B0F19] text-white">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name} className="bg-[#0B0F19] text-white">
                          {cat.name}
                        </option>
                      ))}
                      {categories.length === 0 && (
                        <>
                          <option value="T-Shirt Printing" className="bg-[#0B0F19] text-white">T-Shirt Printing</option>
                          <option value="Tarpaulin" className="bg-[#0B0F19] text-white">Tarpaulin</option>
                          <option value="Stickers & Labels" className="bg-[#0B0F19] text-white">Stickers & Labels</option>
                          <option value="Business Cards" className="bg-[#0B0F19] text-white">Business Cards</option>
                          <option value="Office Supplies" className="bg-[#0B0F19] text-white">Office Supplies</option>
                          <option value="School Supplies" className="bg-[#0B0F19] text-white">School Supplies</option>
                          <option value="Merchandise" className="bg-[#0B0F19] text-white">Merchandise</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-500 font-bold uppercase tracking-widest">Barcode</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <BarcodeIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                          type="text" 
                          value={formData.barcode}
                          onChange={e => setFormData({...formData, barcode: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-[#12A8FF] outline-none"
                          placeholder="Unique code..."
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={generateBarcode}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        title="Generate random code"
                      >
                        <RefreshCw size={18} />
                      </button>
                    </div>
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
      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner 
          onScan={handleBarcodeScan} 
          onClose={() => setIsScannerOpen(false)} 
        />
      )}

      {/* Quick Stock Update Modal (for USB Scanner) */}
      <AnimatePresence>
        {quickUpdateProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickUpdateProduct(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1A1F2B] rounded-[32px] border border-white/10 shadow-3xl overflow-hidden p-8"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-[#12A8FF]/10 flex items-center justify-center text-[#12A8FF] mb-6">
                   {quickUpdateProduct.imageUrl ? (
                     <img src={quickUpdateProduct.imageUrl} alt="" className="w-full h-full object-cover rounded-3xl" />
                   ) : (
                     <Package size={40} />
                   )}
                </div>
                <h3 className="text-xl font-bold mb-2">{quickUpdateProduct.name}</h3>
                <p className="text-sm text-gray-400 mb-8 font-mono">CODE: {quickUpdateProduct.barcode}</p>

                <div className="w-full space-y-6">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Current Stock</span>
                    <span className="text-2xl font-black text-white">{quickUpdateProduct.stock}</span>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest block text-left">Quantity Added</label>
                    <div className="flex gap-2">
                       <input 
                         autoFocus
                         type="number"
                         value={quickUpdateAmount}
                         onChange={(e) => setQuickUpdateAmount(e.target.value)}
                         className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-2xl font-black text-white focus:border-[#12A8FF] outline-none text-center"
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setQuickUpdateProduct(null)}
                      className="py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        const amount = parseInt(quickUpdateAmount);
                        if (!isNaN(amount)) {
                          await handleQuickStockUpdate(quickUpdateProduct.id, amount);
                          setQuickUpdateProduct(null);
                        }
                      }}
                      className="py-4 rounded-2xl bg-[#12A8FF] text-white font-bold shadow-[0_0_20px_rgba(18,168,255,0.4)]"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
