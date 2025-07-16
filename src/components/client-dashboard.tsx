
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandidateCard } from '@/components/candidate-card';
import { mockCandidates } from '@/lib/mock-data';
import type { Candidate } from '@/lib/types';
import { ListFilter, Search, UserCheck, CalendarCheck2, Users, Calendar, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

function Filters() {
    return (
        <div className="grid gap-6">
            <div className="grid gap-3">
                <h3 className="font-semibold">Role</h3>
                <Select>
                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="ta">Teaching Assistant</SelectItem>
                        <SelectItem value="science">Science Teacher</SelectItem>
                        <SelectItem value="math">Math Teacher</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Separator />
            <div className="grid gap-3">
                <h3 className="font-semibold">Subject</h3>
                <Select>
                    <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Separator />
            <div className="grid gap-3">
                <h3 className="font-semibold">Location</h3>
                <Input placeholder="e.g. New York, NY" />
            </div>
        </div>
    )
}

export default function ClientDashboard() {
    const [allCandidates] = useState<Candidate[]>(mockCandidates);
    const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(allCandidates);
    const [searchTerm, setSearchTerm] = useState('');
    const confirmedBooking = mockClientBookings.find(b => b.status === 'Confirmed');

    useEffect(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const filtered = allCandidates.filter(candidate => 
            candidate.name.toLowerCase().includes(lowercasedTerm) ||
            candidate.role.toLowerCase().includes(lowercasedTerm) ||
            candidate.qualifications.some(q => q.toLowerCase().includes(lowercasedTerm))
        );
        setFilteredCandidates(filtered);
    }, [searchTerm, allCandidates]);
    
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
                                For {new Date(confirmedBooking.date).toLocaleDateString()}
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

        <div className="grid md:grid-cols-[240px_1fr] gap-8" id="marketplace">
            <aside className="hidden md:block">
                <div className="sticky top-20">
                    <h2 className="text-lg font-semibold mb-4">Filters</h2>
                    <Filters />
                </div>
            </aside>
            
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-headline">Candidate Marketplace</h2>
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <ListFilter className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <h2 className="text-lg font-semibold my-4">Filters</h2>
                                <Filters />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name or keyword..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCandidates.map(candidate => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                </div>
                 {filteredCandidates.length === 0 && (
                    <div className="text-center text-muted-foreground col-span-full py-12">
                        <p className="text-lg font-semibold">No candidates found.</p>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                 )}
            </div>
        </div>
      </div>
    );
}
