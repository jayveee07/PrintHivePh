import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  PieChart, 
  LogOut, 
  Layers,
  Inbox,
  Briefcase,
  TrendingDown,
  Menu,
  X,
  ExternalLink,
  Fingerprint,
  Package,
  Tag,
  AlertCircle,
  Database
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

import { AdminLoginModal } from '../components/AdminLoginModal';
import logor from '../assets/logor.png';

export function AdminLayout() {
  const { isAdmin, loading, signOut, user, profile } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;

    // Listen for low stock (threshold: 10)
    const qLowStock = query(collection(db, 'products'), where('stock', '<=', 10));
    const unsubStock = onSnapshot(qLowStock, (snapshot) => {
      setLowStockCount(snapshot.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products_low_stock_watch');
    });

    // Listen for pending orders
    const qOrders = query(collection(db, 'orders'), where('status', '==', 'pending'));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setPendingOrdersCount(snapshot.size);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders_pending_watch');
    });

    return () => {
      unsubStock();
      unsubOrders();
    };
  }, [isAdmin]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-[#12A8FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#06080E] flex flex-col items-center justify-center p-6 text-center">
        <AdminLoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="w-20 h-20 mx-auto rounded-3xl bg-[#12A8FF]/5 border border-[#12A8FF]/30 flex items-center justify-center text-[#12A8FF] mb-8">
              <Fingerprint size={40} className="animate-pulse" />
           </div>
           <h1 className="text-3xl font-black text-white uppercase tracking-[6px]">
             Secure <span className="text-[#12A8FF]">Hive</span>
           </h1>
           <p className="text-gray-500 text-sm font-medium tracking-widest uppercase">
             Restricted Access Node • Authentication Required
           </p>
           <div className="pt-8 flex flex-col gap-4">
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#12A8FF] to-[#0070FF] text-white font-black text-sm uppercase tracking-[2px] transition-all flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(18,168,255,0.4)]"
              >
                Launch Authentication Modal
              </button>
              <Link to="/" className="text-xs text-gray-600 font-bold uppercase tracking-widest hover:text-white transition-colors">
                Return to Public Proxy
              </Link>
           </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin' },
    { name: 'POS System', icon: <ShoppingCart size={20} />, href: '/admin/pos' },
    { name: 'Products', icon: <ShoppingBag size={20} />, href: '/admin/products', badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: 'bg-red-500' },
    { name: 'Services', icon: <Package size={20} />, href: '/admin/services' },
    { name: 'Categories', icon: <Tag size={20} />, href: '/admin/categories' },
    { name: 'Orders', icon: <Layers size={20} />, href: '/admin/orders', badge: pendingOrdersCount > 0 ? pendingOrdersCount : null, badgeColor: 'bg-[#A020F0]' },
    { name: 'Customers', icon: <Users size={20} />, href: '/admin/customers' },
    { name: 'Analytics', icon: <PieChart size={20} />, href: '/admin/analytics' },
    { name: 'Portfolio', icon: <Briefcase size={20} />, href: '/admin/portfolio' },
    { name: 'Inquiries', icon: <Inbox size={20} />, href: '/admin/inquiries' },
    { name: 'Expenses', icon: <TrendingDown size={20} />, href: '/admin/expenses' },
    { name: 'System Logs', icon: <Database size={20} />, href: '/admin/logs' },
  ];

  return (
    <div className="min-h-screen bg-[#06080E] text-white flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-[#0B0F19] border-r border-white/5 transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-0 lg:w-20 overflow-hidden"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 mb-10 px-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                 <img src={logor} alt="Logo" className="w-full h-full object-contain p-1.5" />
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="font-black text-lg tracking-tighter uppercase leading-none">Print<span className="text-[#12A8FF]">Hive</span></span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[2px]">Admin Node</span>
                </div>
              )}
            </Link>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
                  location.pathname === item.href 
                    ? "bg-[#12A8FF] text-white shadow-[0_0_20px_rgba(18,168,255,0.3)]" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={cn("shrink-0", location.pathname === item.href ? "text-white" : "group-hover:text-[#12A8FF]")}>
                  {item.icon}
                </div>
                {isSidebarOpen && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{item.name}</span>
                    {item.badge !== undefined && item.badge !== null && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black text-white animate-pulse shadow-lg",
                        item.badgeColor || "bg-[#12A8FF]"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                {!isSidebarOpen && item.badge !== undefined && item.badge !== null && (
                  <div className={cn(
                    "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0B0F19] z-10",
                    item.badgeColor || "bg-[#12A8FF]"
                  )} />
                )}
              </Link>
            ))}
            <div className="h-px bg-white/5 my-4" />
            <Link
              to="/"
              className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-all group"
            >
              <ExternalLink size={20} className="group-hover:text-[#FF1493]" />
              {isSidebarOpen && <span className="text-sm font-medium">View Website</span>}
            </Link>
          </nav>

          <button 
            onClick={() => signOut()}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all mt-auto"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-[#0B0F19]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-white/5 rounded-lg lg:hidden"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-xl font-bold">
              {menuItems.find(i => i.href === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold">{user?.displayName}</span>
                <span className="text-[10px] text-[#12A8FF] font-black uppercase tracking-widest">{profile?.role}</span>
             </div>
             <img src={user?.photoURL || undefined} alt="" className="w-10 h-10 rounded-full border border-[#12A8FF]/30 shadow-[0_0_15px_rgba(18,168,255,0.2)]" />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
