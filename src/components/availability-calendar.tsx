
'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { isSameDay } from 'date-fns';
import { Card } from '@/components/ui/card';
import { mockCandidates, mockClientBookings } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const interviewDays: Date[] = [
    new Date(2024, 7, 21), 
];

function DayWithIndicator(props: { date: Date, modifiers: ReturnType<typeof useModifiers> }) {
  const { date, modifiers } = props;
  const isAvailable = modifiers.available.some(day => isSameDay(day, date));
  const isBooked = modifiers.booked.some(day => isSameDay(day, date));
  const isInterview = modifiers.interview.some(day => isSameDay(day, date));

  let indicatorClass = '';
  if (isAvailable) indicatorClass = 'bg-green-500';
  else if (isBooked) indicatorClass = 'bg-blue-500';
  else if (isInterview) indicatorClass = 'bg-purple-500';

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full">
      <span>{props.date.getDate()}</span>
      {indicatorClass && <div className={cn("absolute bottom-1 h-1.5 w-1.5 rounded-full", indicatorClass)}></div>}
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
            <Card className="p-0 border-0 shadow-none flex justify-center w-full">
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
            </Card>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
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
