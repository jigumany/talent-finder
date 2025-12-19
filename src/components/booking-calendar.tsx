
'use client';

import { useMemo, useState, useEffect } from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { isSameDay, format, parseISO, isWithinInterval, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Candidate } from '@/lib/types';
import { fetchCandidateAvailabilities } from '@/lib/data-service';
import { Calendar } from './ui/calendar';

function useModifiers(candidate?: Candidate) {
    const [unavailableIntervals, setUnavailableIntervals] = useState<{from: Date; to: Date}[]>([]);

    useEffect(() => {
        if (candidate?.id) {
            fetchCandidateAvailabilities(candidate.id).then(availabilities => {
                const intervals = availabilities
                    .filter((a: any) => a.status === 'Unavailable' && a.start_date && a.end_date)
                    .map((a: any) => ({
                        from: startOfDay(parseISO(a.start_date)),
                        to: startOfDay(parseISO(a.end_date))
                    }));
                setUnavailableIntervals(intervals);
            });
        }
    }, [candidate]);

    const isDayUnavailable = (day: Date) => {
        return unavailableIntervals.some(interval => isWithinInterval(day, interval));
    };

    return {
        unavailable: isDayUnavailable,
    };
}


interface BookingCalendarProps extends DayPickerProps {
    candidate?: Candidate;
}

export function BookingCalendar({ candidate, ...props }: BookingCalendarProps) {
    const modifiers = useModifiers(candidate);
    
    return (
        <div className="flex flex-col items-center">
             <Calendar
                {...props}
                disabled={[
                    (day) => modifiers.unavailable(day),
                    { before: new Date() }
                ]}
                className={cn("rounded-md border", props.className)}
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
