
'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { isSameDay, format, parseISO } from 'date-fns';
import { mockClientBookings } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/types';
import { buttonVariants } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function DayWithIndicator({ date, bookings }: { date: Date, bookings: Booking[] }) {
  const dayBookings = bookings.filter(booking => isSameDay(parseISO(booking.date), date));
  
  // This logic now supports multiple bookings on the same day by prioritizing the status for display
  const getIndicatorClass = () => {
    if (dayBookings.some(b => b.status === 'Confirmed')) return 'bg-primary';
    if (dayBookings.some(b => b.status === 'Interview')) return 'badge-yellow';
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
    selected: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    month: Date;
    onMonthChange: (date: Date) => void;
}

export function DiaryCalendar({ selected, onSelect, month, onMonthChange }: DiaryCalendarProps) {
    const [bookings] = useState<Booking[]>(mockClientBookings);
    
    return (
        <div className="flex flex-col">
            <DayPicker
                mode="single"
                selected={selected}
                onSelect={onSelect}
                month={month}
                onMonthChange={onMonthChange}
                className="w-full"
                classNames={{
                    month: 'w-full space-y-4',
                    caption: "flex justify-between pt-1 relative items-center",
                    caption_label: "text-lg font-medium text-primary",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      buttonVariants({ variant: "outline" }),
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    ),
                    table: 'w-full border-collapse',
                    head_row: 'flex justify-around',
                    head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem]',
                    row: 'flex w-full mt-2 justify-around',
                    cell: 'h-12 w-12 text-center text-sm p-0 relative first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                    day: cn(
                      buttonVariants({ variant: "ghost" }),
                      "h-12 w-12 p-0 font-normal aria-selected:opacity-100"
                    ),
                    day_selected:
                      "bg-primary/20 text-primary hover:bg-primary/20 hover:text-primary focus:bg-primary/20 focus:text-primary",
                    day_today: "font-bold text-accent-foreground",
                    day_outside:
                      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                    day_disabled: "text-muted-foreground opacity-50",
                }}
                components={{
                    DayContent: (props) => <DayWithIndicator date={props.date} bookings={bookings} />,
                    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                    IconRight: () => <ChevronRight className="h-4 w-4" />,
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
                    <span className="w-3 h-3 rounded-full badge-yellow"></span>
                    <span>Interview</span>
                </div>
            </div>
        </div>
    );
}
