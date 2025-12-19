
'use client';

import { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { isSameDay, format, parseISO } from 'date-fns';
import { mockClientBookings } from '@/lib/mock-data';
import type { Candidate, Booking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const interviewDays: Date[] = mockClientBookings.filter(b => b.status === 'Interview').map(b => parseISO(b.date));

function DayWithIndicator({ date, modifiers }: { date: Date, modifiers: ReturnType<typeof useModifiers> }) {
  const isAvailable = modifiers.available.some(day => isSameDay(day, date));
  const isBooked = modifiers.booked.some(day => isSameDay(day, date));
  const isInterview = modifiers.interview.some(day => isSameDay(day, date));

  let indicatorClass = '';
  if (isAvailable) indicatorClass = 'bg-green-500';
  else if (isBooked) indicatorClass = 'bg-primary';
  else if (isInterview) indicatorClass = 'bg-purple-500';

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

function useModifiers(candidate?: Candidate) {
    const availableDays = useMemo(() => candidate?.availability.map(d => new Date(d)) ?? [], [candidate]);
    const [bookedDays] = useState<Date[]>(mockClientBookings.filter(b => b.status === 'Confirmed').map(b => new Date(b.date)));

    return {
        available: availableDays,
        booked: bookedDays,
        interview: interviewDays,
    };
}


export function AvailabilityCalendar({ candidate }: { candidate?: Candidate }) {
    const modifiers = useModifiers(candidate);
    
    return (
        <div className="flex flex-col items-center">
             <DayPicker
                mode="single"
                className="w-full rounded-md border"
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                        buttonVariants({ variant: "outline" }),
                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell:
                        "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: cn(
                        buttonVariants({ variant: "ghost" }),
                        "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                    ),
                    day_selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "day-outside text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_hidden: "invisible",
                }}
                components={{
                    DayContent: (props) => <DayWithIndicator date={props.date} modifiers={modifiers} />,
                    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                    IconRight: () => <ChevronRight className="h-4 w-4" />,
                }}
                modifiersClassNames={{
                    today: 'font-bold text-accent-foreground bg-accent/20 rounded-md',
                }}
            />
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
        </div>
    );
}
