import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Check if user exists in Firestore
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // Create user document
            await setDoc(userRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Anonymous Artist',
              photoURL: currentUser.photoURL || '',
              bio: '',
              role: 'user',
              createdAt: serverTimestamp(),
            });
          }
        } catch (err) {
          console.error("Error setting up user in Firestore:", err);
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/network-request-failed' || error.code === 'auth/popup-blocked') {
        setError("Login popup was blocked or failed due to network issues. Please ensure popups are allowed, disable ad-blockers, or try opening the app in a new tab.");
      } else {
        setError(error.message || "An error occurred during login.");
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 z-[100] bg-red-500/90 text-white px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border border-red-400 max-w-md flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <h3 className="font-bold">Authentication Error</h3>
            <button onClick={clearError} className="text-white/80 hover:text-white">✕</button>
          </div>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};
