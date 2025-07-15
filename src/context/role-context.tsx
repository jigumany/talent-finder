
'use client';

import { createContext, useState, useContext, type Dispatch, type SetStateAction } from 'react';

export type Role = 'client' | 'candidate';

type RoleContextType = {
  role: Role;
  setRole: Dispatch<SetStateAction<Role>>;
};

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('client');
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
