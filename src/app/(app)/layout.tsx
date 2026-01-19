'use client';
import { usePathname } from 'next/navigation';
import { RoleProvider } from '@/context/role-context';
import { UserProvider } from '@/context/user-context';
import { AppLayout } from '@/components/app-layout';
import { AIAssistant } from '@/components/ai-assistant';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <UserProvider>
      <RoleProvider>
        <AppLayout>
          {children}
        </AppLayout>
        {/* <AIAssistant /> */}
      </RoleProvider>
    </UserProvider>
  );
}
