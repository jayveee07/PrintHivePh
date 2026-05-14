import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Target, Zap, Waves, Loader2 } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { collection, getDocs, query, orderBy, limit, Timestamp, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';

export function Analytics() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [totalFinances, setTotalFinances] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      const ordersColl = collection(db, 'orders');
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      
      const q = query(
        ordersColl, 
        where('createdAt', '>=', Timestamp.fromDate(sixMonthsAgo)),
        orderBy('createdAt', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const monthlyData: Record<string, { month: string, revenue: number, profit: number }> = {};
      const catSales: Record<string, number> = {};
      let total = 0;

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('en-US', { month: 'short' });
        monthlyData[label] = { month: label, revenue: 0, profit: 0 };
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const amount = data.total || 0;
        total += amount;
        
        const date = data.createdAt?.toDate() || new Date();
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (monthlyData[monthLabel]) {
          monthlyData[monthLabel].revenue += amount;
          // Estimate profit at 30% if not explicitly tracked
          monthlyData[monthLabel].profit += amount * 0.3;
        }

        // Category breakdown
        const items = data.items || [];
        items.forEach((item: any) => {
          const cat = item.category || 'Uncategorized';
          catSales[cat] = (catSales[cat] || 0) + (item.price * item.quantity);
        });
      });

      setTotalFinances(total);
      setSalesData(Object.values(monthlyData));

      const colors = ['#12A8FF', '#FF1493', '#A020F0', '#FFC107', '#00DF9A'];
      const totalCatValue = Object.values(catSales).reduce((a, b) => a + b, 0);
      const pieData = Object.entries(catSales).map(([name, value], i) => ({
        name,
        value: Math.round((value / totalCatValue) * 100),
        color: colors[i % colors.length]
      })).sort((a, b) => b.value - a.value).slice(0, 5);

      setCategoryData(pieData);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'analytics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-[#12A8FF] animate-spin" />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">Synthesizing Market Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header with quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 p-10 rounded-[40px] bg-gradient-to-br from-[#12A8FF]/10 to-transparent border border-[#12A8FF]/20 relative overflow-hidden">
            <Waves className="absolute right-0 bottom-0 text-[#12A8FF]/5" size={300} />
            <div className="relative z-10 flex flex-col h-full justify-between gap-12">
               <div>
                  <h3 className="text-xl font-bold mb-2">Total Financial Growth</h3>
                  <div className="flex items-end gap-4">
                     <span className="text-6xl font-black text-white">{formatCurrency(totalFinances)}</span>
                     <span className="mb-2 flex items-center gap-1 text-green-500 font-bold text-sm">
                        <ArrowUpRight size={16} /> +{totalFinances > 0 ? 'Dynamic' : '0'}% Calc
                     </span>
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-8">
                  <div>
                     <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Monthly Target</p>
                     <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[75%] h-full bg-[#12A8FF]" />
                     </div>
                     <p className="text-sm font-bold mt-2">75% Complete</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Estimated Margin</p>
                     <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[30%] h-full bg-[#FF1493]" />
                     </div>
                     <p className="text-sm font-bold mt-2">30% Net (est)</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Market Velocity</p>
                     <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[65%] h-full bg-[#A020F0]" />
                     </div>
                     <p className="text-sm font-bold mt-2">Optimal</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="p-10 rounded-[40px] bg-[#0B0F19] border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold mb-8">Category Density</h3>
            <div className="flex-1 min-h-[250px]">
               {categoryData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={10}
                          dataKey="value"
                       >
                          {categoryData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid #ffffff10', borderRadius: '12px' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex items-center justify-center text-gray-600 text-sm italic">No data yet</div>
               )}
            </div>
            <div className="space-y-4">
               {categoryData.map(c => (
                  <div key={c.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-sm font-medium text-gray-400 truncate max-w-[120px]">{c.name}</span>
                     </div>
                     <span className="text-sm font-bold text-white">{c.value}%</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 gap-8">
         <div className="p-10 rounded-[40px] bg-[#0B0F19] border border-white/5">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-2xl font-bold">Performance Matrix</h3>
                  <p className="text-gray-500">Revenue vs Estimated Profit (Last 6 Months)</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-[#12A8FF]" />
                     <span className="text-xs text-gray-500">Revenue</span>
                  </div>
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-[#FF1493]" />
                     <span className="text-xs text-gray-500">Fixed Profit (30%)</span>
                  </div>
               </div>
            </div>
            
            <div className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#4B5563'}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#4B5563'}} />
                     <Tooltip 
                         cursor={{fill: '#ffffff05'}}
                         contentStyle={{ backgroundColor: '#06080E', border: '1px solid #ffffff10', borderRadius: '16px' }}
                     />
                     <Bar dataKey="revenue" fill="#12A8FF" radius={[10, 10, 0, 0]} barSize={30} />
                     <Bar dataKey="profit" fill="#FF1493" radius={[10, 10, 0, 0]} barSize={30} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}
