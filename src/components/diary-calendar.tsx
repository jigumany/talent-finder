
'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { isSameDay, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/types';
import { buttonVariants } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from './ui/calendar';

function DayWithIndicator({ date, bookings }: { date: Date, bookings: Booking[] }) {
  const dayBookings = bookings.filter(booking => isSameDay(parseISO(booking.date), date));
  
  // This logic now supports multiple bookings on the same day by prioritizing the status for display
  const getIndicatorClass = () => {
    if (dayBookings.some(b => b.status === 'Confirmed')) return 'bg-primary';
    if (dayBookings.some(b => b.status === 'Interview')) return 'bg-purple-500';
    if (dayBookings.some(b => b.status === 'Completed')) return 'bg-green-500';
    return '';
  }

  const indicatorClass = getIndicatorClass();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      <span>{format(date, "d")}</span>
      {indicatorClass && (
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full absolute bottom-1.5',
            indicatorClass
          )}
        />
      )}
    </div>
  );
}

interface DiaryCalendarProps {
    bookings: Booking[];
    selected: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    month: Date;
    onMonthChange: (date: Date) => void;
}

export function DiaryCalendar({ bookings, selected, onSelect, month, onMonthChange }: DiaryCalendarProps) {
    
    return (
        <div className="flex flex-col items-center">
            <Calendar
                mode="single"
                selected={selected}
                onSelect={onSelect}
                month={month}
                onMonthChange={onMonthChange}
                className="p-3"
                components={{
                    DayContent: (props) => <DayWithIndicator date={props.date} bookings={bookings} />,
                }}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span>Booked</span>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span>Interview</span>
                </div>
            </div>
        </div>
    );
}
