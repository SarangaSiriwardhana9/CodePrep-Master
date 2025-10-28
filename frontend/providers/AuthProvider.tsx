'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { User } from '@/features/auth/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, getProfile, isLoading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token && !user) {
        await getProfile();
      }
      setIsInitialized(true);
    };

    initAuth();
  }, [user, getProfile]);

  const value = {
    user,
    isLoading: !isInitialized || authLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}

