import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  Clock
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

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const stats = [
  { label: 'Total Sales', value: '₱124,500', icon: <DollarSign />, color: '#12A8FF', trend: '+12.5%' },
  { label: 'Total Orders', value: '154', icon: <ShoppingBag />, color: '#FF1493', trend: '+5.2%' },
  { label: 'Total Customers', value: '1,200', icon: <Users />, color: '#A020F0', trend: '+8.1%' },
  { label: 'Daily Revenue', value: '₱4,200', icon: <TrendingUp />, color: '#FFC107', trend: '-2.4%' },
];

export function Dashboard() {
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-[#0B0F19] border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold">Revenue Overview</h3>
              <p className="text-sm text-gray-500">Weekly sales performance</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg text-sm px-3 py-1 outline-none">
               <option>Last 7 Days</option>
               <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#12A8FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#12A8FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#12A8FF' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#12A8FF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#0B0F19] border border-white/5 flex flex-col">
          <h3 className="text-xl font-bold mb-6">Recent Activities</h3>
          <div className="flex-1 space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Clock size={16} className="text-[#A020F0]" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">New order received #ORD-123{i}</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 text-sm font-bold text-[#12A8FF] hover:underline text-center">
            View All Activity
          </button>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="p-8 rounded-3xl bg-[#0B0F19] border border-white/5 overflow-hidden">
            <h3 className="text-xl font-bold mb-6">Recent Orders</h3>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/5">
                     <tr>
                        <th className="pb-4">Order ID</th>
                        <th className="pb-4">Customer</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4 text-right">Total</th>
                     </tr>
                  </thead>
                  <tbody className="text-sm">
                     {[1, 2, 3, 4].map((i) => (
                        <tr key={i} className="border-b border-white/5 last:border-0">
                           <td className="py-4 font-mono text-[#12A8FF]">#8291{i}</td>
                           <td className="py-4">John Doe</td>
                           <td className="py-4">
                              <span className="px-2 py-1 rounded bg-[#FFC107]/10 text-[#FFC107] text-[10px] font-bold">PENDING</span>
                           </td>
                           <td className="py-4 text-right">₱1,200.00</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="p-8 rounded-3xl bg-[#0B0F19] border border-white/5 overflow-hidden">
            <h3 className="text-xl font-bold mb-6">Top Products</h3>
            <div className="space-y-6">
               {[
                 { name: 'Custom T-Shirt', sales: 45, revenue: '₱15,750' },
                 { name: 'Sticker Labels', sales: 32, revenue: '₱3,200' },
                 { name: 'Coffee Mugs', sales: 28, revenue: '₱5,040' },
               ].map((product, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-xs">
                           {i + 1}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white">{product.name}</p>
                           <p className="text-xs text-gray-500">{product.sales} sales</p>
                        </div>
                     </div>
                     <div className="text-sm font-bold text-[#12A8FF]">{product.revenue}</div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
