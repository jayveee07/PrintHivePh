import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarCheck, ClipboardList, Clock, FileText, Phone, Send, UserRound } from 'lucide-react';
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Booking, BookingStatus, Service } from '../types';
import { cn, formatCurrency, formatDate } from '../lib/utils';

const statusSteps: BookingStatus[] = ['pending', 'reviewing', 'approved', 'in_production', 'ready', 'completed'];

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Pending',
  reviewing: 'Reviewing',
  approved: 'Approved',
  in_production: 'In Production',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

const serviceOptions = [
  'T-Shirt Printing',
  'Tarpaulin',
  'Stickers & Labels',
  'Flyers & Brochures',
  'Business Cards',
  'Acrylic Signage',
  'Invitations',
  'Custom Merchandise'
];

export function Bookings() {
  const { user, signIn } = useAuth();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    serviceType: serviceOptions[0],
    projectTitle: '',
    description: '',
    quantity: '1',
    preferredDate: '',
    budget: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    const selectedService = searchParams.get('service');
    if (!selectedService) return;

    setFormData(prev => ({
      ...prev,
      serviceType: selectedService,
      projectTitle: prev.projectTitle || selectedService,
    }));
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    setFormData(prev => ({
      ...prev,
      customerName: prev.customerName || user.displayName || '',
    }));
    fetchBookings();
  }, [user]);

  const fetchServices = async () => {
    try {
      const q = query(collection(db, 'services'), orderBy('title', 'asc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Service))
        .filter(service => service.active);
      setServices(items);

      setFormData(prev => {
        const selectedService = searchParams.get('service');
        const currentService = selectedService || prev.serviceType;
        const hasCurrentService = items.some(service => service.title === currentService);

        return {
          ...prev,
          serviceType: hasCurrentService ? currentService : items[0]?.title || prev.serviceType,
        };
      });
    } catch (error) {
      console.error('Error fetching service options:', error);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    setLoadingBookings(true);

    try {
      const q = query(
        collection(db, 'bookings'),
        where('customerId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Unable to load your bookings.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      await signIn();
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Sending booking request...');

    try {
      await addDoc(collection(db, 'bookings'), {
        customerId: user.uid,
        customerName: formData.customerName.trim(),
        email: user.email || '',
        phone: formData.phone.trim(),
        serviceType: formData.serviceType,
        projectTitle: formData.projectTitle.trim(),
        description: formData.description.trim(),
        quantity: Number(formData.quantity) || 1,
        preferredDate: formData.preferredDate,
        budget: Number(formData.budget) || 0,
        status: 'pending',
        adminNote: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Booking submitted. You can track it below.', { id: toastId });
      setFormData({
        customerName: user.displayName || '',
        phone: '',
        serviceType: serviceOptions[0],
        projectTitle: '',
        description: '',
        quantity: '1',
        preferredDate: '',
        budget: ''
      });
      fetchBookings();
    } catch (error) {
      toast.dismiss(toastId);
      console.error('Error creating booking:', error);
      toast.error('Booking could not be submitted. Please check your account or try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getProgress = (status: BookingStatus) => {
    if (status === 'cancelled') return 0;
    const index = statusSteps.indexOf(status);
    return index === -1 ? 0 : ((index + 1) / statusSteps.length) * 100;
  };

  return (
    <main className="pt-32 pb-24 px-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 lg:p-10 sticky top-28">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[#12A8FF]/10 text-[#12A8FF] flex items-center justify-center">
                <CalendarCheck size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white">Book a Print Job</h1>
                <p className="text-sm text-gray-500">Submit your project details and track production.</p>
              </div>
            </div>

            {!user ? (
              <div className="rounded-3xl bg-black/40 border border-white/10 p-8 text-center">
                <ClipboardList size={48} className="mx-auto mb-5 text-[#12A8FF]" />
                <h2 className="text-xl font-bold text-white mb-3">Sign In Required</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Please sign in before creating a booking so we can attach it to your account and show progress updates.
                </p>
                <button
                  type="button"
                  onClick={signIn}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#12A8FF] to-[#A020F0] text-white font-black shadow-[0_0_25px_rgba(18,168,255,0.25)]"
                >
                  Sign In to Continue
                </button>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    required
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#12A8FF]"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-[#12A8FF]"
                      placeholder="09..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Service</label>
                  <select
                    value={formData.serviceType}
                    onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-[#12A8FF]"
                  >
                    {(services.length > 0 ? services.map(service => service.title) : serviceOptions).map(service => (
                      <option key={service} value={service} className="bg-[#0B0F19]">{service}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Project Title</label>
                <input
                  required
                  value={formData.projectTitle}
                  onChange={e => setFormData({ ...formData, projectTitle: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-[#12A8FF]"
                  placeholder="e.g. Company shirt batch"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Project Details</label>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-[#12A8FF] resize-none"
                  placeholder="Size, material, colors, design notes, pickup or delivery details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Qty</label>
                  <input
                    required
                    min="1"
                    type="number"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-[#12A8FF]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Need By</label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-[#12A8FF]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Budget</label>
                  <input
                    min="0"
                    type="number"
                    value={formData.budget}
                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-[#12A8FF]"
                    placeholder="PHP"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#12A8FF] to-[#A020F0] text-white font-black shadow-[0_0_25px_rgba(18,168,255,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                Submit Booking <Send size={20} />
              </button>
            </form>
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 space-y-6"
        >
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-2">My Bookings</h2>
            <p className="text-gray-500">Progress updates appear here after admin review.</p>
          </div>

          {!user ? (
            <div className="min-h-[360px] rounded-[40px] bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center p-8">
              <ClipboardList size={56} className="text-gray-700 mb-6" />
              <p className="text-gray-400 mb-6">Sign in to see your booking progress.</p>
              <button onClick={signIn} className="px-6 py-3 rounded-full bg-[#12A8FF] text-white font-bold">
                Sign In
              </button>
            </div>
          ) : loadingBookings ? (
            <div className="space-y-4">
              {[1, 2, 3].map(item => <div key={item} className="h-44 rounded-3xl bg-white/5 animate-pulse" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="min-h-[360px] rounded-[40px] bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8">
              <Clock size={56} className="text-gray-700 mb-6" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.map(booking => (
                <div key={booking.id} className="relative overflow-hidden rounded-[32px] bg-white/5 border border-white/10 p-6">
                  <div
                    className={cn(
                      "absolute top-0 left-0 h-1 transition-all",
                      booking.status === 'cancelled' ? "bg-red-500" : "bg-[#12A8FF]"
                    )}
                    style={{ width: `${getProgress(booking.status)}%` }}
                  />
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-6">
                    <div>
                      <span className="text-xs font-mono text-[#12A8FF] font-bold">#BKG-{booking.id.slice(0, 8)}</span>
                      <h3 className="text-xl font-bold text-white mt-1">{booking.projectTitle}</h3>
                      <p className="text-sm text-gray-500">{booking.serviceType} • {formatDate(booking.createdAt)}</p>
                    </div>
                    <span className={cn(
                      "w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      booking.status === 'cancelled' ? "bg-red-500/10 text-red-500" : "bg-[#12A8FF]/10 text-[#12A8FF]"
                    )}>
                      {statusLabels[booking.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="rounded-2xl bg-black/30 border border-white/5 p-4">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Quantity</p>
                      <p className="text-white font-bold">{booking.quantity}</p>
                    </div>
                    <div className="rounded-2xl bg-black/30 border border-white/5 p-4">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Need By</p>
                      <p className="text-white font-bold">{booking.preferredDate || 'Flexible'}</p>
                    </div>
                    <div className="rounded-2xl bg-black/30 border border-white/5 p-4">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Budget</p>
                      <p className="text-white font-bold">{formatCurrency(booking.budget || 0)}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 leading-relaxed bg-black/20 rounded-2xl p-4 border border-white/5">
                    <FileText size={16} className="inline mr-2 text-gray-600" />
                    {booking.description}
                  </p>

                  {booking.adminNote && (
                    <div className="mt-4 rounded-2xl bg-[#FFC107]/10 border border-[#FFC107]/20 p-4 text-sm text-[#FFC107]">
                      {booking.adminNote}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}
