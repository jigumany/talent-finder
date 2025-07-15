
'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { isSameDay } from 'date-fns';
import { mockCandidates, mockClientBookings } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

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
    <div className="relative flex h-full w-full items-center justify-center">
      <span>{date.getDate()}</span>
      {indicatorClass && (
        <div
          className={cn(
            'absolute bottom-1.5 h-1.5 w-1.5 rounded-full',
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
        <div className="flex flex-col items-center">
            <DayPicker
                mode="single"
                className="w-full"
                components={{
                    DayContent: (props) => <DayWithIndicator date={props.date} modifiers={modifiers} />
                }}
                styles={{
                    caption: { color: 'hsl(var(--primary))' },
                    head: { color: 'hsl(var(--muted-foreground))' },
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
