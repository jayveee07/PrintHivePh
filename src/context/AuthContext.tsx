import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if profile exists, if not create one
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        let currentProfile: UserProfile;

        if (!userDoc.exists()) {
          const newProfile: Partial<UserProfile> = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Guest User',
            photoURL: user.photoURL || '',
            role: 'user',
            createdAt: new Date(),
          };
          await setDoc(userDocRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
          });
          currentProfile = newProfile as UserProfile;
        } else {
          currentProfile = userDoc.data() as UserProfile;
        }

        // Check if admin
        const adminDocRef = doc(db, 'admins', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        const isUserAdmin = adminDoc.exists() || user.email === 'jvpaisan@gmail.com';
        
        setIsAdmin(isUserAdmin);
        
        if (isUserAdmin) {
          currentProfile.role = 'admin';
        }
        
        setProfile(currentProfile);
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

  const signOut = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, signIn, signOut }}>
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
