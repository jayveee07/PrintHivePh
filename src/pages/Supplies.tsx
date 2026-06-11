import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingBag, Filter, ChevronRight, ChevronDown, ShoppingCart, Plus, Minus, X, LogIn } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Product } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export function Supplies() {
  const { user, signIn, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSupplies();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSupplies = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      // Include all supply-related categories
      const supplyItems = items.filter(p => 
        (p.category || '').includes('Supplies') || 
        ['Paper', 'Writing Supplies', 'Accessories', 'Art Materials', 
         'Cleaning Supplies', 'Binding Supplies', 'Laminating Supplies', 
         'Merchandise Blanks', 'Sticker Supplies', 'Packaging', 'Printing Supplies', 'Electronics'].includes(p.category)
      );
      
      // Extract unique categories and sort them
      const uniqueCategories = ['All', ...Array.from(new Set(supplyItems.map(p => p.category)))].sort((a, b) => {
        if (a === 'All') return -1;
        if (b === 'All') return 1;
        return a.localeCompare(b);
      });
      
      setProducts(supplyItems);
      setCategories(uniqueCategories);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
     (activeCategory === 'All' || p.category === activeCategory) &&
     ((p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.description || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    if (!user) {
      setIsLoginModalOpen(true);
      toast.error('Please sign in to add items to cart');
      return;
    }

    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(prevCart =>
        prevCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart(prevCart => [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart =>
      prevCart
        .map(item =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="pt-32 pb-24 px-6 bg-[#06080E] min-h-screen">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <header className="mb-16">
            <motion.h1 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="text-5xl font-extrabold text-white mb-6"
            >
              Essentials <span className="text-[#FF1493]">Catalog</span>
            </motion.h1>
            
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
               <div className="flex gap-3 items-center w-full md:w-auto">
                  {/* Primary Filters */}
                  <button
                    onClick={() => setActiveCategory('School Supplies')}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border",
                      activeCategory === 'School Supplies' 
                        ? "bg-[#FF1493] border-[#FF1493] text-white shadow-[0_0_20px_rgba(255,20,147,0.3)]" 
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                    )}
                  >
                    School
                  </button>
                  <button
                    onClick={() => setActiveCategory('Office Supplies')}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border",
                      activeCategory === 'Office Supplies' 
                        ? "bg-[#FF1493] border-[#FF1493] text-white shadow-[0_0_20px_rgba(255,20,147,0.3)]" 
                        : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                    )}
                  >
                    Office
                  </button>

                  {/* Secondary Dropdown Filter */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={cn(
                        "px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border flex items-center gap-2",
                        (activeCategory !== 'School Supplies' && activeCategory !== 'Office Supplies')
                          ? "bg-[#FF1493] border-[#FF1493] text-white shadow-[0_0_20px_rgba(255,20,147,0.3)]" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                      )}
                    >
                      {activeCategory === 'All' ? 'More' : 'Other'}
                      <ChevronDown size={16} className={cn("transition-transform", isDropdownOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-full left-0 mt-2 bg-[#0B0F19] border border-white/10 rounded-2xl shadow-xl z-50 min-w-56"
                        >
                          {categories
                            .filter(cat => cat !== 'School Supplies' && cat !== 'Office Supplies')
                            .map(cat => (
                              <button
                                key={cat}
                                onClick={() => {
                                  setActiveCategory(cat);
                                  setIsDropdownOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left px-4 py-3 text-sm font-medium transition-all",
                                  activeCategory === cat 
                                    ? "bg-[#FF1493]/20 text-[#FF1493]" 
                                    : "text-gray-400 hover:bg-white/5"
                                )}
                              >
                                {cat}
                              </button>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
               </div>
               
               <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                  <input 
                    type="text" 
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#FF1493] transition-all"
                  />
               </div>
            </div>
          </header>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Scanning inventory...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-600 bg-white/5 rounded-[40px] border border-white/5">
               <ShoppingBag size={64} className="mx-auto mb-6 opacity-20" />
               <p className="text-xl font-bold">No supplies found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-[#0B0F19] rounded-[32px] border border-white/5 overflow-hidden hover:border-[#FF1493]/30 transition-all hover:shadow-[0_0_30px_rgba(255,20,147,0.05)] flex flex-col"
                >
                  <div className="aspect-square bg-gradient-to-br from-white/5 to-transparent p-10 flex items-center justify-center relative">
                     {product.imageUrl ? (
                       <img src={product.imageUrl || undefined} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                     ) : (
                       <ShoppingBag size={60} className="text-gray-800" />
                     )}
                     <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                        {product.category}
                     </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-[#FF1493] transition-colors line-clamp-2">{product.name}</h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">{product.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-black text-white">{formatCurrency(product.price)}</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="px-4 py-2 rounded-2xl bg-[#FF1493] text-white font-bold text-sm hover:bg-[#FF1493]/80 transition-all flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="hidden xl:flex w-80 flex-col gap-4">
          <motion.div 
            className="sticky top-32 bg-[#0B0F19] border border-white/5 rounded-[32px] overflow-hidden flex flex-col h-fit max-h-[70vh]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Cart Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-[#FF1493]" />
                <h3 className="font-bold text-white">Shopping Cart</h3>
              </div>
              <span className="px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-gray-500">
                {cartItemCount} ITEMS
              </span>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 py-8">
                    <ShoppingCart size={48} className="mb-4" />
                    <p className="text-sm font-medium">Cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-white line-clamp-1">{item.name}</h5>
                        <p className="text-xs text-[#FF1493] font-bold">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1">
                        <button 
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-gray-400"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center text-white"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="w-6 h-6 rounded hover:bg-red-500/20 flex items-center justify-center text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-6 bg-white/5 border-t border-white/5 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-500 text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span className="text-[#FF1493]">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
                <button
                  onClick={() => toast.error('Checkout is coming soon. Please contact us directly for orders.')}
                  className="w-full py-3 rounded-2xl bg-[#FF1493] text-white font-bold hover:bg-[#FF1493]/80 transition-all"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Sign In Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0B0F19] border border-white/10 rounded-3xl p-8 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <ShoppingCart size={24} className="text-[#FF1493]" />
                  Sign In Required
                </h2>
                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-gray-400 mb-6">
                Please sign in to your account to add items to your shopping cart and proceed with checkout.
              </p>

              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      await signIn();
                      setIsLoginModalOpen(false);
                      toast.success('Signed in successfully!');
                    } catch (error) {
                      toast.error('Failed to sign in');
                    }
                  }}
                  disabled={authLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-[#FF1493] text-white font-bold hover:bg-[#FF1493]/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogIn size={18} />
                  Sign In with Google
                </button>

                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                >
                  Continue as Guest
                </button>
              </div>

              <p className="text-xs text-gray-600 text-center mt-6">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
