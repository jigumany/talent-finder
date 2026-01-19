'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchUserProfile } from '@/lib/data-service';
import { UserProfile } from '@/lib/types';

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await fetchUserProfile();
      
      if (error) {
        setError(error);
        setUser(null);
      } else if (data) {
        setUser(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <UserContext.Provider value={{ user, isLoading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Optional: Custom hooks for specific user data
export function useUserContact() {
  const { user } = useUser();
  return user?.contact;
}

export function useUserProfile() {
  const { user } = useUser();
  return user?.profile;
}

export function useUserCompany() {
  const { user } = useUser();
  return user?.profile?.company;
}