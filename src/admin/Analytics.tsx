import React from 'react';
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
import { TrendingUp, ArrowUpRight, ArrowDownRight, Target, Zap, Waves } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

const salesData = [
  { month: 'Jan', revenue: 45000, profit: 12000 },
  { month: 'Feb', revenue: 52000, profit: 15000 },
  { month: 'Mar', revenue: 48000, profit: 13000 },
  { month: 'Apr', revenue: 61000, profit: 21000 },
  { month: 'May', revenue: 55000, profit: 18000 },
  { month: 'Jun', revenue: 67000, profit: 25000 },
];

const categoryData = [
  { name: 'Apparel', value: 45, color: '#12A8FF' },
  { name: 'Stationery', value: 25, color: '#FF1493' },
  { name: 'Merch', value: 30, color: '#A020F0' },
];

export function Analytics() {
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
                     <span className="text-6xl font-black text-white">{formatCurrency(324000)}</span>
                     <span className="mb-2 flex items-center gap-1 text-green-500 font-bold text-sm">
                        <ArrowUpRight size={16} /> +24% YoY
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
                     <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Profit Margin</p>
                     <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[32%] h-full bg-[#FF1493]" />
                     </div>
                     <p className="text-sm font-bold mt-2">32% Net</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Customer LTV</p>
                     <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[88%] h-full bg-[#A020F0]" />
                     </div>
                     <p className="text-sm font-bold mt-2">₱12,500 Avg</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="p-10 rounded-[40px] bg-[#0B0F19] border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold mb-8">Service Density</h3>
            <div className="flex-1 min-h-[250px]">
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
            </div>
            <div className="space-y-4">
               {categoryData.map(c => (
                  <div key={c.name} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-sm font-medium text-gray-400">{c.name}</span>
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
                  <p className="text-gray-500">Revenue vs Profit analysis</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-[#12A8FF]" />
                     <span className="text-xs text-gray-500">Revenue</span>
                  </div>
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-[#FF1493]" />
                     <span className="text-xs text-gray-500">Profit</span>
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
