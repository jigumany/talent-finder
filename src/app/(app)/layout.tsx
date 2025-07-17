
'use client';
import { RoleProvider } from '@/context/role-context';
import { AppLayout } from '@/components/app-layout';
import { AIAssistant } from '@/components/ai-assistant';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <AppLayout>
        {children}
      </AppLayout>
      <AIAssistant />
    </RoleProvider>
  );
}
