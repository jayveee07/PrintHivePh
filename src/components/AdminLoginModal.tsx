import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Fingerprint, X, ShieldCheck, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const { signIn, user, isAdmin } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  const handleAdminSignIn = async () => {
    setIsAuthenticating(true);
    const tid = toast.loading('Establishing secure connection...', {
      style: { background: '#0B0F19', color: '#12A8FF', border: '1px solid #12A8FF30' }
    });

    try {
      await signIn();
      // AuthContext will handle the profile check. 
      // We wait a moment for the context to update.
    } catch (error) {
      toast.error('Authentication failed', { id: tid });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Effect to navigate once admin status is confirmed after login
  React.useEffect(() => {
    if (user && isAdmin && isOpen) {
      toast.success('Admin access granted. Welcome to the Hive.', {
        icon: <ShieldCheck className="text-green-500" />,
        duration: 4000
      });
      onClose();
      navigate('/admin');
    } else if (user && !isAdmin && isOpen && !isAuthenticating) {
      toast.error('Unauthorized detected. Access denied.', {
        icon: <ShieldAlert className="text-red-500" />
      });
    }
  }, [user, isAdmin, isOpen, isAuthenticating]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden bg-[#06080E] border border-white/10 rounded-[32px] shadow-[0_0_50px_rgba(18,168,255,0.15)]"
          >
            {/* Cyberpunk Top Bar */}
            <div className="h-1 bg-gradient-to-r from-transparent via-[#12A8FF] to-transparent animate-pulse" />
            
            <div className="p-10 flex flex-col items-center text-center">
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0px #12A8FF00', '0 0 20px #12A8FF40', '0 0 0px #12A8FF00'],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-3xl bg-[#12A8FF]/5 border border-[#12A8FF]/30 flex items-center justify-center text-[#12A8FF] mb-8"
              >
                <Fingerprint size={40} className="animate-pulse" />
              </motion.div>

              <h2 className="text-2xl font-black text-white uppercase tracking-[4px] mb-2 font-heading">
                Admin <span className="text-[#12A8FF]">Gateway</span>
              </h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-10">
                Restricted Area • Authentication Required
              </p>

              <div className="w-full space-y-4">
                <button
                  onClick={handleAdminSignIn}
                  disabled={isAuthenticating}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#12A8FF] to-[#0070FF] text-white font-black text-sm uppercase tracking-[2px] transition-all flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(18,168,255,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <LogIn size={20} /> Initialize Link
                    </>
                  )}
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-xl border border-white/5 text-gray-600 font-bold text-xs uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all"
                >
                  Abort Protocol
                </button>
              </div>

              {/* Security Footer Decor */}
              <div className="mt-12 w-full flex items-center justify-between opacity-10">
                 <div className="h-px w-16 bg-white" />
                 <ShieldAlert size={16} className="text-white" />
                 <div className="h-px w-16 bg-white" />
              </div>
              <p className="mt-4 text-[8px] text-gray-600 uppercase tracking-[3px] font-black pointer-events-none">
                System Log: Unauthorized access is monitored.
              </p>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,168,255,0)_50%,rgba(18,168,255,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
