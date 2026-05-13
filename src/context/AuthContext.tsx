import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, signInWithEmailAndPassword } from '../firebase/config';
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if profile exists, if not create one
        const userDocRef = doc(db, 'users', user.uid);
        let userDoc;
        try {
          userDoc = await getDoc(userDocRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
          return;
        }

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
          try {
            await setDoc(userDocRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
            return;
          }
          currentProfile = newProfile as UserProfile;
        } else {
          currentProfile = userDoc.data() as UserProfile;
        }

        // Check if admin
        let isUserAdmin = false;
        try {
          const adminDocRef = doc(db, 'admins', user.uid);
          const adminDoc = await getDoc(adminDocRef);
          isUserAdmin = adminDoc.exists() || 
                             user.email === 'jvpaisan@gmail.com' || 
                             user.email === 'printhiveph.2026@gmail.com' ||
                             user.uid === 'ux0ysOYCeTYKFFHO9BCWqrM08f32' ||
                             user.uid === 'KtvVHRSr28X8i4b3jd84F4gK7953';
        } catch (error) {
          // Fallback if admin check fails (e.g. permission error on admins collection)
          isUserAdmin = user.email === 'jvpaisan@gmail.com' || 
                        user.email === 'printhiveph.2026@gmail.com' ||
                        user.uid === 'ux0ysOYCeTYKFFHO9BCWqrM08f32' ||
                        user.uid === 'KtvVHRSr28X8i4b3jd84F4gK7953';
        }
        
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
