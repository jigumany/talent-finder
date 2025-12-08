
'use client';

import { useMemo } from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { isSameDay, format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, Candidate } from '@/lib/types';

function DayWithIndicator({ date, modifiers, showIndicators }: { date: Date, modifiers: ReturnType<typeof useModifiers>, showIndicators: boolean }) {
  const isAvailable = modifiers.available?.some(day => isSameDay(day, date));
  const isBooked = modifiers.booked?.some(day => isSameDay(day, date));
  const isInterview = modifiers.interview?.some(day => isSameDay(day, date));

  let indicatorClass = '';
  if (isAvailable) indicatorClass = 'bg-green-500';
  else if (isBooked) indicatorClass = 'bg-primary';
  else if (isInterview) indicatorClass = 'bg-purple-500';

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      <span>{format(date, "d")}</span>
      {showIndicators && indicatorClass && (
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

function useModifiers(candidate?: Candidate, allBookings?: Booking[]) {
    const availableDays = useMemo(() => candidate?.availability.map(d => new Date(d)) ?? [], [candidate]);
    const bookedDays = useMemo(() => allBookings?.filter(b => b.status === 'Confirmed' || b.status === 'Hired').map(b => new Date(b.date)) ?? [], [allBookings]);
    const interviewDays = useMemo(() => allBookings?.filter(b => b.status === 'Interview').map(b => new Date(b.date)) ?? [], [allBookings]);

    return {
        available: availableDays,
        booked: bookedDays,
        interview: interviewDays,
    };
}

interface BookingCalendarProps extends DayPickerProps {
    candidate?: Candidate;
    allBookings?: Booking[];
}

export function BookingCalendar({ candidate, allBookings, ...props }: BookingCalendarProps) {
    const modifiers = useModifiers(candidate, allBookings);
    const showIndicators = !!candidate;
    
    return (
        <div className="flex flex-col items-center">
             <DayPicker
                {...props}
                className={cn("w-full", props.className)}
                classNames={{
                    month: 'w-full space-y-4',
                    caption: "flex justify-between pt-1 relative items-center",
                    caption_label: "text-lg font-medium text-primary",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      buttonVariants({ variant: "outline" }),
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    ),
                    table: 'w-full border-collapse border-spacing-y-2',
                    head_row: '',
                    head_cell: 'text-muted-foreground font-normal text-[0.8rem] w-12',
                    row: 'w-full',
                    cell: 'text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                    day: cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-12 w-12 p-0 font-normal aria-selected:opacity-100"
                    ),
                    day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "font-bold text-accent-foreground",
                    day_outside:
                      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                    day_disabled: "text-muted-foreground opacity-50",
                }}
                components={{
                    DayContent: (dayProps) => <DayWithIndicator {...dayProps} modifiers={modifiers} showIndicators={showIndicators} />,
                    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                    IconRight: () => <ChevronRight className="h-4 w-4" />,
                }}
                modifiersClassNames={{
                    today: 'font-bold text-accent-foreground bg-accent/20 rounded-md',
                }}
            />
            {showIndicators && (
                <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span>Interview</span>
                    </div>
                </div>
            )}
        </div>
    );
}
