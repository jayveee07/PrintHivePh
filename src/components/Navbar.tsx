import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Hexagon as Box, User, Search, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { signInWithGoogle } from '../firebase/config';
import { AdminLoginModal } from './AdminLoginModal';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, profile, isAdmin } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Supplies', href: '/supplies' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  // Hidden admin trigger: CTRL + SHIFT + Logo Click
  const handleLogoClick = (e: React.MouseEvent) => {
    if (e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      if (isAdmin) {
        navigate('/admin');
      } else {
        setIsAdminLoginOpen(true);
      }
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 px-6 py-4',
        scrolled ? 'bg-black/80 backdrop-blur-md shadow-lg border-b border-white/10' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-2 group"
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-[#12A8FF] to-[#FF1493] rounded-lg flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(18,168,255,0.5)] transition-all">
             <div className="text-white font-bold text-xl italic">PH</div>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            PrintHive PH
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-[#12A8FF]',
                location.pathname === link.href ? 'text-[#12A8FF]' : 'text-gray-300'
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-4">
          {isAdmin && (
            <Link 
              to="/admin" 
              className="px-4 py-2 rounded-full border border-[#12A8FF]/30 text-[#12A8FF] text-sm font-black uppercase tracking-widest hover:bg-[#12A8FF]/10 transition-all flex items-center gap-2"
            >
              <Box size={14} /> Dashboard
            </Link>
          )}
          {user ? (
            <Link to="/profile" className="flex items-center gap-2 text-white hover:text-[#12A8FF] transition-colors">
              <img src={user.photoURL || undefined} alt="" className="w-8 h-8 rounded-full border border-white/20" />
              <span className="text-sm font-medium">{user.displayName?.split(' ')[0]}</span>
            </Link>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-[#12A8FF] to-[#A020F0] text-white text-sm font-medium hover:scale-105 transition-all shadow-[0_0_15px_rgba(18,168,255,0.3)]"
            >
              Get Started
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-gray-300 hover:text-[#12A8FF]"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/10 my-2" />
              {isAdmin && (
                 <Link 
                   to="/admin" 
                   onClick={() => setIsOpen(false)}
                   className="flex items-center gap-3 text-[#12A8FF] font-black uppercase tracking-widest text-sm py-2"
                 >
                    <Box size={20} /> Admin Dashboard
                 </Link>
              )}
              {user ? (
                 <Link to="/profile" className="flex items-center gap-3 text-white">
                    <img src={user.photoURL || undefined} alt="" className="w-10 h-10 rounded-full" />
                    <span>My Profile</span>
                 </Link>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#12A8FF] to-[#A020F0] text-white font-medium"
                >
                  Join the Hive
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdminLoginModal 
        isOpen={isAdminLoginOpen} 
        onClose={() => setIsAdminLoginOpen(false)} 
      />
    </nav>
  );
}
