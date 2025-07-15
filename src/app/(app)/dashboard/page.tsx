
'use client';
import { useRole } from '@/context/role-context';
import ClientDashboard from '@/components/client-dashboard';
import CandidateDashboard from '@/components/candidate-dashboard';

export default function DashboardPage() {
    const { role } = useRole();
    
    return role === 'client' ? <ClientDashboard /> : <CandidateDashboard />;
}
