'use client';

import { isSameDay, parseISO } from 'date-fns';
import type { Booking } from '@/lib/types';
import { Calendar, type CalendarProps } from './ui/calendar';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

// Remove the CalendarProps extension since DayPicker handles selected prop
interface DiaryCalendarProps {
    bookings: Booking[];
    onDateClick?: (date: Date, bookings: Booking[]) => void;
    // Include the necessary Calendar props
    selected?: Date;
    month?: Date;
    onMonthChange?: (month: Date) => void;
    onSelect?: (date: Date | undefined) => void;
    className?: string;
}

// Memoized day cell to prevent unnecessary re-renders
const DayCell = memo(({ 
  date, 
  bookings, 
  onDateClick,
  onSelect 
}: { 
  date: Date; 
  bookings: Booking[]; 
  onDateClick?: (date: Date, bookings: Booking[]) => void;
  onSelect?: (date: Date | undefined) => void;
}) => {
  const router = useRouter();
  
  const getDayBookings = (date: Date) => {
    return bookings.filter(b => {
      try {
        return isSameDay(parseISO(b.date || b.startDate || ''), date);
      } catch {
        return false;
      }
    });
  };

  const dayBookings = getDayBookings(date);
  
  if (dayBookings.length === 0) {
    return <div className="flex justify-center items-center h-full w-full">{date.getDate()}</div>;
  }

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center p-1 cursor-pointer group"
      onClick={(e) => {
        e.stopPropagation();
        if (onDateClick) {
          onDateClick(date, dayBookings);
        }
        // Also update the calendar selection
        if (onSelect) {
          onSelect(date);
        }
      }}
    >
      <span className="text-sm font-medium mb-1">{date.getDate()}</span>
      
      {/* Mobile: Show dot indicators */}
      <div className="lg:hidden flex flex-wrap justify-center gap-0.5">
        {dayBookings.slice(0, 3).map((booking, index) => (
          <span 
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              booking.status === 'Confirmed' ? 'bg-primary' : 
              booking.status === 'Completed' ? 'bg-green-500' : 
              'bg-amber-500'
            )}
          />
        ))}
        {dayBookings.length > 3 && (
          <span className="text-xs text-muted-foreground">+{dayBookings.length - 3}</span>
        )}
      </div>
      
      {/* Desktop: Show booking names */}
      <div className="hidden lg:block space-y-0.5 w-full max-w-[90%]">
        {dayBookings.slice(0, 2).map((booking, index) => (
          <div 
            key={index}
            className={cn(
              "text-[10px] px-1 py-0.5 rounded truncate text-center cursor-pointer hover:opacity-90 transition-opacity",
              booking.status === 'Confirmed' 
                ? 'bg-primary text-primary-foreground' 
                : booking.status === 'Completed'
                ? 'bg-green-500 text-white'
                : 'bg-amber-500 text-amber-900'
            )}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/bookings/${booking.id}`);
            }}
            title={`${booking.candidateName} - ${booking.status}`}
          >
            {booking.candidateName?.split(' ')[0] || 'Unknown'}
          </div>
        ))}
        {dayBookings.length > 2 && (
          <div className="text-[10px] text-center text-muted-foreground">
            +{dayBookings.length - 2} more
          </div>
        )}
      </div>
      
      {/* Hover effect for mobile */}
      <div className="lg:hidden absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
    </div>
  );
});

DayCell.displayName = 'DayCell';

export function DiaryCalendar({ 
  bookings, 
  className, 
  onDateClick, 
  selected,
  month,
  onMonthChange,
  onSelect,
  ...props 
}: DiaryCalendarProps) {
  const router = useRouter();
  
  const modifiers = {
    booked: (date: Date) => bookings.some(b => {
      try {
        return isSameDay(parseISO(b.date || b.startDate || ''), date) && 
               (b.status === 'Confirmed' || b.status === 'Pencilled');
      } catch {
        return false;
      }
    }),
    completed: (date: Date) => bookings.some(b => {
      try {
        return isSameDay(parseISO(b.date || b.startDate || ''), date) && b.status === 'Completed';
      } catch {
        return false;
      }
    }),
  };

  // Custom day renderer using memoized component
  const dayContent = (date: Date) => {
    return (
      <DayCell 
        date={date} 
        bookings={bookings} 
        onDateClick={onDateClick}
        onSelect={onSelect}
      />
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Calendar
        selected={selected}
        month={month}
        onMonthChange={onMonthChange}
        onSelect={onSelect}
        modifiers={modifiers}
        modifiersClassNames={{
          booked: 'bg-primary/10 dark:bg-primary/20',
          completed: 'bg-green-50 dark:bg-green-900/30',
        }}
        className={cn("rounded-md border w-full", className)}
        components={{
          DayContent: ({ date }) => dayContent(date),
        }}
        {...props}
      />
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary"></span>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          <span>Pencilled</span>
        </div>
      </div>
    </div>
  );
}