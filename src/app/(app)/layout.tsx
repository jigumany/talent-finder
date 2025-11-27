
'use client';
import { RoleProvider } from '@/context/role-context';
import { AppLayout } from '@/components/app-layout';
import { AIAssistant } from '@/components/ai-assistant';
import dynamic from 'next/dynamic';

const AppTour = dynamic(() => import('@/components/app-tour').then(mod => mod.AppTour), {
  ssr: false,
});


export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
        <AppLayout>
          {children}
        </AppLayout>
        <AIAssistant />
        <AppTour />
    </RoleProvider>
  );
}
