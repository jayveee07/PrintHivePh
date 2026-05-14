import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, signInWithEmailAndPassword, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      setUser(authenticatedUser);
      
      if (authenticatedUser) {
        try {
          // Check if profile exists, if not create one
          const userDocRef = doc(db, 'users', authenticatedUser.uid);
          const userDoc = await getDoc(userDocRef);

          let currentProfile: UserProfile;

          if (!userDoc.exists()) {
            const newProfile: Partial<UserProfile> = {
              uid: authenticatedUser.uid,
              email: authenticatedUser.email || '',
              displayName: authenticatedUser.displayName || 'Guest User',
              photoURL: authenticatedUser.photoURL || '',
              role: 'user',
              createdAt: new Date(),
            };
            
            await setDoc(userDocRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
            });
            
            currentProfile = { ...newProfile, role: 'user', createdAt: new Date() } as UserProfile;
          } else {
            currentProfile = userDoc.data() as UserProfile;
          }

          // Check if admin
          let isUserAdmin = false;
          // Check hardcoded list first to avoid unnecessary Firestore call
          const isHardcodedAdmin = authenticatedUser.email === 'jvpaisan@gmail.com' || 
                                  authenticatedUser.email === 'printhiveph.2026@gmail.com' ||
                                  authenticatedUser.uid === '8Ajzo3JgCre3CXgIwI7entja1yr2' ||
                                  authenticatedUser.uid === 'ux0ysOYCeTYKFFHO9BCWqrM08f32' ||
                                  authenticatedUser.uid === 'KtvVHRSr28X8i4b3jd84F4gK7953';
          
          if (isHardcodedAdmin) {
            isUserAdmin = true;
          } else {
            try {
              const adminDocRef = doc(db, 'admins', authenticatedUser.uid);
              const adminDoc = await getDoc(adminDocRef);
              isUserAdmin = adminDoc.exists();
            } catch (adminError: any) {
              // Only log if it's not a standard permission error for a non-admin user
              if (adminError.code !== 'permission-denied') {
                console.error('Admin check error:', adminError);
              }
            }
          }
          
          setIsAdmin(isUserAdmin);
          if (isUserAdmin) {
            currentProfile.role = 'admin';
          }
          
          setProfile(currentProfile);
        } catch (error) {
          console.error('Error in AuthProvider initialization:', error);
          // If profile fetch fails, we still set the user but might have limited profile info
          setProfile(null); 
        }
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    await signInWithGoogle();
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        // If it's the specific admin user and login fails, try to create it 
        // Note: This only works if Email/Password sign-up is enabled in Firebase Console
        if (email === 'printhiveph.2026@gmail.com') {
           try {
             const { createUserWithEmailAndPassword } = await import('firebase/auth');
             await createUserWithEmailAndPassword(auth, email, pass);
             return;
           } catch (createError) {
             console.error('Failed to auto-create admin:', createError);
           }
        }
      }
      throw error;
    }
  };

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signIn, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
