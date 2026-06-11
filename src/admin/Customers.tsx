import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile } from '../types';
import { formatDate, cn } from '../lib/utils';

export function CustomerManagement() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => doc.data() as UserProfile);
      setCustomers(items);
    } catch (error) {
       console.error('Error:', error);
    } finally {
       setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0B0F19] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#12A8FF]"
          />
        </div>
      </div>

      <div className="bg-[#0B0F19] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs text-gray-400 uppercase tracking-widest font-bold">
              <tr>
                <th className="px-8 py-4">Customer</th>
                <th className="px-8 py-4">Contact</th>
                <th className="px-8 py-4">Joined At</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr><td colSpan={4} className="p-12 text-center text-gray-500">Loading Hive members...</td></tr>
              ) : filteredCustomers.map((customer) => (
                <tr key={customer.uid} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       {customer.photoURL ? (
                         <img src={customer.photoURL} alt="" className="w-10 h-10 rounded-full border border-white/10" />
                       ) : (
                         <div className="w-10 h-10 rounded-full border border-white/10 bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                           {customer.displayName?.charAt(0) || 'U'}
                         </div>
                       )}
                       <span className="font-bold text-white">{customer.displayName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-gray-300">{customer.email}</p>
                  </td>
                  <td className="px-8 py-6 text-gray-500">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2 py-1 rounded bg-[#12A8FF]/10 text-[#12A8FF] text-[10px] font-black uppercase tracking-widest">
                       Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
