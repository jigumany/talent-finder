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
import { fetchBookingsPaginated, createBooking, fetchCandidates } from "@/lib/data-service";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ReviewGeneratorForm } from "@/components/review-generator-form";
import { useUser } from "@/context/user-context";

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
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                            <div>{booking.candidateName}</div>
                        </TableCell>
                        <TableCell>
                            {booking.startDate === booking.endDate 
                                ? format(parseISO(booking.startDate), "PPP")
                                : `${format(parseISO(booking.startDate), "MMM d")} - ${format(parseISO(booking.endDate), "MMM d, yyyy")}`
                            }
                        </TableCell>
                        <TableCell>
                            <Badge
                                variant={
                                    booking.status === 'Confirmed' || booking.status === 'Completed' || booking.status === 'Hired' ? 'default' :
                                    booking.status === 'Rejected' || booking.status === 'Cancelled' ? 'destructive' :
                                    'secondary'
                                }
                                className={cn('whitespace-nowrap', {
                                    'bg-green-600 text-white': booking.status === 'Confirmed',
                                    'bg-blue-600 text-white': booking.status === 'Completed' || booking.status === 'Hired',
                                    'bg-destructive text-destructive-foreground': booking.status === 'Rejected' || booking.status === 'Cancelled',
                                    'bg-purple-600 text-purple-50': booking.status === 'Interview',
                                    'bg-amber-500 text-yellow-900': booking.status === 'Pencilled' || booking.status === 'Pending'
                                })}
                            >
                                {booking.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="text-xs">
                                {booking.bookingType}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                             {(booking.status === 'Completed' || booking.status === 'Hired') && !booking.isReviewed && (
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
    const { user } = useUser();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State for pagination
    const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);
    const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [totalPages, setTotalPages] = useState(0);
    const [totalBookings, setTotalBookings] = useState(0);
    
    // State for new booking dialog
    const [addBookingDialogOpen, setAddBookingDialogOpen] = useState(false);
    const [newBookingCandidateId, setNewBookingCandidateId] = useState<string>('');
    const [newBookingDates, setNewBookingDates] = useState<Date[] | undefined>([]);
    const [newBookingRole, setNewBookingRole] = useState('');
    const [newBookingType, setNewBookingType] = useState<'Day' | 'Hourly'>('Day');
    const [newBookingPayRate, setNewBookingPayRate] = useState<number>(0);
    const [newBookingCharge, setNewBookingCharge] = useState<number>(350);
    
    // State for review dialog
    const [bookingToReview, setBookingToReview] = useState<Booking | null>(null);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [bookingsResult, fetchedCandidates] = await Promise.all([
                    fetchBookingsPaginated(1, BOOKINGS_PER_PAGE * 2), // Load more for both tabs
                    fetchCandidates()
                ]);
                setBookings(bookingsResult.data);
                setAllCandidates(fetchedCandidates);
                setTotalPages(bookingsResult.totalPages);
                setTotalBookings(bookingsResult.total);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const loadMoreBookings = async (page: number, tab: string) => {
        try {
            const result = await fetchBookingsPaginated(page, BOOKINGS_PER_PAGE);
            if (tab === 'upcoming') {
                setUpcomingCurrentPage(page);
            } else {
                setCompletedCurrentPage(page);
            }
            setBookings(prev => [...prev, ...result.data]);
        } catch (error) {
            console.error('Error loading more bookings:', error);
        }
    };

    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
    }, [bookings]);

    const upcomingBookings = useMemo(() => 
        sortedBookings.filter(b => 
            (b.status === 'Confirmed' || b.status === 'Pencilled' || b.status === 'Pending') && 
            isFuture(parseISO(b.startDate))
        ), 
    [sortedBookings]);

    const completedBookings = useMemo(() => 
        sortedBookings.filter(b => 
            b.status === 'Completed' || 
            b.status === 'Hired' || 
            isPast(parseISO(b.endDate)) ||
            b.status === 'Cancelled' || 
            b.status === 'Rejected'
        ), 
    [sortedBookings]);

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

        // Create booking pattern
        const booking_pattern = newBookingDates.map(d => ({
            date: format(d, 'yyyy-MM-dd'),
            type: 'allday' // Default for now, can be expanded
        }));

        const result = await createBooking({ 
            candidateId: newBookingCandidateId,
            companyId: user?.profile?.company?.id as number,
            candidateName: candidate.name,
            payRate: newBookingPayRate || candidate.rate || 0,
            charge: newBookingCharge || 350,
            recurring: false,
            booking_pattern,
            start_date: format(newBookingDates[0], 'yyyy-MM-dd'),
            end_date: format(newBookingDates[newBookingDates.length - 1], 'yyyy-MM-dd'),
            booking_type: newBookingType,
            booking_role: newBookingRole,
        });
        
        if (result.success) {
            // Refresh bookings
            const newResult = await fetchBookingsPaginated(1, BOOKINGS_PER_PAGE);
            setBookings(newResult.data);
            
            toast({
                title: "Booking Request Sent!",
                description: `${candidate.name} has been booked for selected dates.`,
            });
            
            // Reset form
            setAddBookingDialogOpen(false);
            setNewBookingCandidateId('');
            setNewBookingDates([]);
            setNewBookingRole('');
            setNewBookingType('Day');
            setNewBookingPayRate(0);
            setNewBookingCharge(350);
        } else {
            toast({
                title: "Booking Failed",
                description: "Could not create the booking. Please try again.",
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
    
    const handleCandidateSelect = (value: string) => {
        setNewBookingCandidateId(value);
        const selectedCand = allCandidates.find(c => c.id === value);
        if (selectedCand) {
            setNewBookingRole(selectedCand.role || '');
            setNewBookingPayRate(selectedCand.rate || 0);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const renderPagination = (totalPages: number, currentPage: number, setCurrentPage: (page: number) => void, tab: string) => {
        if (totalPages <= 1) return null;
        return (
             <Pagination className="mt-6">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault(); 
                                if (currentPage > 1) {
                                    setCurrentPage(currentPage - 1);
                                    loadMoreBookings(currentPage - 1, tab);
                                }
                            }} 
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                        />
                    </PaginationItem>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                            <PaginationItem key={i}>
                                <PaginationLink 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault(); 
                                        setCurrentPage(pageNum);
                                        loadMoreBookings(pageNum, tab);
                                    }} 
                                    isActive={currentPage === pageNum}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        );
                    })}
                    {totalPages > 5 && (
                        <>
                            <PaginationItem>
                                <span className="px-4">...</span>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink 
                                    href="#" 
                                    onClick={(e) => {
                                        e.preventDefault(); 
                                        setCurrentPage(totalPages);
                                        loadMoreBookings(totalPages, tab);
                                    }}
                                >
                                    {totalPages}
                                </PaginationLink>
                            </PaginationItem>
                        </>
                    )}
                    <PaginationItem>
                        <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault(); 
                                if (currentPage < totalPages) {
                                    setCurrentPage(currentPage + 1);
                                    loadMoreBookings(currentPage + 1, tab);
                                }
                            }} 
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )
    }

    return (
        <>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold font-headline">My Bookings</h1>
                    <Dialog open={addBookingDialogOpen} onOpenChange={(isOpen) => {
                        setAddBookingDialogOpen(isOpen);
                        if (!isOpen) {
                            setNewBookingCandidateId('');
                            setNewBookingDates([]);
                            setNewBookingRole('');
                            setNewBookingPayRate(0);
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
                                        onValueChange={handleCandidateSelect}
                                        placeholder="Select a candidate..."
                                        emptyMessage="No candidate found."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Input 
                                        id="role" 
                                        placeholder="e.g. History Teacher" 
                                        value={newBookingRole} 
                                        onChange={(e) => setNewBookingRole(e.target.value)} 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="payRate">Daily Rate (£)</Label>
                                        <Input 
                                            id="payRate" 
                                            type="number"
                                            placeholder="e.g. 150" 
                                            value={newBookingPayRate} 
                                            onChange={(e) => setNewBookingPayRate(Number(e.target.value))} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="charge">Charge Rate (£)</Label>
                                        <Input 
                                            id="charge" 
                                            type="number"
                                            placeholder="e.g. 350" 
                                            value={newBookingCharge} 
                                            onChange={(e) => setNewBookingCharge(Number(e.target.value))} 
                                        />
                                    </div>
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
                                <Button 
                                    type="button" 
                                    onClick={handleAddNewBooking} 
                                    disabled={!newBookingCandidateId || !newBookingDates || newBookingDates.length === 0 || !newBookingRole}
                                >
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
                                {renderPagination(upcomingTotalPages, upcomingCurrentPage, setUpcomingCurrentPage, 'upcoming')}
                            </TabsContent>
                            <TabsContent value="completed">
                                <BookingsTable bookings={paginatedCompletedBookings} {...tableProps} />
                                {renderPagination(completedTotalPages, completedCurrentPage, setCompletedCurrentPage, 'completed')}
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