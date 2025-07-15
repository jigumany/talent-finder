
'use client';
import { RoleProvider } from '@/context/role-context';
import { AppLayout } from '@/components/app-layout';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AppLayout>
        {children}
      </AppLayout>
    </RoleProvider>
  );
}
