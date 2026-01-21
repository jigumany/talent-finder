'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isFuture, isPast } from "date-fns";
import { Calendar as CalendarIcon, ClipboardEdit, Eye, Loader2, PoundSterling, User, Calendar, Clock, Repeat, ChevronRight } from "lucide-react";
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

// Mobile Booking Card Component
function MobileBookingCard({ booking, onViewBooking }: { booking: Booking, onViewBooking: (booking: Booking) => void }) {
    const formatDateRange = () => {
        if (!booking.startDate || !booking.endDate) return 'Date not set';
        
        try {
            if (booking.startDate === booking.endDate) {
                return format(parseISO(booking.startDate), "MMM d, yyyy");
            }
            return `${format(parseISO(booking.startDate), "MMM d")} - ${format(parseISO(booking.endDate), "MMM d, yyyy")}`;
        } catch {
            return 'Date error';
        }
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <h3 className="font-semibold text-base truncate">{booking.candidateName || 'Unknown Candidate'}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{booking.candidateRole || 'Unknown Role'}</p>
                    </div>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 flex-shrink-0" 
                        onClick={() => onViewBooking(booking)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDateRange()}</span>
                        </div>
                        <div className="flex items-center text-sm font-medium">
                            <PoundSterling className="h-3.5 w-3.5 mr-0.5" />
                            <span>{formatCharge(booking.charge)}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant={
                                booking.status === 'Confirmed' || booking.status === 'Completed' || booking.status === 'Hired' ? 'default' :
                                booking.status === 'Rejected' || booking.status === 'Cancelled' ? 'destructive' :
                                'secondary'
                            }
                            className={cn('whitespace-nowrap text-xs px-2 py-0.5', {
                                'bg-green-600 text-white': booking.status === 'Confirmed',
                                'bg-blue-600 text-white': booking.status === 'Completed' || booking.status === 'Hired',
                                'bg-destructive text-destructive-foreground': booking.status === 'Rejected' || booking.status === 'Cancelled',
                                'bg-purple-600 text-purple-50': booking.status === 'Interview',
                                'bg-amber-500 text-yellow-900': booking.status === 'Pencilled' || booking.status === 'Pending'
                            })}
                        >
                            {booking.status || 'Unknown'}
                        </Badge>
                        
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                            {getBookingType(booking.bookingType)}
                        </Badge>
                        
                        {booking.bookingPattern && Array.isArray(booking.bookingPattern) && booking.bookingPattern.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {booking.bookingPattern.length} day{booking.bookingPattern.length > 1 ? 's' : ''}
                            </span>
                        )}
                        
                        {isRecurring(booking.recurring) && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Repeat className="h-3 w-3" />
                                Recurring
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Desktop Bookings Table
function DesktopBookingsTable({ bookings, onViewBooking }: { bookings: Booking[], onViewBooking: (booking: Booking) => void }) {
    if (bookings.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p className="font-semibold">No entries found in this category.</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Candidate</th>
                        <th className="text-left py-3 px-4 font-medium">Role</th>
                        <th className="text-left py-3 px-4 font-medium min-w-[160px]">Dates</th>
                        <th className="text-left py-3 px-4 font-medium">Charge</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-right py-3 px-4 font-medium">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{booking.candidateName || 'Unknown Candidate'}</span>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="text-sm">{booking.candidateRole || 'Unknown Role'}</div>
                            </td>
                            <td className="py-3 px-4">
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
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center text-sm font-medium">
                                    <PoundSterling className="h-3 w-3 mr-0.5" />
                                    {formatCharge(booking.charge)}
                                </div>
                            </td>
                            <td className="py-3 px-4">
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
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                    <Badge variant="outline" className="text-xs">
                                        {getBookingType(booking.bookingType)}
                                    </Badge>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <Button size="sm" variant="ghost" onClick={() => onViewBooking(booking)}>
                                    <Eye className="mr-2 h-4 w-4" /> View
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Mobile Bookings List
function MobileBookingsList({ bookings, onViewBooking }: { bookings: Booking[], onViewBooking: (booking: Booking) => void }) {
    if (bookings.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p className="font-semibold">No entries found in this category.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {bookings.map((booking) => (
                <MobileBookingCard key={booking.id} booking={booking} onViewBooking={onViewBooking} />
            ))}
        </div>
    );
}

// Bookings Display Component (switches between mobile and desktop)
function BookingsDisplay({ bookings, onViewBooking }: { bookings: Booking[], onViewBooking: (booking: Booking) => void }) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile ? (
        <MobileBookingsList bookings={bookings} onViewBooking={onViewBooking} />
    ) : (
        <DesktopBookingsTable bookings={bookings} onViewBooking={onViewBooking} />
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
            <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
                <div className="sticky top-0 bg-background border-b px-4 sm:px-6 py-4 z-10">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-lg sm:text-xl">Booking Details</DialogTitle>
                        <DialogDescription className="text-sm">
                            Details for booking with {booking.candidateName || 'Unknown Candidate'}
                        </DialogDescription>
                    </DialogHeader>
                </div>
                
                <div className="px-4 sm:px-6 py-4 space-y-5">
                    {/* Candidate & Role */}
                    <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Candidate</h4>
                                <p className="text-base font-medium">{booking.candidateName || 'Unknown Candidate'}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Role</h4>
                            <p className="text-sm bg-background px-3 py-2 rounded border">{booking.candidateRole || 'Unknown Role'}</p>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-muted/30 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Dates</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-background rounded border p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="text-sm font-medium text-muted-foreground">Start Date</h4>
                                </div>
                                <p className="text-sm">{formatDate(booking.startDate)}</p>
                            </div>
                            <div className="bg-background rounded border p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="text-sm font-medium text-muted-foreground">End Date</h4>
                                </div>
                                <p className="text-sm">{formatDate(booking.endDate)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Info */}
                    <div className="bg-muted/30 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Booking Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-background rounded border p-3">
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
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
                            <div className="bg-background rounded border p-3">
                                <h4 className="text-sm font-medium text-muted-foreground mb-1">Charge</h4>
                                <p className="text-sm font-medium flex items-center gap-1">
                                    <PoundSterling className="h-3.5 w-3.5" />
                                    {formatCharge(booking.charge)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="bg-muted/30 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Status</h3>
                        <div className="bg-background rounded border p-3">
                            <Badge
                                variant={
                                    booking.status === 'Confirmed' || booking.status === 'Completed' || booking.status === 'Hired' ? 'default' :
                                    booking.status === 'Rejected' || booking.status === 'Cancelled' ? 'destructive' :
                                    'secondary'
                                }
                                className={cn('whitespace-nowrap text-sm px-3 py-1.5', {
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

                    {/* Booking Pattern */}
                    {booking.bookingPattern && Array.isArray(booking.bookingPattern) && booking.bookingPattern.length > 0 && (
                        <div className="bg-muted/30 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">Booking Schedule</h3>
                            <div className="bg-background rounded border">
                                <div className="max-h-48 overflow-y-auto">
                                    {booking.bookingPattern.map((pattern: any, index: number) => (
                                        <div 
                                            key={index} 
                                            className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-1.5 rounded">
                                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{pattern.date || `Day ${index + 1}`}</p>
                                                    <p className="text-xs text-muted-foreground">{pattern.type || 'Full day'}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {pattern.type || 'allday'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                {booking.bookingPattern.length} day{booking.bookingPattern.length > 1 ? 's' : ''} total
                            </p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-muted/30 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Additional Information</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <div className="bg-background rounded border p-3">
                                <div className="flex items-center gap-2 mb-1">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="text-sm font-medium text-muted-foreground">Created By</h4>
                                </div>
                                <p className="text-sm">{booking.createdBy || 'System'}</p>
                            </div>
                            {booking.createdAt && (
                                <div className="bg-background rounded border p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
                                    </div>
                                    <p className="text-sm">{formatDateTime(booking.createdAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Close Button - Mobile Optimized */}
                <div className="sticky bottom-0 bg-background border-t px-4 sm:px-6 py-3">
                    <Button 
                        className="w-full" 
                        onClick={() => onOpenChange(false)}
                        size="lg"
                    >
                        Close
                    </Button>
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
                <PaginationContent className="flex flex-wrap gap-1">
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
                                className="min-w-[36px] justify-center"
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
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-3 sm:px-4 py-4">
                <div className="flex flex-col gap-4">
                    {/* Header - Mobile Optimized */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl sm:text-3xl font-bold font-headline">
                            My Bookings
                        </h1>
                        <div className="text-sm text-muted-foreground">
                            Total: {totalBookings} • {upcomingBookings.length} upcoming • {completedBookings.length} completed
                        </div>
                    </div>

                    {/* Tabs - Mobile Optimized */}
                    <Card className="md:border-none md:shadow-none">
                        <CardContent className="p-0">
                            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
                                <div className="border-b">
                                    <TabsList className="w-full grid grid-cols-2 h-12">
                                        <TabsTrigger value="upcoming" className="text-sm md:text-base">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>Upcoming</span>
                                                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                                                    {upcomingBookings.length}
                                                </Badge>
                                            </div>
                                        </TabsTrigger>
                                        <TabsTrigger value="completed" className="text-sm md:text-base">
                                            <div className="flex items-center gap-2">
                                                <ClipboardEdit className="h-4 w-4" />
                                                <span>Completed</span>
                                                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                                                    {completedBookings.length}
                                                </Badge>
                                            </div>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                
                                <div className="p-4 md:p-0">
                                    <TabsContent value="upcoming" className="mt-4 md:mt-6">
                                        <BookingsDisplay 
                                            bookings={upcomingBookings} 
                                            onViewBooking={handleViewBooking} 
                                        />
                                    </TabsContent>
                                    <TabsContent value="completed" className="mt-4 md:mt-6">
                                        <BookingsDisplay 
                                            bookings={completedBookings} 
                                            onViewBooking={handleViewBooking} 
                                        />
                                    </TabsContent>
                                    
                                    {/* Global pagination */}
                                    {totalPages > 1 && (
                                        <>
                                            {renderPagination(totalPages, currentPage)}
                                            <div className="text-center text-xs text-muted-foreground mt-3">
                                                Page {currentPage} of {totalPages}
                                            </div>
                                        </>
                                    )}
                                    
                                    {loadingMore && (
                                        <div className="flex justify-center mt-4">
                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>
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