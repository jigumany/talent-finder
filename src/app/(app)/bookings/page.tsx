
'use client';

import { useState, useMemo, useEffect } from "react";
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isFuture, isPast } from "date-fns";
import { Calendar as CalendarIcon, ClipboardEdit, Users, Star, PlusCircle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking, Candidate } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { BookingCalendar } from "@/components/booking-calendar";
import { fetchBookings, createBooking, cancelBooking, fetchCandidates } from "@/lib/data-service";

function BookingsTable({ bookings, onCancelBooking }: { bookings: Booking[], onCancelBooking: (id: string) => void }) {
    if (bookings.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p className="font-semibold">No entries found in this category.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                            <div>{booking.candidateName}</div>
                            <div className="text-sm text-muted-foreground">{booking.candidateRole}</div>
                        </TableCell>
                        <TableCell>{format(new Date(booking.date), "PPP")}</TableCell>
                        <TableCell>
                            <Badge
                                variant={
                                    booking.status === 'Hired' || booking.status === 'Completed' ? 'default' :
                                    booking.status === 'Rejected' || booking.status === 'Cancelled' ? 'destructive' :
                                    'secondary'
                                }
                                className={cn({
                                    'bg-sky-500 text-sky-50': booking.status === 'Confirmed',
                                    'bg-green-600 text-white': booking.status === 'Completed' || booking.status === 'Hired',
                                    'bg-destructive text-destructive-foreground': booking.status === 'Rejected' || booking.status === 'Cancelled',
                                    'bg-purple-600 text-purple-50': booking.status === 'Interview'
                                })}
                            >
                                {booking.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                            {isFuture(parseISO(booking.date)) && booking.status === 'Confirmed' && (
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive">Cancel</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently cancel the booking with {booking.candidateName}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Back</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => onCancelBooking(booking.id)}
                                              className={buttonVariants({ variant: "destructive" })}
                                            >
                                              Confirm Cancellation
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function BookingsPage() {
    const { role } = useRole();
    const { toast } = useToast();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for new booking dialog
    const [addBookingDialogOpen, setAddBookingDialogOpen] = useState(false);
    const [newBookingCandidateId, setNewBookingCandidateId] = useState<string>('');
    const [newBookingDates, setNewBookingDates] = useState<Date[] | undefined>([]);
    const [newBookingRole, setNewBookingRole] = useState('');

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [fetchedBookings, fetchedCandidates] = await Promise.all([
                fetchBookings(),
                fetchCandidates()
            ]);
            setBookings(fetchedBookings);
            setAllCandidates(fetchedCandidates);
            setIsLoading(false);
        }
        loadData();
    }, []);
    

    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [bookings]);

    const upcomingBookings = useMemo(() => sortedBookings.filter(b => b.status === 'Confirmed' && isFuture(parseISO(b.date))), [sortedBookings]);
    const completedBookings = useMemo(() => sortedBookings.filter(b => b.status === 'Completed' || isPast(parseISO(b.date))), [sortedBookings]);
    
    const handleCancelBooking = async (bookingId: string) => {
        const result = await cancelBooking(bookingId);
        if (result.success) {
            setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: 'Cancelled'} : b));
            toast({
                title: "Booking Cancelled",
                description: `The booking has been successfully cancelled.`,
                variant: "destructive"
            });
        } else {
             toast({
                title: "Error",
                description: `There was a problem cancelling the booking.`,
                variant: "destructive"
            });
        }
    };
    
    const handleAddNewBooking = async () => {
        if (!newBookingCandidateId || !newBookingDates || newBookingDates.length === 0 || !newBookingRole) {
            toast({
                title: "Incomplete Information",
                description: "Please select a candidate, role, and at least one date.",
                variant: "destructive",
            });
            return;
        }

        const candidate = allCandidates.find(c => c.id === newBookingCandidateId);
        if (!candidate) return;

        const result = await createBooking({ candidateId: newBookingCandidateId, dates: newBookingDates, role: newBookingRole });
        
        if (result.success && result.bookings) {
             const newBookingsWithDetails = result.bookings.map(b => ({
                ...b,
                candidateName: candidate.name,
                candidateRole: candidate.role,
            }));
            setBookings(prev => [...newBookingsWithDetails, ...prev]);

            toast({
                title: "Booking Confirmed!",
                description: `${candidate.name} has been booked for ${newBookingDates.map(d => format(d, 'PPP')).join(', ')}.`,
            });
            
            setAddBookingDialogOpen(false);
            setNewBookingCandidateId('');
            setNewBookingDates([]);
            setNewBookingRole('');
        } else {
             toast({
                title: "Booking Failed",
                description: "Could not create the booking. The candidate may not be available on the selected dates.",
                variant: "destructive",
            });
        }
    };

    const tableProps = {
        onCancelBooking: handleCancelBooking,
    };

    const candidateOptions = useMemo(() => allCandidates.map(c => ({
        value: c.id,
        label: `${c.name} - ${c.role}`
    })), [allCandidates]);
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold font-headline">My Bookings</h1>
                    <Dialog open={addBookingDialogOpen} onOpenChange={setAddBookingDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Booking
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add a New Booking</DialogTitle>
                                <DialogDescription>
                                    Select a candidate and the dates you wish to book them for.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="candidate-select">Candidate</Label>
                                    <Combobox
                                        options={candidateOptions}
                                        value={newBookingCandidateId}
                                        onValueChange={(value) => {
                                            setNewBookingCandidateId(value);
                                            const selectedCand = allCandidates.find(c => c.id === value);
                                            setNewBookingRole(selectedCand?.role || '');
                                        }}
                                        placeholder="Select a candidate..."
                                        emptyMessage="No candidate found."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input id="role" placeholder="e.g. History Teacher" value={newBookingRole} onChange={(e) => setNewBookingRole(e.target.value)} />
                                </div>
                                    <div className="space-y-2">
                                    <Label>Booking Dates</Label>
                                    <div className="flex justify-center p-1">
                                        <BookingCalendar
                                            mode="multiple"
                                            selected={newBookingDates}
                                            onSelect={setNewBookingDates}
                                            candidate={allCandidates.find(c => c.id === newBookingCandidateId)}
                                        />
                                    </div>
                                    </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button type="button" onClick={handleAddNewBooking} disabled={!newBookingCandidateId || !newBookingDates || newBookingDates.length === 0 || !newBookingRole}>
                                    Confirm Booking
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                
                
                <Card>
                    <Tabs defaultValue="upcoming">
                        <CardHeader>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upcoming">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    Upcoming ({upcomingBookings.length})
                                </TabsTrigger>
                                <TabsTrigger value="completed">
                                    <ClipboardEdit className="mr-2 h-4 w-4" />
                                    Completed & Past ({completedBookings.length})
                                </TabsTrigger>
                            </TabsList>
                        </CardHeader>
                        <CardContent>
                            <TabsContent value="upcoming">
                                <BookingsTable bookings={upcomingBookings} {...tableProps} />
                            </TabsContent>
                            <TabsContent value="completed">
                                <BookingsTable bookings={completedBookings} {...tableProps} />
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </>
    );
}
