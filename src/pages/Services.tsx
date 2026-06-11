import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CreditCard,
  FileText,
  Gift,
  Image as ImageIcon,
  Mail,
  Package,
  PanelsTopLeft,
  Search,
  Shirt,
  SlidersHorizontal,
  StickyNote,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Category, Service } from '../types';
import { formatCurrency } from '../lib/utils';

type PriceFilter = 'all' | 'under-100' | '100-500' | '500-1500' | '1500-plus';
type CategoryTypeFilter = 'all' | Category['type'];

const iconMap: Record<string, React.ReactNode> = {
  shirt: <Shirt size={32} />,
  panels: <PanelsTopLeft size={32} />,
  sticky: <StickyNote size={32} />,
  file: <FileText size={32} />,
  card: <CreditCard size={32} />,
  image: <ImageIcon size={32} />,
  mail: <Mail size={32} />,
  gift: <Gift size={32} />,
  package: <Package size={32} />,
};

const categoryTypeLabels: Record<CategoryTypeFilter, string> = {
  all: 'All Types',
  printing: 'Printing',
  office: 'Office',
  school: 'School',
  merchandise: 'Merchandise',
};

const priceFilters: { value: PriceFilter; label: string }[] = [
  { value: 'all', label: 'Any Price' },
  { value: 'under-100', label: 'Under PHP 100' },
  { value: '100-500', label: 'PHP 100 - 500' },
  { value: '500-1500', label: 'PHP 500 - 1,500' },
  { value: '1500-plus', label: 'PHP 1,500+' },
];

const fallbackCategories: Category[] = [
  { id: 'printing', name: 'Printing Services', type: 'printing' },
  { id: 'merchandise', name: 'Merchandise', type: 'merchandise' },
];

const fallbackServices: Service[] = [
  {
    id: 'shirt-printing',
    iconName: 'shirt',
    title: 'T-Shirt Printing',
    description: 'Custom designs on premium cotton tees using high-quality DTF or vinyl.',
    category: 'Merchandise',
    price: 250,
    priceLabel: 'Starts at PHP 250',
    active: true,
  },
  {
    id: 'tarpaulin',
    iconName: 'panels',
    title: 'Tarpaulin Printing',
    description: 'Large format printing for events, banners, and advertisements.',
    category: 'Printing Services',
    price: 35,
    priceLabel: 'Starts at PHP 35/sq.ft',
    active: true,
  },
  {
    id: 'stickers',
    iconName: 'sticky',
    title: 'Stickers & Labels',
    description: 'Durable, waterproof, and vibrant stickers for branding and packaging.',
    category: 'Printing Services',
    price: 50,
    priceLabel: 'Starts at PHP 50',
    active: true,
  },
];

const getServicePrice = (service: Service) => {
  if (service.priceLabel) return service.priceLabel;
  if (service.price > 0) return `Starts at ${formatCurrency(service.price)}`;
  return 'Request quote';
};

const matchesPriceFilter = (service: Service, priceFilter: PriceFilter) => {
  if (priceFilter === 'all') return true;

  const price = service.price || service.minPrice || 0;
  if (priceFilter === 'under-100') return price < 100;
  if (priceFilter === '100-500') return price >= 100 && price <= 500;
  if (priceFilter === '500-1500') return price >= 500 && price <= 1500;
  return price >= 1500;
};

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeType, setActiveType] = useState<CategoryTypeFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categorySnapshot, serviceSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'categories'), orderBy('name', 'asc'))),
          getDocs(query(collection(db, 'services'), orderBy('title', 'asc'))),
        ]);

        setCategories(categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
        setServices(
          serviceSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Service))
            .filter(service => service.active)
        );
      } catch (error) {
        console.error('Error loading services:', error);
        setCategories(fallbackCategories);
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryTypeByName = useMemo(() => {
    return new Map(categories.map(category => [category.name, category.type]));
  }, [categories]);

  const visibleCategoryNames = useMemo(() => {
    const names = new Set(services.map(service => service.category).filter(Boolean));
    return ['All', ...categories.filter(category => names.has(category.name)).map(category => category.name)];
  }, [categories, services]);

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return services.filter(service => {
      const categoryType = categoryTypeByName.get(service.category) || 'printing';
      const matchesSearch =
        !normalizedSearch ||
        service.title.toLowerCase().includes(normalizedSearch) ||
        service.description.toLowerCase().includes(normalizedSearch) ||
        service.category.toLowerCase().includes(normalizedSearch);

      return (
        matchesSearch &&
        (activeCategory === 'All' || service.category === activeCategory) &&
        (activeType === 'all' || categoryType === activeType) &&
        matchesPriceFilter(service, priceFilter)
      );
    });
  }, [activeCategory, activeType, categoryTypeByName, priceFilter, searchTerm, services]);

  const groupedServices = useMemo(() => {
    return filteredServices.reduce<Record<string, Service[]>>((groups, service) => {
      const category = service.category || 'Other Services';
      return {
        ...groups,
        [category]: [...(groups[category] || []), service],
      };
    }, {});
  }, [filteredServices]);

  const clearFilters = () => {
    setSearchTerm('');
    setActiveCategory('All');
    setActiveType('all');
    setPriceFilter('all');
  };

  return (
    <main className="pt-32 pb-24 px-6 bg-black min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-white mb-8"
          >
            Creative <span className="text-[#12A8FF]">Solutions</span>
          </motion.h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Browse PrintHive PH services by category, budget, or the exact print job you need.
          </p>
        </header>

        <section className="mb-10 rounded-[32px] bg-[#0B0F19] border border-white/10 p-5 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto_auto] gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search services, labels, apparel, signage..."
                className="w-full h-12 bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 text-sm text-white outline-none focus:border-[#12A8FF]"
              />
            </div>

            <select
              value={activeCategory}
              onChange={event => setActiveCategory(event.target.value)}
              className="h-12 bg-black/40 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white outline-none focus:border-[#12A8FF]"
            >
              {visibleCategoryNames.map(category => (
                <option key={category} value={category} className="bg-[#0B0F19]">
                  {category === 'All' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <select
              value={activeType}
              onChange={event => setActiveType(event.target.value as CategoryTypeFilter)}
              className="h-12 bg-black/40 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white outline-none focus:border-[#12A8FF]"
            >
              {Object.entries(categoryTypeLabels).map(([value, label]) => (
                <option key={value} value={value} className="bg-[#0B0F19]">
                  {label}
                </option>
              ))}
            </select>

            <select
              value={priceFilter}
              onChange={event => setPriceFilter(event.target.value as PriceFilter)}
              className="h-12 bg-black/40 border border-white/10 rounded-2xl px-4 text-sm font-bold text-white outline-none focus:border-[#12A8FF]"
            >
              {priceFilters.map(filter => (
                <option key={filter.value} value={filter.value} className="bg-[#0B0F19]">
                  {filter.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-bold"
            >
              <X size={16} /> Clear
            </button>
          </div>
        </section>

        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <SlidersHorizontal size={16} />
            <span>{filteredServices.length} service{filteredServices.length === 1 ? '' : 's'} shown</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="h-64 rounded-[32px] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="min-h-[360px] rounded-[40px] border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-8">
            <Search size={48} className="text-gray-700 mb-5" />
            <h2 className="text-2xl font-bold text-white mb-2">No services found</h2>
            <p className="text-gray-500 mb-6">Try a different category, type, price range, or search term.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-6 py-3 rounded-full bg-[#12A8FF] text-white font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <section key={category}>
                <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
                  <div>
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-[#12A8FF]">
                      {categoryTypeLabels[categoryTypeByName.get(category) || 'printing']}
                    </span>
                    <h2 className="text-3xl font-extrabold text-white mt-2">{category}</h2>
                  </div>
                  <span className="text-sm text-gray-500">{categoryServices.length} item{categoryServices.length === 1 ? '' : 's'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.2) }}
                      className="group p-7 rounded-[32px] bg-[#0B0F19] border border-white/5 hover:border-[#12A8FF]/50 transition-all flex flex-col min-h-[280px]"
                    >
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#12A8FF]/10 flex items-center justify-center text-[#12A8FF] group-hover:scale-105 transition-transform">
                          {iconMap[service.iconName] || <Package size={32} />}
                        </div>
                        <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          {service.unit || 'service'}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">{service.description}</p>

                      <div className="mt-auto flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-1">Price</p>
                          <p className="text-[#12A8FF] font-black">{getServicePrice(service)}</p>
                        </div>
                        <Link
                          to={`/bookings?service=${encodeURIComponent(service.title)}`}
                          className="shrink-0 w-11 h-11 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-[#12A8FF] hover:border-[#12A8FF] transition-all"
                          title={`Book ${service.title}`}
                        >
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
