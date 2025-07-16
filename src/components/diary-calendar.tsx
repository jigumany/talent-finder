
'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { isSameDay, format } from 'date-fns';
import { mockClientBookings } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/types';

function DayWithIndicator({ date, modifiers, bookings }: { date: Date, modifiers: ReturnType<typeof useModifiers>, bookings: Booking[] }) {
  const dayBooking = bookings.find(booking => isSameDay(new Date(booking.date), date));
  
  let indicatorClass = '';
  if (dayBooking?.status === 'Confirmed') indicatorClass = 'bg-primary';
  else if (dayBooking?.status === 'Interview') indicatorClass = 'bg-purple-500';
  else if (dayBooking?.status === 'Completed') indicatorClass = 'bg-green-500';

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      <span>{format(date, "d")}</span>
      {indicatorClass && (
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full mt-0.5',
            indicatorClass
          )}
        />
      )}
    </div>
  );
}

function useModifiers() {
    return {
        booked: (date: Date) => mockClientBookings.some(b => b.status === 'Confirmed' && isSameDay(new Date(b.date), date)),
        interview: (date: Date) => mockClientBookings.some(b => b.status === 'Interview' && isSameDay(new Date(b.date), date)),
        completed: (date: Date) => mockClientBookings.some(b => b.status === 'Completed' && isSameDay(new Date(b.date), date)),
    };
}


export function DiaryCalendar() {
    const modifiers = useModifiers();
    const [bookings] = useState<Booking[]>(mockClientBookings);
    
    return (
        <div className="flex flex-col items-center">
            <DayPicker
                mode="single"
                className="w-full"
                components={{
                    DayContent: (props) => <DayWithIndicator date={props.date} modifiers={modifiers} bookings={bookings} />
                }}
                styles={{
                    caption: { color: 'hsl(var(--primary))' },
                    head: { color: 'hsl(var(--muted-foreground))' },
                    cell: { position: 'relative' },
                    day_outside: {
                        color: 'hsl(var(--muted-foreground))',
                        opacity: 0.5,
                    },
                }}
                modifiersClassNames={{
                    today: 'font-bold text-accent-foreground bg-accent/20 rounded-md',
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
