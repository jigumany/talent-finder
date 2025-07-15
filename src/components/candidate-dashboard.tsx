
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AvailabilityCalendar } from './availability-calendar';
import { mockCandidateBookings, mockTimesheets } from '@/lib/mock-data';
import { ListChecks, CalendarClock, AlertCircle, FileClock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export default function CandidateDashboard() {
  const upcomingBooking = mockCandidateBookings.find(b => b.status === 'Confirmed');
  const recentTimesheet = mockTimesheets.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold font-headline">My Dashboard</h1>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-1">
                 <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>A quick look at your latest updates.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   {upcomingBooking ? (
                     <div className="flex items-start gap-4">
                        <CalendarClock className="h-6 w-6 text-primary mt-1" />
                        <div>
                            <p className="font-semibold">Upcoming Booking</p>
                            <p className="text-sm text-muted-foreground">
                                {upcomingBooking.candidateRole} on {new Date(upcomingBooking.date).toLocaleDateString()}.
                            </p>
                        </div>
                    </div>
                   ) : (
                     <div className="flex items-start gap-4">
                        <ListChecks className="h-6 w-6 text-green-600 mt-1" />
                        <div>
                            <p className="font-semibold">All Caught Up!</p>
                            <p className="text-sm text-muted-foreground">
                                You have no upcoming bookings.
                            </p>
                        </div>
                    </div>
                   )}
                   <Separator />
                   {recentTimesheet ? (
                     <div className="flex items-start gap-4">
                        {recentTimesheet.status === 'Rejected' ? <AlertCircle className="h-6 w-6 text-destructive mt-1" /> : <FileClock className="h-6 w-6 text-primary mt-1" />}
                        <div>
                           <div className="flex items-center gap-2">
                             <p className="font-semibold">Latest Timesheet</p>
                             <Badge variant={recentTimesheet.status === 'Approved' ? 'default' : recentTimesheet.status === 'Rejected' ? 'destructive' : 'secondary'} className={recentTimesheet.status === 'Approved' ? 'bg-green-600' : ''}>
                                {recentTimesheet.status}
                            </Badge>
                           </div>
                           <p className="text-sm text-muted-foreground">
                                Submitted for {new Date(recentTimesheet.date).toLocaleDateString()} for {recentTimesheet.hours} hours.
                           </p>
                        </div>
                    </div>
                   ) : (
                     <div className="flex items-start gap-4">
                        <FileClock className="h-6 w-6 text-muted-foreground mt-1" />
                        <div>
                            <p className="font-semibold">No Timesheets Submitted</p>
                            <p className="text-sm text-muted-foreground">
                                You have not submitted any timesheets yet.
                            </p>
                        </div>
                    </div>
                   )}
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Manage Your Availability</CardTitle>
                    <CardDescription>
                        Select the dates you are available. Clients will see your updated calendar.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AvailabilityCalendar />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
