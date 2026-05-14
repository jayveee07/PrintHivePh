import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  Clock,
  Database,
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { collection, getDocs, query, orderBy, limit, getCountFromServer, addDoc, serverTimestamp, where, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Sales (30d)', value: '₱0', icon: <DollarSign />, color: '#12A8FF', trend: '0%' },
    { label: 'Total Orders', value: '0', icon: <ShoppingBag />, color: '#FF1493', trend: '0%' },
    { label: 'Total Customers', value: '0', icon: <Users />, color: '#A020F0', trend: '0%' },
    { label: 'Daily Revenue', value: '₱0', icon: <TrendingUp />, color: '#FFC107', trend: '0%' },
  ]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCatalogEmpty, setIsCatalogEmpty] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const ordersColl = collection(db, 'orders');
      const usersColl = collection(db, 'users');
      const productsColl = collection(db, 'products');
      const logsColl = collection(db, 'activity_logs');

      // Concurrent data fetching
      const [ordersCount, usersCount, productsCount, logsSnap] = await Promise.all([
        getCountFromServer(ordersColl),
        getCountFromServer(usersColl),
        getCountFromServer(productsColl),
        getDocs(query(logsColl, orderBy('timestamp', 'desc'), limit(5)))
      ]);
      
      setRecentLogs(logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsCatalogEmpty(productsCount.data().count === 0);

      // Fetch low stock items
      const qLowStock = query(productsColl, where('stock', '<=', 10), limit(5));
      const lowStockSnap = await getDocs(qLowStock);
      setLowStockItems(lowStockSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Calculate revenue and chart data
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const qRevenue = query(ordersColl, where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)));
      const revenueSnap = await getDocs(qRevenue);

      let totalRev = 0;
      let dailyRev = 0;
      const weeklyRevenueMap: Record<string, number> = {};
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        weeklyRevenueMap[label] = 0;
      }

      revenueSnap.forEach(doc => {
        const data = doc.data();
        const total = data.total || 0;
        totalRev += total;

        const createdAt = data.createdAt?.toDate?.() || new Date();
        if (createdAt >= startOfDay) {
          dailyRev += total;
        }

        if (createdAt >= sevenDaysAgo) {
          const label = createdAt.toLocaleDateString('en-US', { weekday: 'short' });
          if (weeklyRevenueMap[label] !== undefined) {
             weeklyRevenueMap[label] += total;
          }
        }
      });

      const dynamicChartData = Object.entries(weeklyRevenueMap).map(([name, sales]) => ({ name, sales }));
      setChartData(dynamicChartData);

      const qRecent = query(ordersColl, orderBy('createdAt', 'desc'), limit(5));
      const recentSnap = await getDocs(qRecent);
      setRecentOrders(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      setStats([
        { label: 'Total Sales (30d)', value: formatCurrency(totalRev), icon: <DollarSign />, color: '#12A8FF', trend: totalRev > 0 ? '+100%' : '0%' },
        { label: 'Total Orders', value: ordersCount.data().count.toString(), icon: <ShoppingBag />, color: '#FF1493', trend: ordersCount.data().count > 0 ? '+100%' : '0%' },
        { label: 'Total Customers', value: usersCount.data().count.toString(), icon: <Users />, color: '#A020F0', trend: usersCount.data().count > 0 ? '+100%' : '0%' },
        { label: 'Daily Revenue', value: formatCurrency(dailyRev), icon: <TrendingUp />, color: '#FFC107', trend: dailyRev > 0 ? '+100%' : '0%' },
      ]);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'dashboard_stats');
    } finally {
      setLoading(false);
    }
  }

  const seedData = async () => {
    setIsSeeding(true);
    const toastId = toast.loading('Seeding initial data...');
    try {
      const initialProducts = [
        { name: 'Custom DTF T-Shirt', price: 350, stock: 100, category: 'T-Shirt Printing', description: 'High-quality cotton tee with custom DTF print.', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800' },
        { name: 'Tarpaulin Printing', price: 25, stock: 500, category: 'Tarpaulin', description: 'Per square foot high-quality tarp printing.', imageUrl: 'https://images.unsplash.com/photo-1506477331477-33d6d8b3dc85?auto=format&fit=crop&q=80&w=800' },
        { name: 'Matte Sticker Labels', price: 150, stock: 200, category: 'Stickers & Labels', description: 'A4 sheet of waterproof matte stickers.', imageUrl: 'https://images.unsplash.com/photo-1589384273441-c5df2f9131be?auto=format&fit=crop&q=80&w=800' },
        { name: 'Business Cards (100pcs)', price: 250, stock: 50, category: 'Business Cards', description: 'Premium 300gsm matte business cards.', imageUrl: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=800' },
        { name: 'Custom Coffee Mug', price: 180, stock: 40, category: 'Merchandise', description: '11oz sublimation printed ceramic mug.', imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800' },
      ];

      for (const p of initialProducts) {
        await addDoc(collection(db, 'products'), {
          ...p,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      toast.success('Hive data seeded successfully!', { id: toastId });
      fetchStats();
    } catch (error) {
      console.error('Seed error:', error);
      toast.error('Failed to seed data.', { id: toastId });
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 font-bold uppercase tracking-widest animate-pulse">
        Connecting to the Hive mind...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-2xl bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}10`, color: stat.color }}
              >
                {stat.icon}
              </div>
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-full",
                stat.trend.startsWith('+') ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"
              )}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-[#0B0F19] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#12A8FF]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Revenue Overview</h3>
              <p className="text-sm text-gray-500 font-medium">Weekly sales performance</p>
            </div>
            {isCatalogEmpty && (
                <button 
                  onClick={seedData}
                  disabled={isSeeding}
                  className="flex items-center gap-2 px-4 py-2 bg-[#A020F0]/10 text-[#A020F0] border border-[#A020F0]/20 rounded-xl text-xs font-bold hover:bg-[#A020F0] hover:text-white transition-all disabled:opacity-50"
                >
                  <Database size={14} /> {isSeeding ? 'Seeding...' : 'Seed Data'}
                </button>
            )}
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#12A8FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#12A8FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="sales" stroke="#12A8FF" strokeWidth={3} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#0B0F19] border border-red-500/10 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter">Low Stock</h3>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Inventory Alerts</p>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            {lowStockItems.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center py-8">
                 <ShoppingBag size={24} className="text-green-500 mb-4" />
                 <p className="text-sm font-bold text-white">Stock Healthy</p>
               </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-red-500/30 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-[10px] font-black">{item.stock}</div>
                    <p className="text-xs font-bold text-white truncate">{item.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link to="/admin/products" className="mt-8 text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center justify-center gap-2">Restock <ChevronRight size={12} /></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="p-8 rounded-3xl bg-[#0B0F19] border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-tighter">Recent Sales</h3>
              <Link to="/admin/orders" className="text-xs font-bold text-[#12A8FF] hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
               {recentOrders.length === 0 ? (
                  <div className="py-20 text-center text-gray-600 italic text-sm">No recent sales.</div>
               ) : recentOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-[#12A8FF]/30 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#12A8FF]/10 text-[#12A8FF] flex items-center justify-center"><ShoppingBag size={16} /></div>
                        <div>
                           <p className="text-sm font-bold text-white">Order by {order.customerName}</p>
                           <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{order.status} • {formatCurrency(order.total)}</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-mono text-gray-600">#{order.id.slice(-6)}</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="p-8 rounded-3xl bg-[#0B0F19] border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-tighter">Audit Trail</h3>
              <Link to="/admin/logs" className="text-xs font-bold text-[#A020F0] hover:underline">See Logs</Link>
            </div>
            <div className="space-y-4">
               {recentLogs.length === 0 ? (
                  <div className="py-20 text-center text-gray-600 italic text-sm">No activity logs.</div>
               ) : recentLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-[#A020F0]/30 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#A020F0]/10 text-[#A020F0] flex items-center justify-center"><Info size={16} /></div>
                        <div>
                           <p className="text-sm font-bold text-white line-clamp-1">{log.details}</p>
                           <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{log.action} • {log.adminEmail.split('@')[0]}</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-mono text-gray-600 shrink-0">{log.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
