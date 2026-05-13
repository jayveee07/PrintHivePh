import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Users, 
  PieChart, 
  Settings, 
  LogOut, 
  Layers,
  Inbox,
  Briefcase,
  TrendingDown,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export function AdminLayout() {
  const { isAdmin, loading, signOut, user, profile } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-[#12A8FF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return <Navigate to="/" />;

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin' },
    { name: 'POS System', icon: <ShoppingCart size={20} />, href: '/admin/pos' },
    { name: 'Products', icon: <ShoppingBag size={20} />, href: '/admin/products' },
    { name: 'Orders', icon: <Layers size={20} />, href: '/admin/orders' },
    { name: 'Customers', icon: <Users size={20} />, href: '/admin/customers' },
    { name: 'Analytics', icon: <PieChart size={20} />, href: '/admin/analytics' },
    { name: 'Portfolio', icon: <Briefcase size={20} />, href: '/admin/portfolio' },
    { name: 'Inquiries', icon: <Inbox size={20} />, href: '/admin/inquiries' },
    { name: 'Expenses', icon: <TrendingDown size={20} />, href: '/admin/expenses' },
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
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#12A8FF] to-[#FF1493] flex items-center justify-center shrink-0">
                 <span className="font-bold text-xs uppercase">PH</span>
              </div>
              {isSidebarOpen && <span className="font-bold text-lg tracking-tight">Admin Hive</span>}
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
                {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
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
             <img src={user?.photoURL || ''} alt="" className="w-10 h-10 rounded-full border border-[#12A8FF]/30 shadow-[0_0_15px_rgba(18,168,255,0.2)]" />
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
