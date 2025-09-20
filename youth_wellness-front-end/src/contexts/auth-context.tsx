"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  firebaseReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // Check if Firebase auth is available
    if (!auth) {
      console.error('Firebase auth not initialized');
      setLoading(false);
      return;
    }

    setFirebaseReady(true);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error('Firebase not initialized. Please check your configuration.');
    }

    console.log("Attempting to SIGN IN with -> Email:", `'${email}'`, "Password:", `'${password}'`);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error : any) {

      console.error("FIREBASE SIGN UP ERROR:", error.code);
      console.error("Full Error Object:", error);

      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth) {
      throw new Error('Firebase not initialized. Please check your configuration.');
    }

    console.log("Attempting to SIGN UP with -> Email:", `'${email}'`, "Password:", `'${password}'`);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
    } catch (error: any) { // Catch the error to inspect it
      // THIS IS THE CRUCIAL PART
      console.error("FIREBASE SIGN UP ERROR:", error.code);
      console.error("Full Error Object:", error);
      
      // Re-throw the error so your form can still display a message
      throw error; 
    }
  };

  const signOutUser = async () => {
    if (!auth) {
      throw new Error('Firebase not initialized. Please check your configuration.');
    }
    
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase not initialized. Please check your configuration.');
    }
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) {
      throw new Error('Firebase not initialized. Please check your configuration.');
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    firebaseReady,
    signIn,
    signUp,
    signOutUser,
    signInWithGoogle,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
