import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Order, OrderStatus } from '../types';
import { formatDate, formatCurrency, cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { logActivity } from '../firebase/logger';

export function OrderTracker() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'All'>('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(items);
    } catch (error) {
       console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
      await logActivity(user, 'ORDER_UPDATE', `Updated order #${id.slice(0,8)} status to ${newStatus}`, id, 'order');
      toast.success(`Order updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
    }
  };

  const statusColors: Record<OrderStatus, string> = {
    pending: '#FFC107',
    confirmed: '#12A8FF',
    processing: '#A020F0',
    printing: '#FF1493',
    ready: '#38BDF8',
    completed: '#22C55E',
    cancelled: '#EF4444'
  };

  const getProgress = (status: OrderStatus) => {
    const stages: OrderStatus[] = ['pending', 'confirmed', 'processing', 'printing', 'ready', 'completed'];
    const index = stages.indexOf(status);
    if (index === -1) return 0;
    return ((index + 1) / stages.length) * 100;
  };

  const filteredOrders = orders.filter(o => filter === 'All' || o.status === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B0F19] border border-white/5 p-6 rounded-3xl mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Order Tracker</h1>
          <p className="text-gray-500 text-sm font-medium">Monitor and update active production workflows.</p>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
        {['All', 'pending', 'confirmed', 'processing', 'printing', 'ready', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
              filter === s 
                ? "bg-white text-black border-white" 
                : "bg-white/5 border-white/5 text-gray-500 hover:border-white/20"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Tracking shipments...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-600 bg-[#0B0F19] rounded-3xl border border-white/5">
           <Layers size={64} className="mx-auto mb-6 opacity-20" />
           <p className="font-bold uppercase tracking-widest">No orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              className="p-8 rounded-[32px] bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-all group overflow-hidden relative"
            >
              <div 
                className="absolute top-0 left-0 h-1 transition-all duration-1000 ease-out z-10"
                style={{ 
                  width: `${getProgress(order.status)}%`, 
                  backgroundColor: statusColors[order.status],
                  boxShadow: `0 0 10px ${statusColors[order.status]}`
                }}
              />
              
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className="font-mono text-[#12A8FF] font-bold">#ORD-{order.id.slice(0, 8)}</span>
                    <span className="text-xs text-gray-600">{formatDate(order.createdAt)}</span>
                    <div 
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                      style={{ backgroundColor: `${statusColors[order.status]}15`, color: statusColors[order.status] }}
                    >
                      {order.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Customer Info</h4>
                      <p className="text-white font-bold">{order.customerName}</p>
                      <p className="text-gray-400 text-sm">{order.email}</p>
                      <p className="text-gray-400 text-sm">{order.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Order Details</h4>
                      <ul className="space-y-2">
                        {(order.items || []).map((item, idx) => (
                          <li key={item.productId || idx} className="text-sm text-gray-300 flex justify-between">
                             <span>{item.quantity}x {item.name}</span>
                             <span className="text-gray-500">{formatCurrency(item.price * item.quantity)}</span>
                          </li>
                        ))}
                        <li className="pt-2 mt-2 border-t border-white/5 flex justify-between font-bold text-white">
                           <span>Total</span>
                           <span className="text-[#22C55E]">{formatCurrency(order.total)}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="lg:w-48 space-y-3">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Update Status</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {['confirmed', 'processing', 'printing', 'ready', 'completed'].map((s) => (
                      <button
                        key={s}
                        disabled={order.status === s}
                        onClick={() => handleStatusChange(order.id, s as OrderStatus)}
                        className={cn(
                          "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          order.status === s ? "bg-white/10 text-white cursor-default" : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                    <button 
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      className="py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
