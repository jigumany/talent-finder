
'use client';

import { useState, useMemo } from 'react';
import { isSameDay, parseISO } from 'date-fns';
import { mockClientBookings } from '@/lib/mock-data';
import type { Candidate } from '@/lib/types';
import { Calendar, type CalendarProps } from './ui/calendar';
import { cn } from '@/lib/utils';

interface AvailabilityCalendarProps extends CalendarProps {
    candidate?: Candidate;
}

export function AvailabilityCalendar({ candidate, className, ...props }: AvailabilityCalendarProps) {
    const availableDays = useMemo(() => candidate?.availability.map(d => new Date(d)) ?? [], [candidate]);
    const [bookedDays] = useState<Date[]>(mockClientBookings.filter(b => b.status === 'Confirmed').map(b => new Date(b.date)));
    const [interviewDays] = useState<Date[]>(mockClientBookings.filter(b => b.status === 'Interview').map(b => parseISO(b.date)));

    return (
        <div className="flex flex-col items-center">
             <Calendar
                modifiers={{
                    available: availableDays,
                    booked: bookedDays,
                    interview: interviewDays,
                }}
                modifiersClassNames={{
                    available: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
                    booked: 'bg-primary/20 dark:bg-primary/30 text-primary',
                    interview: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
                }}
                className={cn("rounded-md border", className)}
                {...props}
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
