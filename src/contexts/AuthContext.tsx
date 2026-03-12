import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, handleFirestoreError, OperationType, googleProvider } from '../firebase';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data());
          } else {
            // Create profile if it doesn't exist
            const newProfile = {
              uid: user.uid,
              email: user.email,
              topics: ["Global Economy", "Geopolitics", "Technology"],
              deliveryTime: "08:00",
              lastReportDate: null
            };
            setDoc(userDocRef, newProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`));
            setProfile(newProfile);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const updateProfile = async (data: any) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout, updateProfile }}>
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
