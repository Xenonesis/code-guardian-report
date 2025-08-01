// lib/auth-context.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<UserCredential>;
  createUser: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastLogin: Date;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create user profile in Firestore
  const createUserProfile = async (user: User, displayName?: string) => {
    const userDoc = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDoc);
    
    if (!userSnap.exists()) {
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName || user.displayName || 'Anonymous User',
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      await setDoc(userDoc, profile);
      setUserProfile(profile);
    } else {
      // Update last login
      const existingProfile = userSnap.data() as UserProfile;
      const updatedProfile = {
        ...existingProfile,
        lastLogin: new Date()
      };
      
      await setDoc(userDoc, updatedProfile, { merge: true });
      setUserProfile(updatedProfile);
    }
  };

  // Sign in with email and password
  const signInWithEmailAndPasswordHandler = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user);
    return result;
  };

  // Create user with email and password
  const createUser = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(result.user, displayName);
    return result;
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserProfile(result.user);
    return result;
  };

  // Sign out
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        const userDoc = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDoc);
        
        if (userSnap.exists()) {
          setUserProfile(userSnap.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInWithEmailAndPassword: signInWithEmailAndPasswordHandler,
    createUser,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};