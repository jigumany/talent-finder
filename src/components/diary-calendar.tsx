
'use client';

import { isSameDay, parseISO } from 'date-fns';
import type { Booking } from '@/lib/types';
import { Calendar, type CalendarProps } from './ui/calendar';
import { cn } from '@/lib/utils';

interface DiaryCalendarProps extends CalendarProps {
    bookings: Booking[];
}

export function DiaryCalendar({ bookings, className, ...props }: DiaryCalendarProps) {
    
    const modifiers = {
        booked: (date: Date) => bookings.some(b => isSameDay(parseISO(b.date), date) && b.status === 'Confirmed'),
        completed: (date: Date) => bookings.some(b => isSameDay(parseISO(b.date), date) && b.status === 'Completed'),
        interview: (date: Date) => bookings.some(b => isSameDay(parseISO(b.date), date) && b.status === 'Interview'),
    };

    return (
        <div className="flex flex-col items-center">
            <Calendar
                modifiers={modifiers}
                modifiersClassNames={{
                    booked: 'bg-primary/20 dark:bg-primary/30 text-primary',
                    completed: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
                    interview: 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300',
                }}
                className={cn("rounded-md border", className)}
                {...props}
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
