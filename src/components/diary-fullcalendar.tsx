'use client';

import { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Booking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, PoundSterling, MapPin, Clock, Briefcase } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DiaryFullCalendarProps {
  bookings: Booking[];
  onMonthChange?: (month: Date) => void;
  onDateClick?: (date: Date) => void;
}

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

const getEventColor = (status: string): string => {
  const baseColors: Record<string, string> = {
    'Confirmed': '#156082',      // Blue - Daily
    'Completed': '#33CC33',      // Green - Approved
    'Pencilled': '#FFC001',      // Yellow - Amended
    'Pending': '#FFC001',        // Yellow
    'Interview': '#C3AB7F',      // Brown/Beige
    'Cancelled': '#C01002',      // Red
    'Rejected': '#C01002',       // Red
    'Hired': '#33CC33',          // Green
  };

  return baseColors[status] || '#156082';
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

// Get slot type for a specific day from booking pattern
const getSlotTypeForDate = (booking: Booking, date: Date): string => {
  if (!booking.bookingPattern || !Array.isArray(booking.bookingPattern)) {
    return booking.bookingType || 'Day';
  }
  
  const dateStr = date.toISOString().split('T')[0];
  const patternDay = booking.bookingPattern.find(
    (pattern: any) => pattern.date === dateStr
  );
  
  if (patternDay?.type) {
    // Convert to readable format
    switch (patternDay.type.toLowerCase()) {
      case 'am':
        return 'AM';
      case 'pm':
        return 'PM';
      case 'allday':
        return 'Full Day';
      default:
        return patternDay.type.charAt(0).toUpperCase() + patternDay.type.slice(1);
    }
  }
  
  return booking.bookingType || 'Day';
};

// Function to expand a booking into individual day events
const expandBookingToDays = (booking: Booking) => {
  const days: any[] = [];
  
  try {
    const startDate = new Date(booking.startDate || booking.date || '');
    const endDate = new Date(booking.endDate || booking.startDate || booking.date || '');
    
    // If it's a single day booking
    if (!booking.endDate || booking.startDate === booking.endDate) {
      const eventDate = new Date(startDate);
      const slotType = getSlotTypeForDate(booking, eventDate);
      
      days.push({
        id: `${booking.id}-${formatDateToYYYYMMDD(eventDate)}`,
        title: booking.candidateName || 'Unknown Candidate',
        start: eventDate,
        allDay: true,
        backgroundColor: getEventColor(booking.status || 'Confirmed'),
        borderColor: getEventColor(booking.status || 'Confirmed'),
        textColor: '#ffffff',
        extendedProps: {
          ...booking,
          status: booking.status || 'Unknown',
          candidateName: booking.candidateName || 'Unknown Candidate',
          candidateRole: booking.candidateRole || 'Unknown Role',
          charge: formatCharge(booking.charge),
          bookingType: getBookingType(booking.bookingType),
          slotType: slotType,
          date: formatDateToYYYYMMDD(eventDate),
          isMultiDay: false,
        },
      });
      return days;
    }
    
    // For multi-day bookings, create an event for each day
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    
    // Loop through each day of the booking
    let dayCount = 1;
    const totalDays = Math.ceil((lastDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    while (currentDate <= lastDate) {
      const eventId = `${booking.id}-${formatDateToYYYYMMDD(new Date(currentDate))}`;
      const slotType = getSlotTypeForDate(booking, new Date(currentDate));
      
      days.push({
        id: eventId,
        title: booking.candidateName || 'Unknown Candidate',
        start: new Date(currentDate),
        allDay: true,
        backgroundColor: getEventColor(booking.status || 'Confirmed'),
        borderColor: getEventColor(booking.status || 'Confirmed'),
        textColor: '#ffffff',
        extendedProps: {
          ...booking,
          status: booking.status || 'Unknown',
          candidateName: booking.candidateName || 'Unknown Candidate',
          candidateRole: booking.candidateRole || 'Unknown Role',
          charge: formatCharge(booking.charge),
          bookingType: getBookingType(booking.bookingType),
          slotType: slotType,
          date: formatDateToYYYYMMDD(new Date(currentDate)),
          isMultiDay: true,
          dayNumber: dayCount,
          totalDays: totalDays,
        },
      });
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      dayCount++;
    }
  } catch (error) {
    console.error('Error expanding booking to days:', error);
  }
  
  return days;
};

// Helper to format date as YYYY-MM-DD
const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export function DiaryFullCalendar({ bookings, onMonthChange, onDateClick }: DiaryFullCalendarProps) {
  const calendarRef = useRef<any>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [mobilePopoverOpen, setMobilePopoverOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Transform bookings to individual day events
  const events = useRef<any[]>([]);
  
  useEffect(() => {
    events.current = [];
    bookings.forEach(booking => {
      const dayEvents = expandBookingToDays(booking);
      events.current.push(...dayEvents);
    });
  }, [bookings]);

  const handleEventClick = (info: any) => {
    if (isMobile) {
      // For mobile, show custom popover
      setSelectedBooking(info.event.extendedProps);
      setMobilePopoverOpen(true);
    }
    // Desktop: Popover is handled by the PopoverTrigger
  };

  const handleDateClick = (info: any) => {
    if (onDateClick) {
      onDateClick(info.date);
    }
  };

  const handleDatesSet = (info: any) => {
    setCurrentDate(info.view.currentStart);
    if (onMonthChange) {
      onMonthChange(info.view.currentStart);
    }
  };

  const handlePrevClick = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      setCurrentDate(calendarApi.getDate());
      if (onMonthChange) {
        onMonthChange(calendarApi.getDate());
      }
    }
  };

  const handleNextClick = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      setCurrentDate(calendarApi.getDate());
      if (onMonthChange) {
        onMonthChange(calendarApi.getDate());
      }
    }
  };

  const handleTodayClick = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      setCurrentDate(calendarApi.getDate());
      if (onDateClick) {
        onDateClick(calendarApi.getDate());
      }
      if (onMonthChange) {
        onMonthChange(calendarApi.getDate());
      }
    }
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    } catch {
      return dateStr;
    }
  };

  // Mobile Popover Content
  const MobilePopoverContent = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg w-full max-w-sm max-h-[80vh] overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{selectedBooking.candidateName}</h3>
                  <p className="text-xs text-muted-foreground">{selectedBooking.candidateRole}</p>
                </div>
              </div>
              <Badge
                variant={'outline'}
                className={cn('text-xs px-2 py-0.5', getStatusColor(selectedBooking.status))}
              >
                {selectedBooking.status}
              </Badge>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs">Date</span>
                  </div>
                  <p className="font-medium">{formatDate(selectedBooking.date)}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <PoundSterling className="h-3.5 w-3.5" />
                    <span className="text-xs">Charge</span>
                  </div>
                  <p className="font-medium">{selectedBooking.charge}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Type</div>
                  <Badge variant="outline" className="text-xs">
                    {selectedBooking.slotType}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setMobilePopoverOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Custom event content renderer
  const renderEventContent = (eventInfo: any) => {
    const booking = eventInfo.event.extendedProps;
    
    if (isMobile) {
      return (
        <div 
          className="fc-event-content cursor-pointer p-1 w-full"
          onClick={() => handleEventClick(eventInfo)}
        >
          <div className="flex flex-col items-start w-full">
            <div className="font-semibold text-[10px] truncate w-full">
              {booking.candidateName}
            </div>
            <div className="text-[9px] opacity-90">
              {booking.slotType}
            </div>
          </div>
        </div>
      );
    }

    // Desktop - with Popover
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="fc-event-content cursor-pointer p-1 hover:opacity-90 w-full">
            <div className="flex flex-col items-start w-full">
              <div className="font-semibold text-xs truncate w-full">
                {booking.candidateName}
              </div>
              <div className="text-[10px] opacity-90">
                {booking.slotType}
              </div>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{booking.candidateName}</h3>
                  <p className="text-xs text-muted-foreground">{booking.candidateRole}</p>
                </div>
              </div>
              <Badge
                variant={'outline'}
                className={cn('text-xs px-2 py-0.5', getStatusColor(booking.status))}
              >
                {booking.status}
              </Badge>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs">Date</span>
                  </div>
                  <p className="font-medium">{formatDate(booking.date)}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <PoundSterling className="h-3.5 w-3.5" />
                    <span className="text-xs">Charge</span>
                  </div>
                  <p className="font-medium">{booking.charge}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Type</div>
                  <Badge variant="outline" className="text-xs">
                    {booking.slotType}
                  </Badge>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
            >
              View Details
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <>
      <div className="flex flex-col w-full">
        {/* Calendar Header */}
        <div className={cn(
          "flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg",
          isMobile ? "flex-col gap-3" : ""
        )}>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              onClick={handlePrevClick}
              className={cn(isMobile ? "h-7 w-7 p-0" : "h-8 w-8 p-0")}
            >
              ‹
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              onClick={handleTodayClick}
              className={isMobile ? "h-7 px-3" : "h-8"}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "sm"}
              onClick={handleNextClick}
              className={cn(isMobile ? "h-7 w-7 p-0" : "h-8 w-8 p-0")}
            >
              ›
            </Button>
          </div>
        </div>

        {/* FullCalendar */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events.current}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            headerToolbar={false}
            weekends={false}
            firstDay={1} // Monday
            dayMaxEvents={isMobile ? 3 : 4}
            dayMaxEventRows={isMobile ? 3 : 4}
            eventContent={renderEventContent}
            height="auto"
            eventDisplay="block"
            allDayContent={() => null}
            moreLinkContent={(args) => {
              return (
                <div className="text-xs text-muted-foreground hover:text-primary cursor-pointer">
                  +{args.num} more
                </div>
              );
            }}
            dayHeaderContent={(args) => (
              <div className="text-center font-medium text-sm py-2 bg-muted/30">
                {args.text}
              </div>
            )}
            dayCellContent={(args) => (
              <div className="text-right pr-2 pt-1 font-medium">
                {args.dayNumberText}
              </div>
            )}
            eventClassNames="mb-1 rounded-sm border-0"
            eventInteractive={true}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 border rounded-lg bg-muted/10">
          <h3 className="text-sm font-semibold mb-2">Status Guide</h3>
          <div className={cn(
            "text-xs",
            isMobile ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 md:grid-cols-4 gap-2"
          )}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#156082] flex-shrink-0"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#33CC33] flex-shrink-0"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#FFC001] flex-shrink-0"></div>
              <span>Pencilled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#C3AB7F] flex-shrink-0"></div>
              <span>Interview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Popover */}
      {mobilePopoverOpen && <MobilePopoverContent />}
    </>
  );
}