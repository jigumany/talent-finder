
'use client';

import { useState, useMemo, useEffect } from "react";
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isFuture, isPast } from "date-fns";
import { Calendar as CalendarIcon, ClipboardEdit, Star, PlusCircle, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking, Candidate, ClientReview } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { BookingCalendar } from "@/components/booking-calendar";
import { fetchBookings, createBooking, fetchCandidates } from "@/lib/data-service";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ReviewGeneratorForm } from "@/components/review-generator-form";

const BOOKINGS_PER_PAGE = 8;

function BookingsTable({ bookings, onLeaveReview }: { bookings: Booking[], onLeaveReview: (booking: Booking) => void }) {

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
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Confirmation</TableHead>
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
                        <TableCell>{format(new Date(booking.startDate), "PPP")} - {format(new Date(booking.endDate), "PPP")}</TableCell>
                        <TableCell>
                            <Badge
                                variant={
                                    booking.status === 'Hired' || booking.status === 'Completed' || booking.status.startsWith('Finished') ? 'default' :
                                    booking.status === 'Rejected' || booking.status === 'Cancelled' ? 'destructive' :
                                    'secondary'
                                }
                                className={cn('whitespace-nowrap', {
                                    'bg-primary text-primary-foreground': booking.status === 'Confirmed',
                                    'bg-green-600 text-white': booking.status === 'Completed' || booking.status === 'Hired' || booking.status.startsWith('Finished'),
                                    'bg-destructive text-destructive-foreground': booking.status === 'Rejected' || booking.status === 'Cancelled',
                                    'bg-purple-600 text-purple-50': booking.status === 'Interview',
                                    'bg-amber-500 text-yellow-900': booking.status === 'Pencilled'
                                })}
                            >
                                {booking.status}
                            </Badge>
                        </TableCell>
                         <TableCell>
                            {booking.confirmationStatus && (
                                <Badge
                                    variant={
                                        booking.confirmationStatus === 'Confirmed' ? 'default' :
                                        booking.confirmationStatus === 'Declined' ? 'destructive' :
                                        'secondary'
                                    }
                                     className={cn('whitespace-nowrap', {
                                        'bg-green-600 text-white': booking.confirmationStatus === 'Confirmed',
                                        'bg-destructive text-destructive-foreground': booking.confirmationStatus === 'Declined',
                                        'bg-yellow-500 text-yellow-900': booking.confirmationStatus === 'Pending',
                                    })}
                                >
                                    {booking.confirmationStatus}
                                </Badge>
                            )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                             {(booking.status === 'Completed' || booking.status.startsWith('Finished')) && !booking.isReviewed && (
                                <Button size="sm" onClick={() => onLeaveReview(booking)}>
                                    <Star className="mr-2 h-4 w-4" /> Leave a review
                                </Button>
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
    const [newBookingType, setNewBookingType] = useState<'Day' | 'Hourly'>('Day');
    
    const [newBookingSession, setNewBookingSession] = useState<'AllDay' | 'AM' | 'PM'>('AllDay');
    const [recurring, setRecurring] = useState(false);
    const [recurringDays, setRecurringDays] = useState({
        Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false, Sunday: false
    });

    // State for review dialog
    const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);

    // State for pagination
    const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);
    const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('upcoming');

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
    const completedBookings = useMemo(() => sortedBookings.filter(b => b.status === 'Completed' || b.status.startsWith('Finished') || isPast(parseISO(b.date))), [sortedBookings]);

    // Pagination Logic
    const upcomingTotalPages = Math.ceil(upcomingBookings.length / BOOKINGS_PER_PAGE);
    const completedTotalPages = Math.ceil(completedBookings.length / BOOKINGS_PER_PAGE);

    const paginatedUpcomingBookings = useMemo(() => {
        const startIndex = (upcomingCurrentPage - 1) * BOOKINGS_PER_PAGE;
        return upcomingBookings.slice(startIndex, startIndex + BOOKINGS_PER_PAGE);
    }, [upcomingBookings, upcomingCurrentPage]);

    const paginatedCompletedBookings = useMemo(() => {
        const startIndex = (completedCurrentPage - 1) * BOOKINGS_PER_PAGE;
        return completedBookings.slice(startIndex, startIndex + BOOKINGS_PER_PAGE);
    }, [completedBookings, completedCurrentPage]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
    }
    
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

        const result = await createBooking({ 
            candidateId: newBookingCandidateId,
            candidateName: candidate.name, 
            dates: newBookingDates, 
            role: newBookingRole,
            payRate: candidate.rate,
            charge: 350, // Hardcoded for now
            bookingType: newBookingType,
            recurring: recurring,
            recurringDays: recurringDays,
        });
        
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
            setNewBookingType('Day');
            setNewBookingSession('AllDay');
            setRecurring(false);
        } else {
             toast({
                title: "Booking Failed",
                description: "Could not create the booking. The candidate may not be available on the selected dates.",
                variant: "destructive",
            });
        }
    };
    
    const handleReviewSubmitted = (review: ClientReview) => {
        if (review.bookingId) {
            setBookings(prev => 
                prev.map(b => 
                    b.id === review.bookingId ? { ...b, isReviewed: true } : b
                )
            );
        }
        setBookingToReview(null);
        toast({
          title: 'Review Submitted!',
          description: 'Your feedback has been recorded.',
        });
    };

    const tableProps = {
        onLeaveReview: (booking: Booking) => setBookingToReview(booking),
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

    const renderPagination = (totalPages: number, currentPage: number, setCurrentPage: (page: number) => void) => {
        if (totalPages <= 1) return null;
        return (
             <Pagination className="mt-6">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => {e.preventDefault(); setCurrentPage(Math.max(1, currentPage - 1))}} className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}/>
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                         <PaginationItem key={i}>
                            <PaginationLink href="#" onClick={(e) => {e.preventDefault(); setCurrentPage(i + 1)}} isActive={currentPage === i + 1}>{i + 1}</PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => {e.preventDefault(); setCurrentPage(Math.min(totalPages, currentPage + 1))}} className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}/>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    }

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold font-headline">My Bookings</h1>
                    <Dialog open={addBookingDialogOpen} onOpenChange={(isOpen) => {
                        setAddBookingDialogOpen(isOpen);
                        if (!isOpen) {
                            setNewBookingCandidateId('');
                            setNewBookingDates([]);
                            setNewBookingRole('');
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Booking
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
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
                                    <Label>Booking Type</Label>
                                     <RadioGroup defaultValue="Day" value={newBookingType} onValueChange={(value: 'Day' | 'Hourly') => setNewBookingType(value)} className="flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Day" id="day" />
                                            <Label htmlFor="day">Daily</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="Hourly" id="hourly" />
                                            <Label htmlFor="hourly">Hourly</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                {newBookingType === 'Day' && (
                                     <div className="space-y-2 pl-2 border-l-2">
                                        <Label>Session</Label>
                                         <RadioGroup defaultValue="AllDay" value={newBookingSession} onValueChange={(value: 'AllDay' | 'AM' | 'PM') => setNewBookingSession(value)} className="flex gap-4">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="AllDay" id="allDay" />
                                                <Label htmlFor="allDay">All Day</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="AM" id="am" />
                                                <Label htmlFor="am">AM</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="PM" id="pm" />
                                                <Label htmlFor="pm">PM</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                )}
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
                    <Tabs defaultValue="upcoming" value={activeTab} onValueChange={handleTabChange}>
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
                                <BookingsTable bookings={paginatedUpcomingBookings} {...tableProps} />
                                {renderPagination(upcomingTotalPages, upcomingCurrentPage, setUpcomingCurrentPage)}
                            </TabsContent>
                            <TabsContent value="completed">
                                <BookingsTable bookings={paginatedCompletedBookings} {...tableProps} />
                                {renderPagination(completedTotalPages, completedCurrentPage, setCompletedCurrentPage)}
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            </div>

            {/* Review Dialog */}
            <Dialog open={!!bookingToReview} onOpenChange={(isOpen) => !isOpen && setBookingToReview(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Write a Review for {bookingToReview?.candidateName}</DialogTitle>
                        <DialogDescription>
                            Fill in the details below and our AI will help you draft a thoughtful and personalized review.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="pt-4">
                         <ReviewGeneratorForm 
                            candidateName={bookingToReview?.candidateName}
                            bookingId={bookingToReview?.id}
                            onReviewSubmitted={handleReviewSubmitted}
                         />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
