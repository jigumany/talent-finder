
'use client';
import { useRole } from '@/context/role-context';
import ClientDashboard from '@/components/client-dashboard';

export default function DashboardPage() {
    const { role } = useRole();
    
    return <ClientDashboard />;
}
