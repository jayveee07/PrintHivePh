import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Fingerprint, X, ShieldCheck, LogIn, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const { signIn, signInWithEmail, user, isAdmin, loading } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const navigate = useNavigate();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Identity required. Fill all fields.');
      return;
    }

    setIsAuthenticating(true);
    const tid = toast.loading('Bypassing firewall...', {
      style: { background: '#06080E', color: '#12A8FF', border: '1px solid #12A8FF30' }
    });

    try {
      await signInWithEmail(email, password);
      // Success will be handled by useEffect
      toast.dismiss(tid);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Access Denied: Invalid Credentials', { id: tid });
      setIsAuthenticating(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    const tid = toast.loading('Establishing secure link...', {
      style: { background: '#06080E', color: '#12A8FF', border: '1px solid #12A8FF30' }
    });

    try {
      await signIn();
      toast.dismiss(tid);
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('Domain not authorized. Please add this domain to Firebase Console.', { id: tid, duration: 6000 });
      } else {
        toast.error('Authentication failed', { id: tid });
      }
      setIsAuthenticating(false);
    }
  };

  // Effect to navigate once admin status is confirmed after login
  React.useEffect(() => {
    if (!loading && user && isAdmin && isOpen) {
      toast.success('Admin access granted. Welcome to the Hive.', {
        icon: <ShieldCheck className="text-green-500" />,
        duration: 4000
      });
      setIsAuthenticating(false);
      onClose();
      navigate('/admin');
    } else if (!loading && user && !isAdmin && isOpen && isAuthenticating) {
      toast.error('Unauthorized detected. Access denied.', {
        icon: <ShieldAlert className="text-red-500" />
      });
      setIsAuthenticating(false);
    }
  }, [user, isAdmin, isOpen, isAuthenticating, loading]);

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
            className="relative w-full max-w-lg overflow-hidden bg-[#06080E] border border-white/10 rounded-[32px] shadow-[0_0_50px_rgba(18,168,255,0.15)]"
          >
            {/* Cyberpunk Top Bar */}
            <div className="h-1 bg-gradient-to-r from-transparent via-[#12A8FF] to-transparent animate-pulse" />
            
            <div className="p-8 md:p-12 flex flex-col items-center">
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 0px #12A8FF00', '0 0 20px #12A8FF40', '0 0 0px #12A8FF00'],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-[#12A8FF]/5 border border-[#12A8FF]/30 flex items-center justify-center text-[#12A8FF] mb-6"
              >
                <Fingerprint size={32} className="animate-pulse" />
              </motion.div>

              <h2 className="text-2xl font-black text-white uppercase tracking-[4px] mb-2 font-heading text-center">
                Admin <span className="text-[#12A8FF]">Gateway</span>
              </h2>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-10 text-center">
                Secure Authentication Required • Authorization Lv. 4
              </p>

              {authMethod === 'email' ? (
                <form onSubmit={handleEmailSignIn} className="w-full space-y-6">
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#12A8FF] transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ADMIN IDENTITY"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold tracking-widest placeholder:text-gray-700 focus:outline-none focus:border-[#12A8FF]/50 focus:ring-4 focus:ring-[#12A8FF]/5 transition-all"
                      />
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#12A8FF] transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="ACCESS KEY"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-bold tracking-widest placeholder:text-gray-700 focus:outline-none focus:border-[#12A8FF]/50 focus:ring-4 focus:ring-[#12A8FF]/5 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#12A8FF] to-[#0070FF] text-white font-black text-sm uppercase tracking-[2px] transition-all flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(18,168,255,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={20} /> Authorize Access
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  className="w-full py-5 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-[2px] transition-all flex items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isAuthenticating ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <LogIn size={20} /> Link Google Node
                    </>
                  )}
                </button>
              )}

              <div className="mt-8 flex items-center gap-4 w-full">
                <div className="h-px bg-white/5 flex-1" />
                <button 
                  onClick={() => setAuthMethod(authMethod === 'email' ? 'google' : 'email')}
                  className="text-[10px] text-gray-500 font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  {authMethod === 'email' ? 'Use Google Protocol' : 'Use Direct Hash'}
                </button>
                <div className="h-px bg-white/5 flex-1" />
              </div>
              
              <button
                onClick={onClose}
                className="mt-6 w-full py-4 rounded-xl border border-white/5 text-gray-600 font-bold text-[10px] uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all"
              >
                Abort Protocol
              </button>

              <p className="mt-10 text-[8px] text-gray-600 uppercase tracking-[3px] font-black pointer-events-none text-center">
                System Log: Unauthorized attempts are reported to the hive.
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
