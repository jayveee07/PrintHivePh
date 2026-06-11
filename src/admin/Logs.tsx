import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { motion } from 'motion/react';
import { Clock, Info, Database, RefreshCw, Search, Filter, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ActivityLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: Timestamp;
  targetType?: string;
}

const actionOptions = [
  'All',
  'STOCK_UPDATE',
  'PRODUCT_CREATE',
  'PRODUCT_UPDATE',
  'PRODUCT_DELETE',
  'POS_SALE',
  'ORDER_UPDATE',
  'BOOKING_UPDATE',
  'BOOKING_NOTE',
  'EXPENSE_ADD',
  'CATEGORY_CHANGE',
];

const targetTypeOptions = ['All', 'product', 'transaction', 'order', 'booking', 'category', 'expense'];

export function SystemLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [targetTypeFilter, setTargetTypeFilter] = useState('All');
  const [adminFilter, setAdminFilter] = useState('All');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (isNext = false) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'activity_logs'),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      if (isNext && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
      
      if (isNext) {
        setLogs(prev => [...prev, ...items]);
      } else {
        setLogs(items);
      }
      
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (error) {
       handleFirestoreError(error, OperationType.GET, 'activity_logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'text-red-500 bg-red-500/10';
    if (action.includes('CREATE')) return 'text-green-500 bg-green-500/10';
    if (action.includes('UPDATE')) return 'text-blue-500 bg-blue-500/10';
    return 'text-gray-400 bg-gray-400/10';
  };

  const adminOptions = ['All', ...Array.from(new Set(logs.map(log => log.adminEmail).filter(Boolean)))];

  const filteredLogs = logs.filter(log => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !search ||
      log.action.toLowerCase().includes(search) ||
      log.details.toLowerCase().includes(search) ||
      log.adminEmail.toLowerCase().includes(search) ||
      (log.targetType || '').toLowerCase().includes(search);
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const matchesTargetType = targetTypeFilter === 'All' || log.targetType === targetTypeFilter;
    const matchesAdmin = adminFilter === 'All' || log.adminEmail === adminFilter;

    return matchesSearch && matchesAction && matchesTargetType && matchesAdmin;
  });

  const hasActiveFilters = searchTerm || actionFilter !== 'All' || targetTypeFilter !== 'All' || adminFilter !== 'All';

  const clearFilters = () => {
    setSearchTerm('');
    setActionFilter('All');
    setTargetTypeFilter('All');
    setAdminFilter('All');
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-black uppercase tracking-tighter">System Audit Trail</h2>
           <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Real-time operation monitors</p>
        </div>
        <button 
          onClick={() => fetchLogs()}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all"
        >
          <RefreshCw size={20} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      <div className="bg-[#0B0F19] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 space-y-6">
           <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#12A8FF]/10 text-[#12A8FF] flex items-center justify-center">
                    <Database size={20} />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.2em]">Live Operation Stream</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-widest">
                <Filter size={14} />
                {filteredLogs.length} of {logs.length} shown
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-[#12A8FF]"
                />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#12A8FF]"
              >
                {actionOptions.map(action => (
                  <option key={action} value={action} className="bg-[#0B0F19]">
                    {action === 'All' ? 'All Actions' : action}
                  </option>
                ))}
              </select>
              <select
                value={targetTypeFilter}
                onChange={(e) => setTargetTypeFilter(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#12A8FF]"
              >
                {targetTypeOptions.map(type => (
                  <option key={type} value={type} className="bg-[#0B0F19]">
                    {type === 'All' ? 'All Targets' : type}
                  </option>
                ))}
              </select>
              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white outline-none focus:border-[#12A8FF]"
              >
                {adminOptions.map(admin => (
                  <option key={admin} value={admin} className="bg-[#0B0F19]">
                    {admin === 'All' ? 'All Admins' : admin}
                  </option>
                ))}
              </select>
           </div>

           {hasActiveFilters && (
             <button
               onClick={clearFilters}
               className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
             >
               <X size={14} /> Clear filters
             </button>
           )}
        </div>

        <div className="divide-y divide-white/5">
          {loading && logs.length === 0 ? (
            <div className="p-20 text-center animate-pulse text-gray-600 font-black uppercase tracking-widest text-xs">
               Syncing with encrypted logs...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-20 text-center text-gray-600 italic">No activity recorded.</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-20 text-center text-gray-600 italic">No logs match the selected filters.</div>
          ) : (
            filteredLogs.map((log, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={log.id} 
                className="p-6 hover:bg-white/[0.01] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                   <div className="mt-1 shrink-0">
                      <div className={cn("p-2 rounded-lg", getActionColor(log.action))}>
                         <Info size={16} />
                      </div>
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest", getActionColor(log.action))}>
                            {log.action}
                         </span>
                         <span className="text-xs text-gray-500 font-medium">by</span>
                         <span className="text-xs text-white font-bold">{log.adminEmail}</span>
                      </div>
                      <p className="text-sm text-gray-300 font-medium">{log.details}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-mono shrink-0">
                   <Clock size={12} />
                   {log.timestamp?.toDate().toLocaleString()}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {lastDoc && (
          <div className="p-8 bg-white/[0.02] flex justify-center">
             <button 
                disabled={loading}
                onClick={() => fetchLogs(true)}
                className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
             >
                {loading ? 'Crunching data...' : 'Load older operations'}
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
