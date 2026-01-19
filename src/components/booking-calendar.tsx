
'use client';

import { Calendar } from './ui/calendar';
import type { CalendarProps } from './ui/calendar';
import { cn } from '@/lib/utils';
import type { Candidate } from '@/lib/types';


type BookingCalendarProps = CalendarProps & {
    candidate?: Candidate;
};

export function BookingCalendar({ candidate, className, ...props }: BookingCalendarProps) {

    return (
        <div className="flex flex-col items-center">
             <Calendar
                disabled={[
                    { before: new Date() }
                ]}
                className={cn("rounded-md border", className)}
                {...props}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-muted-foreground opacity-50"></span>
                    <span>Unavailable</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span>Selected</span>
                </div>
            </div>
        </div>
    );
}
