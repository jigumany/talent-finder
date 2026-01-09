'use client';
import { usePathname, redirect } from 'next/navigation';
import { RoleProvider } from '@/context/role-context';
import { AppLayout } from '@/components/app-layout';
import { AIAssistant } from '@/components/ai-assistant';
import { useEffect } from 'react';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // This is a client-side redirect to handle the case where a user lands on the root of the app group.
    // A server-side redirect in this layout would cause an infinite loop.
    if (pathname === '/') {
      redirect('/dashboard');
    }
  }, [pathname]);

  // Don't render the layout for the root page, as it will be redirected.
  if (pathname === '/') {
    return null;
  }
  
  return (
    <RoleProvider>
        <AppLayout>
          {children}
        </AppLayout>
        <AIAssistant />
    </RoleProvider>
  );
}
