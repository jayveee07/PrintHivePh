import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, CheckCircle2, ClipboardList, Mail, Phone, Search, XCircle } from 'lucide-react';
import { collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../firebase/logger';
import { Booking, BookingStatus } from '../types';
import { cn, formatCurrency, formatDate } from '../lib/utils';

const statuses: (BookingStatus | 'All')[] = ['All', 'pending', 'reviewing', 'approved', 'in_production', 'ready', 'completed', 'cancelled'];

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pending',
  reviewing: 'Reviewing',
  approved: 'Approved',
  in_production: 'In Production',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

const statusColors: Record<BookingStatus, string> = {
  pending: '#FFC107',
  reviewing: '#12A8FF',
  approved: '#A020F0',
  in_production: '#FF1493',
  ready: '#38BDF8',
  completed: '#22C55E',
  cancelled: '#EF4444'
};

export function BookingManagement() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(items);
      setNotes(Object.fromEntries(items.map(item => [item.id, item.adminNote || ''])));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (booking: Booking, status: BookingStatus) => {
    setSavingId(booking.id);

    try {
      await updateDoc(doc(db, 'bookings', booking.id), {
        status,
        updatedAt: serverTimestamp()
      });
      await logActivity(user, 'BOOKING_UPDATE', `Updated booking #${booking.id.slice(0, 8)} status to ${status}`, booking.id, 'booking');
      toast.success(`Booking marked ${statusLabels[status]}`);
      fetchBookings();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleNoteSave = async (booking: Booking) => {
    setSavingId(booking.id);

    try {
      await updateDoc(doc(db, 'bookings', booking.id), {
        adminNote: notes[booking.id] || '',
        updatedAt: serverTimestamp()
      });
      await logActivity(user, 'BOOKING_NOTE', `Updated booking #${booking.id.slice(0, 8)} admin note`, booking.id, 'booking');
      toast.success('Booking note saved');
      fetchBookings();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
    } finally {
      setSavingId(null);
    }
  };

  const getProgress = (status: BookingStatus) => {
    if (status === 'cancelled') return 100;
    const steps: BookingStatus[] = ['pending', 'reviewing', 'approved', 'in_production', 'ready', 'completed'];
    const index = steps.indexOf(status);
    return index === -1 ? 0 : ((index + 1) / steps.length) * 100;
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'All' || booking.status === filter;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (booking.customerName || '').toLowerCase().includes(search) ||
      (booking.email || '').toLowerCase().includes(search) ||
      (booking.projectTitle || '').toLowerCase().includes(search) ||
      (booking.serviceType || '').toLowerCase().includes(search) ||
      (booking.id || '').toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0B0F19] border border-white/5 p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Booking Management</h1>
          <p className="text-gray-500 text-sm font-medium">Review customer print bookings and update production status.</p>
        </div>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search bookings..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-[#12A8FF]"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap",
              filter === status ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-gray-500 hover:border-white/20"
            )}
          >
            {status === 'All' ? 'All' : statusLabels[status]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20 text-gray-600 bg-[#0B0F19] rounded-3xl border border-white/5">
          <ClipboardList size={64} className="mx-auto mb-6 opacity-20" />
          <p className="font-bold uppercase tracking-widest">No bookings found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.map(booking => (
            <motion.div
              key={booking.id}
              layout
              className="relative overflow-hidden p-8 rounded-[32px] bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-all"
            >
              <div
                className="absolute top-0 left-0 h-1"
                style={{
                  width: `${getProgress(booking.status)}%`,
                  backgroundColor: statusColors[booking.status],
                  boxShadow: `0 0 10px ${statusColors[booking.status]}`
                }}
              />

              <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="font-mono text-[#12A8FF] font-bold">#BKG-{booking.id.slice(0, 8)}</span>
                    <span className="text-xs text-gray-600">{formatDate(booking.createdAt)}</span>
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                      style={{ backgroundColor: `${statusColors[booking.status]}15`, color: statusColors[booking.status] }}
                    >
                      {statusLabels[booking.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Customer</h4>
                        <p className="text-white font-bold">{booking.customerName}</p>
                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1"><Mail size={14} /> {booking.email}</p>
                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1"><Phone size={14} /> {booking.phone}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Need By</p>
                          <p className="text-sm text-white font-bold flex items-center gap-2">
                            <Calendar size={14} /> {booking.preferredDate || 'Flexible'}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/5 border border-white/5 p-4">
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Budget</p>
                          <p className="text-sm text-white font-bold">{formatCurrency(booking.budget || 0)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Project</h4>
                      <p className="text-lg text-white font-bold">{booking.projectTitle}</p>
                      <p className="text-sm text-[#12A8FF] font-bold mb-3">{booking.quantity}x {booking.serviceType}</p>
                      <p className="text-sm text-gray-400 leading-relaxed bg-white/5 border border-white/5 rounded-2xl p-4">
                        {booking.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="xl:w-72 space-y-4">
                  <div>
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Update Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {(['reviewing', 'approved', 'in_production', 'ready', 'completed'] as BookingStatus[]).map(status => (
                        <button
                          key={status}
                          disabled={savingId === booking.id || booking.status === status}
                          onClick={() => handleStatusChange(booking, status)}
                          className={cn(
                            "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            booking.status === status ? "bg-white/10 text-white cursor-default" : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {statusLabels[status]}
                        </button>
                      ))}
                      <button
                        disabled={savingId === booking.id || booking.status === 'cancelled'}
                        onClick={() => handleStatusChange(booking, 'cancelled')}
                        className="py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 flex items-center justify-center gap-1"
                      >
                        <XCircle size={12} /> Cancel
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Customer Note</label>
                    <textarea
                      value={notes[booking.id] || ''}
                      onChange={e => setNotes({ ...notes, [booking.id]: e.target.value })}
                      className="w-full h-28 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#12A8FF] resize-none"
                      placeholder="Pickup time, payment instruction, production note..."
                    />
                    <button
                      disabled={savingId === booking.id}
                      onClick={() => handleNoteSave(booking)}
                      className="w-full py-3 rounded-xl bg-[#12A8FF]/10 text-[#12A8FF] font-bold text-sm hover:bg-[#12A8FF] hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} /> Save Note
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
