
'use client';

import { useState, useMemo, useEffect } from "react";
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isFuture, isPast } from "date-fns";
import { Calendar as CalendarIcon, ClipboardEdit, Users, Star, PlusCircle, Loader2, MoreVertical, XCircle, CalendarClock, Pencil } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking, Candidate } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { BookingCalendar } from "@/components/booking-calendar";
import { fetchBookings, createBooking, cancelBooking, fetchCandidates, updateBooking } from "@/lib/data-service";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import Link from 'next/link';

const BOOKINGS_PER_PAGE = 8;

function BookingsTable({ bookings, onCancelBooking, onEditBooking, onRescheduleBooking }: { bookings: Booking[], onCancelBooking: (id: string) => void, onEditBooking: (booking: Booking) => void, onRescheduleBooking: (booking: Booking) => void }) {

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
                                className={cn({
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
                                     className={cn({
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
                             {booking.status === 'Pencilled' && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEditBooking(booking)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onRescheduleBooking(booking)}>
                                            <CalendarClock className="mr-2 h-4 w-4" /> Reschedule
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive" onClick={() => onCancelBooking(booking.id)}>
                                            <XCircle className="mr-2 h-4 w-4" /> Cancel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
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
                             {(booking.status === 'Completed' || booking.status.startsWith('Finished')) && (
                                <Button size="sm" asChild>
                                    <Link href={`/review-generator?bookingId=${booking.id}`}>
                                        <Star className="mr-2 h-4 w-4" /> Leave a review
                                    </Link>
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

    // State for editing and rescheduling
    const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
    const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);

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

    // Effect to pre-fill edit form when a booking is selected
    useEffect(() => {
        if (bookingToEdit) {
            setNewBookingCandidateId(bookingToEdit.candidateId || '');
            setNewBookingRole(bookingToEdit.candidateRole);
            setNewBookingType(bookingToEdit.bookingType || 'Day');
            setNewBookingSession(bookingToEdit.session || 'AllDay');
            setNewBookingDates([parseISO(bookingToEdit.startDate), parseISO(bookingToEdit.endDate)]);
        }
    }, [bookingToEdit]);

    // Effect to pre-fill reschedule form
    useEffect(() => {
        if (bookingToReschedule) {
            setNewBookingDates([parseISO(bookingToReschedule.startDate), parseISO(bookingToReschedule.endDate)]);
        }
    }, [bookingToReschedule]);

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
    
    const handleCancelBooking = async (bookingId: string) => {
        const result = await cancelBooking(bookingId);
        if (result.success) {
            setBookings(prev => prev.filter(b => b.id !== bookingId));
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

        const result = await createBooking({ 
            candidateId: newBookingCandidateId, 
            dates: newBookingDates, 
            role: newBookingRole,
            bookingType: newBookingType,
            session: newBookingSession,
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
        } else {
             toast({
                title: "Booking Failed",
                description: "Could not create the booking. The candidate may not be available on the selected dates.",
                variant: "destructive",
            });
        }
    };

    const handleUpdateBooking = async () => {
        if (!bookingToEdit || !newBookingCandidateId || !newBookingDates || newBookingDates.length === 0 || !newBookingRole) {
            toast({ title: "Incomplete Information", variant: "destructive" });
            return;
        }
        
        const candidate = allCandidates.find(c => c.id === newBookingCandidateId);
        if (!candidate) return;

        const result = await updateBooking({
            id: bookingToEdit.id,
            candidateId: newBookingCandidateId,
            dates: newBookingDates,
            role: newBookingRole,
            bookingType: newBookingType,
            session: newBookingSession,
        });

        if (result.success && result.booking) {
            const updatedBookingWithDetails = {
                ...result.booking,
                candidateName: candidate.name,
                candidateRole: candidate.role,
            };
            setBookings(prev => prev.map(b => b.id === bookingToEdit.id ? updatedBookingWithDetails : b));
            toast({ title: "Booking Updated!", description: `The booking has been successfully updated.` });
            setBookingToEdit(null);
        } else {
            toast({ title: "Update Failed", description: "Could not update the booking.", variant: "destructive" });
        }
    };

    const handleRescheduleBooking = async () => {
        if (!bookingToReschedule || !newBookingDates || newBookingDates.length === 0) {
            toast({ title: "Please select new dates.", variant: "destructive" });
            return;
        }

        const result = await updateBooking({
            id: bookingToReschedule.id,
            dates: newBookingDates,
        });

        if (result.success && result.booking) {
             const updatedBookingWithDetails = {
                ...result.booking,
                candidateName: bookingToReschedule.candidateName,
                candidateRole: bookingToReschedule.candidateRole,
            };
            setBookings(prev => prev.map(b => b.id === bookingToReschedule.id ? updatedBookingWithDetails : b));
            toast({ title: "Booking Rescheduled!", description: `The booking has been successfully rescheduled.` });
            setBookingToReschedule(null);
        } else {
            toast({ title: "Reschedule Failed", description: "Could not reschedule the booking.", variant: "destructive" });
        }
    };

    const tableProps = {
        onCancelBooking: handleCancelBooking,
        onEditBooking: (booking: Booking) => setBookingToEdit(booking),
        onRescheduleBooking: (booking: Booking) => setBookingToReschedule(booking),
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

            {/* Edit Booking Dialog */}
            <Dialog open={!!bookingToEdit} onOpenChange={(isOpen) => !isOpen && setBookingToEdit(null)}>
                 <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Booking</DialogTitle>
                        <DialogDescription>
                            Update the details for the booking with {bookingToEdit?.candidateName}.
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
                            <Input id="role" value={newBookingRole} onChange={(e) => setNewBookingRole(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Booking Type</Label>
                                <RadioGroup value={newBookingType} onValueChange={(value: 'Day' | 'Hourly') => setNewBookingType(value)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Day" id="edit-day" />
                                    <Label htmlFor="edit-day">Daily</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Hourly" id="edit-hourly" />
                                    <Label htmlFor="edit-hourly">Hourly</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        {newBookingType === 'Day' && (
                                <div className="space-y-2 pl-2 border-l-2">
                                <Label>Session</Label>
                                    <RadioGroup value={newBookingSession} onValueChange={(value: 'AllDay' | 'AM' | 'PM') => setNewBookingSession(value)} className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="AllDay" id="edit-allDay" />
                                        <Label htmlFor="edit-allDay">All Day</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="AM" id="edit-am" />
                                        <Label htmlFor="edit-am">AM</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="PM" id="edit-pm" />
                                        <Label htmlFor="edit-pm">PM</Label>
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
                        <Button type="button" variant="secondary" onClick={() => setBookingToEdit(null)}>Cancel</Button>
                        <Button type="button" onClick={handleUpdateBooking}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reschedule Booking Dialog */}
            <Dialog open={!!bookingToReschedule} onOpenChange={(isOpen) => !isOpen && setBookingToReschedule(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reschedule Booking</DialogTitle>
                        <DialogDescription>
                            Select new dates for the booking with {bookingToReschedule?.candidateName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label>New Booking Dates</Label>
                        <div className="flex justify-center p-1">
                            <BookingCalendar
                                mode="multiple"
                                selected={newBookingDates}
                                onSelect={setNewBookingDates}
                                candidate={allCandidates.find(c => c.id === bookingToReschedule?.candidateId)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setBookingToReschedule(null)}>Cancel</Button>
                        <Button type="button" onClick={handleRescheduleBooking}>Confirm Reschedule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
