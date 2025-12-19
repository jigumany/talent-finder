
'use client';

import { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { isSameDay, format, parseISO } from 'date-fns';
import { mockClientBookings } from '@/lib/mock-data';
import type { Candidate, Booking } from '@/lib/types';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar } from './ui/calendar';

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
             <Calendar
                mode="single"
                className="w-full rounded-md border"
                components={{
                    DayContent: (props) => <DayWithIndicator date={props.date} modifiers={modifiers} />,
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
