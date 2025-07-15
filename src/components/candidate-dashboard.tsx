
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AvailabilityCalendar } from './availability-calendar';

export default function CandidateDashboard() {
  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold font-headline">My Dashboard</h1>
        <Card>
            <CardHeader>
                <CardTitle>Manage Your Availability</CardTitle>
                <CardDescription>
                    Select the dates you are unavailable. Clients will see your updated calendar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AvailabilityCalendar />
            </CardContent>
        </Card>
    </div>
  );
}
