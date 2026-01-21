'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiaryFullCalendar } from "@/components/diary-fullcalendar";
import { isSameDay, format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import type { Booking } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, User, Loader2, PoundSterling, MapPin, Clock, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchBookingsPaginated } from "@/lib/data-service";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Helper functions
const formatCharge = (charge: any): string => {
  if (charge === null || charge === undefined) return 'N/A';
  const num = typeof charge === 'string' ? parseFloat(charge) : Number(charge);
  if (isNaN(num)) return 'N/A';
  return `£${num.toFixed(2)}`;
};

const getBookingType = (bookingType: any): string => {
  if (!bookingType) return 'Day';
  if (typeof bookingType === 'string') {
    return bookingType.charAt(0).toUpperCase() + bookingType.slice(1).toLowerCase();
  }
  return 'Day';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Confirmed':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'Completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Pencilled':
    case 'Pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Interview':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Booking Detail Popover Content
function BookingDetailContent({ booking }: { booking: Booking }) {
  const formatDateRange = () => {
    if (!booking.startDate) return 'Date not set';
    
    try {
      const start = parseISO(booking.startDate);
      if (!booking.endDate || booking.startDate === booking.endDate) {
        return format(start, "MMM d, yyyy");
      }
      const end = parseISO(booking.endDate);
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } catch {
      return 'Date error';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{booking.candidateName || 'Unknown Candidate'}</h3>
            <p className="text-sm text-muted-foreground">{booking.candidateRole || 'Unknown Role'}</p>
          </div>
        </div>
        <Badge
          variant={'outline'}
          className={cn('whitespace-nowrap text-xs px-2 py-0.5', getStatusColor(booking.status || ''))}
        >
          {booking.status || 'Unknown'}
        </Badge>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">Dates</span>
            </div>
            <p className="font-medium">{formatDateRange()}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <PoundSterling className="h-3.5 w-3.5" />
              <span className="text-xs">Charge</span>
            </div>
            <p className="font-medium">{formatCharge(booking.charge)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Type</div>
            <Badge variant="outline" className="text-xs">
              {getBookingType(booking.bookingType)}
            </Badge>
          </div>
        </div>

        {booking.bookingPattern && Array.isArray(booking.bookingPattern) && booking.bookingPattern.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-1">Booking Schedule</div>
            <p className="text-sm">
              {booking.bookingPattern.length} day{booking.bookingPattern.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile Booking Card Component for Diary (with popover)
function DiaryBookingCard({ booking }: { booking: Booking }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetails(true);
  };

  return (
    <Popover open={showDetails} onOpenChange={setShowDetails}>
      <PopoverTrigger asChild>
        <div 
          className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
          onClick={handleCardClick}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <h3 className="font-semibold text-base truncate">{booking.candidateName || 'Unknown Candidate'}</h3>
              </div>
              <p className="text-sm text-muted-foreground truncate">{booking.candidateRole || 'Unknown Role'}</p>
            </div>
            <Badge
              variant={'outline'}
              className={cn('whitespace-nowrap text-xs px-2 py-0.5 flex-shrink-0', getStatusColor(booking.status || ''))}
            >
              {booking.status || 'Unknown'}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm font-medium">
                <PoundSterling className="h-3.5 w-3.5 mr-0.5" />
                <span>{formatCharge(booking.charge)}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {getBookingType(booking.bookingType)}
              </Badge>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs h-8"
              onClick={handleCardClick}
            >
              View Details
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[90vw] max-w-md p-4" align="start">
        <BookingDetailContent booking={booking} />
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4"
          onClick={() => setShowDetails(false)}
        >
          Close
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export default function DiaryPage() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [hasLoadedAll, setHasLoadedAll] = useState(false);

  // Load initial bookings
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const result = await fetchBookingsPaginated(page, 100);
      setAllBookings(result.data);
      setTotalPages(result.totalPages);
      setTotalBookings(result.total);
      setCurrentPage(page);
      
      if (page >= result.totalPages) {
        setHasLoadedAll(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookingsForMonth = async (month: Date) => {
    if (hasLoadedAll) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await fetchBookingsPaginated(nextPage, 100);
      
      setAllBookings(prev => [...prev, ...result.data]);
      setCurrentPage(nextPage);
      
      if (nextPage >= result.totalPages) {
        setHasLoadedAll(true);
      }
    } catch (error) {
      console.error("Error loading more bookings:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Filter bookings for the calendar
  const calendarBookings = useMemo(() => 
    allBookings.filter(booking => 
      booking.status !== 'Cancelled' && booking.status !== 'Rejected'
    ), [allBookings]
  );

  // Get bookings for current month
  const monthBookings = useMemo(() => {
    const monthStart = startOfMonth(displayedMonth);
    const monthEnd = endOfMonth(displayedMonth);
    
    return calendarBookings.filter(booking => {
      try {
        const bookingDate = parseISO(booking.date || booking.startDate || '');
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      } catch {
        return false;
      }
    });
  }, [calendarBookings, displayedMonth]);

  const handleMonthChange = (month: Date) => {
    setDisplayedMonth(month);
    if (!hasLoadedAll) {
      loadBookingsForMonth(month);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (isMobile) {
      setMobileSheetOpen(true);
    }
  };

  const selectedDayBookings = useMemo(() => 
    calendarBookings.filter(booking => {
      if (!selectedDate) return false;
      
      try {
        const bookingDate = parseISO(booking.date || booking.startDate || '');
        return isSameDay(bookingDate, selectedDate);
      } catch {
        return false;
      }
    }), [calendarBookings, selectedDate]
  );

  // Calculate total booking days
  const totalBookingDays = useMemo(() => {
    let totalDays = 0;
    calendarBookings.forEach(booking => {
      try {
        const startDate = new Date(booking.startDate || booking.date || '');
        const endDate = new Date(booking.endDate || booking.startDate || booking.date || '');
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalDays += diffDays + 1; // +1 to include both start and end days
      } catch {
        totalDays += 1;
      }
    });
    return totalDays;
  }, [calendarBookings]);

  // Loading skeleton
  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header Skeleton */}
        <div className="md:hidden sticky top-0 z-50 bg-background border-b p-4">
          <Skeleton className="h-6 w-40 mb-1" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        {/* Desktop Header Skeleton */}
        <div className="hidden md:block max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[400px] w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold font-headline">My Diary</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Tap booking days for details
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-headline">My Diary</h1>
            <p className="text-muted-foreground mt-2">
              Click on booking days to view details
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading more bookings...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Card className="border shadow-sm md:border-2">
          <CardHeader className="pb-3 px-4 md:px-6">
            <CardTitle className="text-lg md:text-xl flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center justify-between">
                <span>Booking Calendar</span>
                <span className="md:hidden text-sm font-normal text-muted-foreground">
                  {format(displayedMonth, "MMM yyyy")}
                </span>
              </div>
              <span className="hidden md:inline text-sm font-normal text-muted-foreground">
                {format(displayedMonth, "MMMM yyyy")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <div className="overflow-x-auto -mx-2 md:mx-0">
              <div className="min-w-[320px] px-2 md:px-0">
                <DiaryFullCalendar 
                  bookings={calendarBookings}
                  onMonthChange={handleMonthChange}
                  onDateClick={handleDateClick}
                />
              </div>
            </div>
            
            {/* Load more button - Mobile optimized */}
            {!hasLoadedAll && (
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => loadBookingsForMonth(displayedMonth)}
                  disabled={isLoadingMore}
                  className="w-full md:w-auto md:px-8"
                  size={isMobile ? "default" : "default"}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isMobile ? "Loading..." : "Loading more bookings..."}
                    </>
                  ) : (
                    isMobile ? 'Load More' : 'Load more bookings'
                  )}
                </Button>
              </div>
            )}
            
            {/* Mobile quick stats */}
            <div className="md:hidden mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{totalBookings}</div>
                  <div className="text-muted-foreground text-xs">Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{totalBookingDays}</div>
                  <div className="text-muted-foreground text-xs">Days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Sheet for Selected Day Bookings */}
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
          <SheetHeader className="mb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {selectedDate ? format(selectedDate, "EEE, do MMM") : "Select a date"}
              </SheetTitle>
              {selectedDayBookings.length > 0 && (
                <Badge variant="secondary">
                  {selectedDayBookings.length}
                </Badge>
              )}
            </div>
          </SheetHeader>
          
          <div className="space-y-3 overflow-y-auto max-h-[calc(85vh-80px)]">
            {selectedDayBookings.length > 0 ? (
              selectedDayBookings.map(booking => (
                <DiaryBookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No bookings for this day</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tap another date in the calendar
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setMobileSheetOpen(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Floating Action Button for Mobile - Show Today's Bookings */}
      {/* {isMobile && (
        <div className="fixed bottom-6 right-4 z-40">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={() => {
              setSelectedDate(new Date());
              setMobileSheetOpen(true);
            }}
          >
            <Calendar className="h-6 w-6" />
          </Button>
        </div>
      )} */}
    </div>
  );
}