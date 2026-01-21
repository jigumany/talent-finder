'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isFuture, isPast } from "date-fns";
import { Calendar as CalendarIcon, ClipboardEdit, Eye, Loader2, MapPin, PoundSterling, User, Calendar, Clock, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking } from "@/lib/types";
import { fetchBookingsPaginated } from "@/lib/data-service";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const BOOKINGS_PER_PAGE = 10;

// Helper function to safely format charge
const formatCharge = (charge: any): string => {
  if (charge === null || charge === undefined) return 'N/A';
  
  // Convert to number if it's a string
  const num = typeof charge === 'string' ? parseFloat(charge) : Number(charge);
  
  // Check if it's a valid number
  if (isNaN(num)) return 'N/A';
  
  return `£${num.toFixed(2)}`;
};

// Helper function to safely get booking type
const getBookingType = (bookingType: any): string => {
  if (!bookingType) return 'Day';
  if (typeof bookingType === 'string') {
    return bookingType.charAt(0).toUpperCase() + bookingType.slice(1).toLowerCase();
  }
  return 'Day';
};

// Helper function to safely check if recurring
const isRecurring = (recurring: any): boolean => {
  if (recurring === null || recurring === undefined) return false;
  if (typeof recurring === 'boolean') return recurring;
  if (typeof recurring === 'number') return recurring === 1;
  if (typeof recurring === 'string') {
    return recurring === '1' || recurring.toLowerCase() === 'true' || recurring.toLowerCase() === 'yes';
  }
  return false;
};

function BookingsTable({ bookings, onViewBooking }: { bookings: Booking[], onViewBooking: (booking: Booking) => void }) {
    if (bookings.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p className="font-semibold">No entries found in this category.</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="min-w-[160px]">Dates</TableHead>
                        <TableHead>Charge</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.map((booking) => (
                        <TableRow key={booking.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{booking.candidateName || 'Unknown Candidate'}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">{booking.candidateRole || 'Unknown Role'}</div>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        {booking.startDate && booking.endDate ? (
                                            booking.startDate === booking.endDate 
                                                ? format(parseISO(booking.startDate), "MMM d, yyyy")
                                                : `${format(parseISO(booking.startDate), "MMM d")} - ${format(parseISO(booking.endDate), "MMM d, yyyy")}`
                                        ) : 'Date not set'}
                                    </div>
                                    {booking.bookingPattern && Array.isArray(booking.bookingPattern) && booking.bookingPattern.length > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                            {booking.bookingPattern.length} day{booking.bookingPattern.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center text-sm font-medium">
                                    <PoundSterling className="h-3 w-3 mr-0.5" />
                                    {formatCharge(booking.charge)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        booking.status === 'Confirmed' || booking.status === 'Completed' || booking.status === 'Hired' ? 'default' :
                                        booking.status === 'Rejected' || booking.status === 'Cancelled' ? 'destructive' :
                                        'secondary'
                                    }
                                    className={cn('whitespace-nowrap text-xs', {
                                        'bg-green-600 text-white': booking.status === 'Confirmed',
                                        'bg-blue-600 text-white': booking.status === 'Completed' || booking.status === 'Hired',
                                        'bg-destructive text-destructive-foreground': booking.status === 'Rejected' || booking.status === 'Cancelled',
                                        'bg-purple-600 text-purple-50': booking.status === 'Interview',
                                        'bg-amber-500 text-yellow-900': booking.status === 'Pencilled' || booking.status === 'Pending'
                                    })}
                                >
                                    {booking.status || 'Unknown'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1.5">
                                    <Badge variant="outline" className="text-xs">
                                        {getBookingType(booking.bookingType)}
                                    </Badge>
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="ghost" onClick={() => onViewBooking(booking)}>
                                    <Eye className="mr-2 h-4 w-4" /> View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function BookingDetailsDialog({ booking, open, onOpenChange }: { booking: Booking | null, open: boolean, onOpenChange: (open: boolean) => void }) {
    if (!booking) return null;

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Not set';
        try {
            return format(parseISO(dateString), "PPP");
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            return format(parseISO(dateString), "PPpp");
        } catch {
            return dateString;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                    <DialogDescription>
                        Details for booking with {booking.candidateName || 'Unknown Candidate'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Candidate</h4>
                            <p className="text-sm font-medium">{booking.candidateName || 'Unknown Candidate'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Role</h4>
                            <p className="text-sm">{booking.candidateRole || 'Unknown Role'}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                            <p className="text-sm flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(booking.startDate)}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">End Date</h4>
                            <p className="text-sm flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(booking.endDate)}
                            </p>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Booking Type</h4>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {getBookingType(booking.bookingType)}
                            </Badge>
                            {isRecurring(booking.recurring) && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Repeat className="h-3 w-3" />
                                    Recurring
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Charge</h4>
                            <p className="text-sm font-medium flex items-center gap-1">
                                <PoundSterling className="h-3 w-3" />
                                {formatCharge(booking.charge)}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                            <Badge
                                variant={
                                    booking.status === 'Confirmed' || booking.status === 'Completed' || booking.status === 'Hired' ? 'default' :
                                    booking.status === 'Rejected' || booking.status === 'Cancelled' ? 'destructive' :
                                    'secondary'
                                }
                                className={cn('whitespace-nowrap text-xs', {
                                    'bg-green-600 text-white': booking.status === 'Confirmed',
                                    'bg-blue-600 text-white': booking.status === 'Completed' || booking.status === 'Hired',
                                    'bg-destructive text-destructive-foreground': booking.status === 'Rejected' || booking.status === 'Cancelled',
                                    'bg-purple-600 text-purple-50': booking.status === 'Interview',
                                    'bg-amber-500 text-yellow-900': booking.status === 'Pencilled' || booking.status === 'Pending'
                                })}
                            >
                                {booking.status || 'Unknown'}
                            </Badge>
                        </div>
                    </div>
                    
                    {booking.bookingPattern && Array.isArray(booking.bookingPattern) && booking.bookingPattern.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Booking Pattern</h4>
                            <div className="mt-1 space-y-1 max-h-40 overflow-y-auto">
                                {booking.bookingPattern.map((pattern: any, index: number) => (
                                    <div key={index} className="text-xs flex items-center justify-between bg-muted/50 p-2 rounded">
                                        <span>{pattern.date || `Day ${index + 1}`}</span>
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {pattern.type || 'allday'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Created By</h4>
                            <p className="text-sm">{booking.createdBy || 'System'}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
                            <p className="text-sm flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDateTime(booking.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function BookingsPage() {
    const { toast } = useToast();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    
    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalBookings, setTotalBookings] = useState(0);
    
    // State for viewing booking details
    const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
    
    // Active tab state
    const [activeTab, setActiveTab] = useState('upcoming');

    // Fetch bookings on page load
    useEffect(() => {
        loadBookings();
    }, []);

    // Fetch bookings for specific page
    const loadBookings = async (page: number = 1) => {
        if (page === 1) {
            setIsLoading(true);
        } else {
            setLoadingMore(true);
        }
        
        try {
            const result = await fetchBookingsPaginated(page, BOOKINGS_PER_PAGE);
            if (page === 1) {
                setBookings(result.data);
            } else {
                setBookings(prev => [...prev, ...result.data]);
            }
            setTotalPages(result.totalPages);
            setTotalBookings(result.total);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error loading bookings:', error);
            toast({
                title: "Error",
                description: "Failed to load bookings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setLoadingMore(false);
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        loadBookings(page);
    };

    // Sort and filter bookings
    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => {
            try {
                if (!a.startDate || !b.startDate) return 0;
                return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
            } catch {
                return 0;
            }
        });
    }, [bookings]);

    const upcomingBookings = useMemo(() => 
        sortedBookings.filter(b => {
            try {
                if (!b.startDate) return false;
                return (b.status === 'Confirmed' || b.status === 'Pencilled' || b.status === 'Pending') && 
                       isFuture(parseISO(b.startDate));
            } catch {
                return false;
            }
        }), 
    [sortedBookings]);

    const completedBookings = useMemo(() => 
        sortedBookings.filter(b => {
            try {
                if (!b.endDate) {
                    // If no end date, check status
                    return b.status === 'Completed' || 
                           b.status === 'Hired' ||
                           b.status === 'Cancelled' || 
                           b.status === 'Rejected';
                }
                return b.status === 'Completed' || 
                       b.status === 'Hired' || 
                       isPast(parseISO(b.endDate)) ||
                       b.status === 'Cancelled' || 
                       b.status === 'Rejected';
            } catch {
                return false;
            }
        }), 
    [sortedBookings]);

    const handleViewBooking = (booking: Booking) => {
        setViewingBooking(booking);
    };

    const renderPagination = (totalPages: number, currentPage: number) => {
        if (totalPages <= 1) return null;
        
        const getPageNumbers = () => {
            const pages = [];
            const maxVisible = 5;
            let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let end = Math.min(totalPages, start + maxVisible - 1);
            
            if (end - start + 1 < maxVisible) {
                start = Math.max(1, end - maxVisible + 1);
            }
            
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
            
            return pages;
        };

        return (
            <Pagination className="mt-6">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault(); 
                                if (currentPage > 1) {
                                    handlePageChange(currentPage - 1);
                                }
                            }} 
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                        />
                    </PaginationItem>
                    
                    {getPageNumbers().map((pageNum) => (
                        <PaginationItem key={pageNum}>
                            <PaginationLink 
                                href="#" 
                                onClick={(e) => {
                                    e.preventDefault(); 
                                    handlePageChange(pageNum);
                                }} 
                                isActive={currentPage === pageNum}
                            >
                                {pageNum}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                        <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                                e.preventDefault(); 
                                if (currentPage < totalPages) {
                                    handlePageChange(currentPage + 1);
                                }
                            }} 
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
                <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    <main className="lg:col-span-4">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-headline">
                                        My Bookings
                                    </h1>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Total: {totalBookings} bookings • {upcomingBookings.length} upcoming • {completedBookings.length} completed/past
                                    </div>
                                </div>
                            </div>

                            {/* Main Card with Tabs */}
                            <Card>
                                <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
                                    <CardHeader className="pb-3">
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
                                        <TabsContent value="upcoming" className="mt-0">
                                            <BookingsTable 
                                                bookings={upcomingBookings} 
                                                onViewBooking={handleViewBooking} 
                                            />
                                        </TabsContent>
                                        <TabsContent value="completed" className="mt-0">
                                            <BookingsTable 
                                                bookings={completedBookings} 
                                                onViewBooking={handleViewBooking} 
                                            />
                                        </TabsContent>
                                        
                                        {/* Global pagination */}
                                        {renderPagination(totalPages, currentPage)}
                                        
                                        {loadingMore && (
                                            <div className="flex justify-center mt-4">
                                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Tabs>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>

            {/* Booking Details Dialog */}
            <BookingDetailsDialog 
                booking={viewingBooking}
                open={!!viewingBooking}
                onOpenChange={(open) => !open && setViewingBooking(null)}
            />
        </div>
    );
}