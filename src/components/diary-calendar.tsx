
'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { isSameDay, format } from 'date-fns';
import { mockClientBookings } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Booking } from '@/lib/types';

function DayWithIndicator({ date, bookings }: { date: Date, bookings: Booking[] }) {
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
}

export function DiaryCalendar({ selected, onSelect }: DiaryCalendarProps) {
    const [bookings] = useState<Booking[]>(mockClientBookings);
    
    return (
        <div className="flex flex-col items-center">
            <DayPicker
                mode="single"
                selected={selected}
                onSelect={onSelect}
                className="w-full"
                components={{
                    DayContent: (props) => <DayWithIndicator date={props.date} bookings={bookings} />
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
                    selected: 'bg-primary/20 text-primary rounded-md'
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
