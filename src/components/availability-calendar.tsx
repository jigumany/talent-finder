
'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { isSameDay, format } from 'date-fns';
import { mockCandidates, mockClientBookings } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const interviewDays: Date[] = [
    new Date(2024, 7, 21), 
];

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

function useModifiers() {
    const [availableDays] = useState<Date[]>(mockCandidates[2].availability.map(d => new Date(d)));
    const [bookedDays] = useState<Date[]>(mockClientBookings.filter(b => b.status === 'Confirmed').map(b => new Date(b.date)));

    return {
        available: availableDays,
        booked: bookedDays,
        interview: interviewDays,
    };
}


export function AvailabilityCalendar() {
    const modifiers = useModifiers();
    
    return (
        <div className="flex justify-center">
             <DayPicker
                mode="single"
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
                      "bg-primary/20 text-primary hover:bg-primary/20 hover:text-primary focus:bg-primary/20 focus:text-primary",
                    day_today: "font-bold text-accent-foreground",
                    day_outside:
                      "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                    day_disabled: "text-muted-foreground opacity-50",
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
