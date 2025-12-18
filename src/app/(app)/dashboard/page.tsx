
'use client';
import { useRole } from '@/context/role-context';
import ClientDashboard from '@/components/client-dashboard';
import CandidateDashboard from '@/components/candidate-dashboard';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const { role } = useRole();
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // This effect ensures we have the correct role from the provider
        // before rendering role-specific dashboards.
        setIsClient(role === 'client');
        setIsLoading(false);
    }, [role]);
    
    if (isLoading) {
        return (
             <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return isClient ? <ClientDashboard /> : <CandidateDashboard />;
}
