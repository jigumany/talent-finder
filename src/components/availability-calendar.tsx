
'use client';

import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import type { Candidate } from '@/lib/types';
import { Calendar, type CalendarProps } from './ui/calendar';
import { cn } from '@/lib/utils';
import { fetchCandidateAvailabilities } from '@/lib/data-service';

interface AvailabilityCalendarProps extends CalendarProps {
    candidate?: Candidate;
}

export function AvailabilityCalendar({ candidate, className, ...props }: AvailabilityCalendarProps) {
    const [availableDateStrings, setAvailableDateStrings] = useState<string[]>(candidate?.availability ?? []);
    const [bookedDateStrings, setBookedDateStrings] = useState<string[]>([]);
    const [interviewDateStrings, setInterviewDateStrings] = useState<string[]>([]);

    useEffect(() => {
        let isMounted = true;

        async function loadAvailabilities() {
            if (!candidate?.id) {
                setAvailableDateStrings(candidate?.availability ?? []);
                setBookedDateStrings([]);
                setInterviewDateStrings([]);
                return;
            }

            try {
                const result = await fetchCandidateAvailabilities(candidate.id);
                if (!isMounted) return;

                // Ensure booked/interview days are not duplicated in available.
                const blocked = new Set([...result.booked, ...result.interview]);
                const mergedAvailable = Array.from(
                    new Set([...(candidate.availability ?? []), ...result.available].filter(d => !blocked.has(d)))
                );

                setAvailableDateStrings(mergedAvailable);
                setBookedDateStrings(result.booked);
                setInterviewDateStrings(result.interview);
            } catch (error) {
                if (!isMounted) return;
                console.error('Failed to load candidate availabilities:', error);
                setAvailableDateStrings(candidate.availability ?? []);
                setBookedDateStrings([]);
                setInterviewDateStrings([]);
            }
        }

        loadAvailabilities();

        return () => {
            isMounted = false;
        };
    }, [candidate?.id, candidate?.availability]);

    const availableSet = useMemo(() => new Set(availableDateStrings), [availableDateStrings]);
    const bookedSet = useMemo(() => new Set(bookedDateStrings), [bookedDateStrings]);
    const interviewSet = useMemo(() => new Set(interviewDateStrings), [interviewDateStrings]);
    const firstStatusDate = useMemo(() => {
        const all = [...bookedDateStrings, ...interviewDateStrings, ...availableDateStrings];
        if (all.length === 0) return undefined;
        const first = [...all].sort((a, b) => a.localeCompare(b))[0];
        const parsed = new Date(first);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    }, [availableDateStrings, bookedDateStrings, interviewDateStrings]);

    return (
        <div className="flex flex-col items-center">
             <Calendar
                defaultMonth={props.month ?? firstStatusDate}
                modifiers={{
                    available: (date: Date) => availableSet.has(format(date, 'yyyy-MM-dd')),
                    booked: (date: Date) => bookedSet.has(format(date, 'yyyy-MM-dd')),
                    interview: (date: Date) => interviewSet.has(format(date, 'yyyy-MM-dd')),
                }}
                modifiersClassNames={{
                    available: '!rounded-sm',
                    booked: '!rounded-sm',
                    interview: '!rounded-sm',
                }}
                modifiersStyles={{
                    available: { borderRadius: '4px', backgroundColor: 'rgb(220 252 231)', border: '1px solid rgb(134 239 172)', color: 'rgb(22 101 52)' },
                    booked: { borderRadius: '4px', backgroundColor: 'rgb(191 219 254)', border: '1px solid rgb(96 165 250)', color: 'rgb(30 64 175)' },
                    interview: { borderRadius: '4px', backgroundColor: 'rgb(243 232 255)', border: '1px solid rgb(216 180 254)', color: 'rgb(126 34 206)' },
                }}
                className={cn("rounded-md border", className)}
                {...props}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm border border-green-300 bg-green-100"></span>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm border border-primary/40 bg-primary/20"></span>
                    <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm border border-purple-300 bg-purple-100"></span>
                    <span>Interview</span>
                </div>
            </div>
        </div>
    );
}
