import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  X,
  PlusCircle,
  Printer,
  ChevronRight,
  ShoppingCart,
  ShoppingBag,
  Maximize2,
  Scan,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, getDocs, addDoc, serverTimestamp, updateDoc, doc, increment, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Product, CartItem, Transaction, Service, Category } from '../types';
import { formatCurrency, cn, playScannerBeep } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { Receipt } from '../components/Receipt';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../firebase/logger';

export function POS() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [quickAddForm, setQuickAddForm] = useState({
    name: '',
    price: '',
    stock: '1',
    category: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'gcash'>('cash');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Barcode Scanner Hook
  useBarcodeScanner((code) => {
    handleBarcodeScan(code);
  }, !isCheckoutOpen && !isQuickAddOpen && !isReceiptOpen);

  useEffect(() => {
    // Focus search input on mount
    searchInputRef.current?.focus();
  }, []);

  // Auto-focus search input after actions
  const focusSearch = () => {
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  useEffect(() => {
    fetchProducts();
    fetchServices();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchServices = async () => {
    try {
      const q = query(collection(db, 'services'));
      const snapshot = await getDocs(q);
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(items);
    } catch (error) {
       handleFirestoreError(error, OperationType.GET, 'products');
    }
  };

  const addToCart = (item: Product | Service) => {
    const isService = 'active' in item;
    
    if (!isService && (item as Product).stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    const existing = cart.find(c => c.productId === item.id);
    if (existing) {
      if (!isService && existing.quantity >= (item as Product).stock) {
        toast.error('No more stock available');
        return;
      }
      setCart(cart.map(c => 
        c.productId === item.id 
          ? { ...c, quantity: c.quantity + (isService ? 1 : 1) } 
          : c
      ));
    } else {
      setCart([...cart, { 
        productId: item.id, 
        name: isService ? (item as Service).title : (item as Product).name, 
        price: item.price, 
        quantity: 1 
      }]);
    }
    focusSearch();
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = {
      ...quickAddForm,
      price: parseFloat(quickAddForm.price),
      stock: parseInt(quickAddForm.stock),
      barcode: scannedBarcode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      description: 'Quick added from POS',
      imageUrl: ''
    };

    try {
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      const created = { id: docRef.id, ...newProduct } as unknown as Product;
      await logActivity(user, 'PRODUCT_CREATE', `Quick added product from POS: ${newProduct.name}`, docRef.id, 'product');
      setProducts(prev => [...prev, created]);
      addToCart(created);
      setIsQuickAddOpen(false);
      setQuickAddForm({ name: '', price: '', stock: '1', category: '' });
      toast.success('Product added & added to cart!');
      playScannerBeep();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm) {
      const exactMatch = products.find(p => p.barcode === searchTerm || p.name.toLowerCase() === searchTerm.toLowerCase());
      if (exactMatch) {
        addToCart(exactMatch);
        playScannerBeep();
        setSearchTerm('');
        toast.success(`Scanned: ${exactMatch.name}`);
      } else if (searchTerm.length >= 6) {
        // Assume it's a barcode if it's long enough and not found
        setScannedBarcode(searchTerm);
        setIsQuickAddOpen(true);
        setSearchTerm('');
      }
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const change = Math.max(0, parseFloat(receivedAmount || '0') - cartTotal);

  const mergedInventory = [
    ...products.map(p => ({ ...p, isService: false })),
    ...services.map(s => ({ 
      id: s.id, 
      name: s.title, 
      price: s.price, 
      category: s.category, 
      stock: 99999, // Services don't follow stock
      imageUrl: '', 
      description: s.description,
      isService: true
    }))
  ];

  const filteredItems = mergedInventory.filter(item => 
    (category === 'All' || item.category === category) &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (!item.isService && (item as any).barcode === searchTerm))
  );

  const handleBarcodeScan = (code: string) => {
    const product = products.find(p => p.barcode === code);
    if (product) {
      addToCart(product);
      playScannerBeep();
      toast.success(`Scanned: ${product.name}`);
    } else {
      setScannedBarcode(code);
      setIsQuickAddOpen(true);
    }
  };

  const posCategories = ['All', ...new Set(mergedInventory.map(item => item.category))];

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === 'cash' && parseFloat(receivedAmount || '0') < cartTotal) {
      toast.error('Insufficient amount received');
      return;
    }

    const toastId = toast.loading('Processing transaction...');
    try {
      // 1. Create Transaction record
      const transactionData = {
        items: cart,
        total: cartTotal,
        paymentMethod,
        receivedAmount: parseFloat(receivedAmount || '0'),
        change,
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'transactions'), transactionData);
      await logActivity(user, 'POS_SALE', `POS Transaction processed: ${formatCurrency(cartTotal)}`, docRef.id, 'transaction');

      // 2. Update stock for each product (only for products, skip services)
      for (const item of cart) {
        const isProduct = products.some(p => p.id === item.productId);
        if (isProduct) {
          const productRef = doc(db, 'products', item.productId);
          await updateDoc(productRef, {
            stock: increment(-item.quantity)
          });
        }
      }

      setLastTransaction({ ...transactionData, id: docRef.id, createdAt: new Date() });
      toast.success('Transaction completed!', { id: toastId });
      setCart([]);
      setReceivedAmount('');
      setIsCheckoutOpen(false);
      setIsReceiptOpen(true);
      fetchProducts(); // Refresh stock
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions');
    }
  };

  return (
    <div className="h-full flex gap-8">
      {/* Products Selection */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search or Scan Barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#12A8FF] transition-all"
            />
          </div>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-3 rounded-2xl bg-[#A020F0]/10 border border-[#A020F0]/20 text-[#A020F0] hover:bg-[#A020F0]/20 transition-all"
            title="Scan with Camera"
          >
            <Scan size={24} />
          </button>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {posCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  category === cat ? "bg-[#12A8FF] text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(item as any)}
                className="p-4 rounded-3xl bg-[#0B0F19] border border-white/5 hover:border-[#12A8FF]/50 transition-all text-left flex flex-col h-full group"
              >
                <div className="aspect-square bg-white/5 rounded-2xl mb-4 overflow-hidden relative">
                   {item.imageUrl ? (
                     <img src={item.imageUrl || undefined} alt={item.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-700">
                        {item.isService ? <Package size={40} /> : <ShoppingBag size={40} />}
                     </div>
                   )}
                   {!item.isService && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
                        STOCK: {item.stock}
                    </div>
                   )}
                </div>
                <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">{item.name}</h4>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-[#12A8FF] font-black">{formatCurrency(item.price)}</span>
                  <div className="w-8 h-8 rounded-full bg-[#12A8FF]/10 flex items-center justify-center text-[#12A8FF] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={16} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-96 flex flex-col bg-[#0B0F19] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <ShoppingCart size={20} className="text-[#12A8FF]" />
              <h3 className="font-bold">Current Cart</h3>
           </div>
           <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-gray-500">
             {cart.reduce((s, i) => s + i.quantity, 0)} ITEMS
           </span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          <AnimatePresence>
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                 <ShoppingCart size={60} className="mb-4" />
                 <p className="text-sm font-medium">Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5"
                >
                  <div className="flex-1">
                    <h5 className="text-sm font-bold text-white mb-1">{item.name}</h5>
                    <p className="text-xs text-[#12A8FF] font-bold">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-black/40 rounded-xl p-1">
                    <button 
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-white/5">
              <span>Total</span>
              <span className="text-[#12A8FF]">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(true)}
            disabled={cart.length === 0}
            className="w-full py-4 rounded-2xl bg-[#12A8FF] text-white font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(18,168,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            Checkout <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0B0F19] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-2xl font-bold">Checkout</h3>
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Payment Method */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={cn(
                      "p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                      paymentMethod === 'cash' ? "bg-[#12A8FF]/10 border-[#12A8FF] text-[#12A8FF]" : "bg-white/5 border-white/5 text-gray-500 hover:border-white/20"
                    )}
                  >
                    <Banknote size={32} />
                    <span className="font-bold">CASH</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('gcash')}
                    className={cn(
                      "p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all",
                      paymentMethod === 'gcash' ? "bg-[#12A8FF]/10 border-[#12A8FF] text-[#12A8FF]" : "bg-white/5 border-white/5 text-gray-500 hover:border-white/20"
                    )}
                  >
                    <CreditCard size={32} />
                    <span className="font-bold">GCASH</span>
                  </button>
                </div>

                {/* Amount Input */}
                <div className="space-y-4">
                   <div className="flex justify-between items-end">
                      <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Amount Received</label>
                      <span className="text-2xl font-black text-white">{formatCurrency(cartTotal)}</span>
                   </div>
                   <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-500">₱</span>
                      <input 
                        type="number"
                        placeholder="0.00"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-12 pr-6 text-3xl font-black text-white focus:outline-none focus:border-[#12A8FF] transition-all"
                      />
                   </div>
                </div>

                {/* Change */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                   <span className="font-bold text-gray-400">Change</span>
                   <span className="text-3xl font-black text-green-500">{formatCurrency(change)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-6 rounded-2xl bg-gradient-to-r from-[#12A8FF] to-[#A020F0] text-white text-xl font-bold hover:shadow-[0_0_30px_rgba(18,168,255,0.4)] transition-all flex items-center justify-center gap-4 group"
                >
                  Confirm & Pay <Printer size={24} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {isReceiptOpen && lastTransaction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReceiptOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md"
            >
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setIsReceiptOpen(false)} className="p-2 bg-black/50 hover:bg-black rounded-full text-white">
                    <X size={24} />
                </button>
              </div>
              <div className="overflow-auto max-h-[90vh] custom-scrollbar rounded-3xl">
                <Receipt 
                    items={lastTransaction.items}
                    total={lastTransaction.total}
                    paymentMethod={lastTransaction.paymentMethod}
                    receivedAmount={lastTransaction.receivedAmount}
                    change={lastTransaction.change}
                    date={lastTransaction.createdAt}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <BarcodeScanner 
          onScan={(code) => {
            handleBarcodeScan(code);
            setIsScannerOpen(false);
          }} 
          onClose={() => setIsScannerOpen(false)} 
        />
      )}

      {/* Quick Add Product Modal */}
      <AnimatePresence>
        {isQuickAddOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickAddOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0B0F19] rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Quick Add Product</h3>
                  <p className="text-sm text-gray-500 font-mono">Barcode: {scannedBarcode}</p>
                </div>
                <button 
                  onClick={() => setIsQuickAddOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleQuickAdd} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Product Name</label>
                  <input 
                    required
                    type="text" 
                    value={quickAddForm.name}
                    onChange={e => setQuickAddForm({...quickAddForm, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#12A8FF] outline-none"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Price (₱)</label>
                    <input 
                      required
                      type="number"
                      step="0.01"
                      value={quickAddForm.price}
                      onChange={e => setQuickAddForm({...quickAddForm, price: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#12A8FF] outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Initial Stock</label>
                    <input 
                      required
                      type="number"
                      value={quickAddForm.stock}
                      onChange={e => setQuickAddForm({...quickAddForm, stock: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#12A8FF] outline-none"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Category</label>
                  <select 
                    required
                    value={quickAddForm.category}
                    onChange={e => setQuickAddForm({...quickAddForm, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-[#12A8FF] outline-none"
                  >
                    <option value="" className="bg-[#0B0F19]">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name} className="bg-[#0B0F19]">{cat.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-[#12A8FF] text-white font-bold hover:shadow-[0_0_20px_rgba(18,168,255,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  Create Product & Add to Cart
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
