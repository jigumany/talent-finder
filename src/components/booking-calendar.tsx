
'use client';

import { useMemo, useState, useEffect } from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { isSameDay, format, parseISO, isWithinInterval, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { buttonVariants } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Candidate } from '@/lib/types';
import { fetchCandidateAvailabilities } from '@/lib/data-service';

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
             <DayPicker
                {...props}
                disabled={[
                    (day) => modifiers.unavailable(day),
                    { before: new Date() }
                ]}
                className={cn("p-3", props.className)}
                classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell:
                    "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                    ),
                    day_range_end: "day-range-end",
                    day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside:
                    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                }}
                components={{
                    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                    IconRight: () => <ChevronRight className="h-4 w-4" />,
                }}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-300"></span>
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
