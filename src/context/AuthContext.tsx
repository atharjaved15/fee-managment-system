import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  userRole: 'super_admin' | 'accountant' | 'staff';
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'super_admin' | 'accountant' | 'staff'>('super_admin');
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          // Check if admin doc exists in /admins/{uid}
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            setIsAdmin(true);
            setUserRole(data.role || 'super_admin');
          } else {
            // Check if user is the bootstrapped super admin or assign initial admin
            const isBootstrapped = user.email === 'contact.atharjaved@gmail.com';
            if (isBootstrapped) {
              await setDoc(doc(db, 'admins', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Administrator',
                role: 'super_admin',
                createdAt: new Date().toISOString()
              });
              setIsAdmin(true);
              setUserRole('super_admin');
            } else {
              // Default authenticated user to admin in this college management portal
              setIsAdmin(true);
              setUserRole('super_admin');
            }
          }
        } catch {
          // Fallback if network or rules check
          setIsAdmin(true);
          setUserRole('super_admin');
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      console.error('Google Sign-in failed:', err);
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setCurrentUser(null);
      setIsAdmin(false);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        userRole,
        loading,
        signInWithGoogle,
        signOut,
        authError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
