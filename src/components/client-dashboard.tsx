
'use client';
import Link from 'next/link';
import { mockClientBookings } from '@/lib/mock-data';
import { CalendarCheck2, Calendar, Briefcase, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { format } from 'date-fns';


export default function ClientDashboard() {
    
    const confirmedBooking = mockClientBookings.find(b => b.status === 'Confirmed');

    return (
      <div className="flex flex-col gap-8">
         <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold font-headline">Client Dashboard</h1>
             <Button asChild>
                <Link href="/find-me-someone">
                    <Search className="mr-2 h-4 w-4"/> Find Me Someone
                </Link>
            </Button>
         </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Booking</CardTitle>
                    <CalendarCheck2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {confirmedBooking ? (
                        <>
                            <div className="text-2xl font-bold">{confirmedBooking.candidateName}</div>
                            <p className="text-xs text-muted-foreground">
                                For {format(new Date(confirmedBooking.date), "dd/MM/yyyy")}
                            </p>
                        </>
                    ) : (
                         <div className="text-lg font-semibold text-muted-foreground">None</div>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Manage Diary</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   <p className="text-xs text-muted-foreground mb-2">View and manage your booking schedule.</p>
                   <Button variant="outline" size="sm" asChild>
                     <Link href="/diary">Open Diary</Link>
                   </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Booking History</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                 <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">Review all past and upcoming bookings.</p>
                     <Button variant="outline" size="sm" asChild>
                        <Link href="/bookings">View Bookings</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Browse Candidates</CardTitle>
                <CardDescription>
                    Explore our pool of qualified candidates to find the perfect fit for your school.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    Our marketplace allows you to filter by role, subject, location, and rate to quickly find available staff.
                </p>
                <Button asChild>
                    <Link href="/browse-candidates">
                        <Search className="mr-2 h-4 w-4"/> Go to Marketplace
                    </Link>
                </Button>
            </CardContent>
        </Card>

      </div>
    );
}
