
'use client';

import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import type { Candidate } from '@/lib/types';
import { Calendar, type CalendarProps } from './ui/calendar';
import { cn } from '@/lib/utils';

interface AvailabilityCalendarProps extends CalendarProps {
    candidate?: Candidate;
}

export function AvailabilityCalendar({ candidate, className, ...props }: AvailabilityCalendarProps) {
    const [availableDateStrings, setAvailableDateStrings] = useState<string[]>(candidate?.availability ?? []);
    const [bookedDateStrings, setBookedDateStrings] = useState<string[]>([]);
    const [interviewDateStrings, setInterviewDateStrings] = useState<string[]>([]);
    const [unavailableDateStrings, setUnavailableDateStrings] = useState<string[]>([]);

    useEffect(() => {
        let isMounted = true;

        async function loadAvailabilities() {
            if (!candidate?.id) {
                setAvailableDateStrings(candidate?.availability ?? []);
                setBookedDateStrings([]);
                setInterviewDateStrings([]);
                setUnavailableDateStrings([]);
                return;
            }

            try {
                const response = await fetch(`/api/candidates/${candidate.id}/availabilities`, {
                    method: 'GET',
                    cache: 'no-store',
                });
                const json = await response.json();
                const rows = Array.isArray(json?.data) ? json.data : [];
                const available = new Set<string>();
                const booked = new Set<string>();
                const interview = new Set<string>();
                const unavailable = new Set<string>();

                rows.forEach((row: any) => {
                    const rawDate = String(row?.date || row?.availability_date || row?.available_date || '');
                    if (!rawDate) return;
                    const date = rawDate.length >= 10 ? rawDate.slice(0, 10) : rawDate;
                    const status = String(row?.status?.name || row?.status || '').toLowerCase();

                    if (
                        status.includes('unavailable') ||
                        status.includes('not available') ||
                        status.includes('blocked') ||
                        status.includes('leave') ||
                        status.includes('holiday') ||
                        status.includes('inactive')
                    ) {
                        unavailable.add(date);
                        return;
                    }
                    if (status.includes('interview')) {
                        interview.add(date);
                        return;
                    }
                    if (status.includes('booked') || status.includes('confirm') || status.includes('pending') || status.includes('pencilled')) {
                        booked.add(date);
                        return;
                    }
                    available.add(date);
                });

                if (!isMounted) return;

                // Any explicitly unavailable/booked/interview day should not be treated as available.
                const blocked = new Set([...booked, ...interview, ...unavailable]);
                const mergedAvailable = Array.from(
                    new Set([...(candidate.availability ?? []), ...Array.from(available)].filter(d => !blocked.has(d)))
                );

                setAvailableDateStrings(mergedAvailable);
                setBookedDateStrings(Array.from(booked));
                setInterviewDateStrings(Array.from(interview));
                setUnavailableDateStrings(Array.from(unavailable));
            } catch (error) {
                if (!isMounted) return;
                console.error('Failed to load candidate availabilities:', error);
                setAvailableDateStrings(candidate.availability ?? []);
                setBookedDateStrings([]);
                setInterviewDateStrings([]);
                setUnavailableDateStrings([]);
            }
        }

        loadAvailabilities();

        return () => {
            isMounted = false;
        };
    }, [candidate?.id, candidate?.availability]);

    const bookedSet = useMemo(() => new Set(bookedDateStrings), [bookedDateStrings]);
    const interviewSet = useMemo(() => new Set(interviewDateStrings), [interviewDateStrings]);
    const unavailableSet = useMemo(() => new Set(unavailableDateStrings), [unavailableDateStrings]);
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
                    // Business rule: if a day isn't booked/interview/unavailable, treat it as available.
                    available: (date: Date) => {
                        const key = format(date, 'yyyy-MM-dd');
                        return !bookedSet.has(key) && !interviewSet.has(key) && !unavailableSet.has(key);
                    },
                    booked: (date: Date) => bookedSet.has(format(date, 'yyyy-MM-dd')),
                    interview: (date: Date) => interviewSet.has(format(date, 'yyyy-MM-dd')),
                }}
                modifiersClassNames={{
                    available: '!rounded-sm',
                    booked: '!rounded-sm',
                    interview: '!rounded-sm',
                }}
                modifiersStyles={{
                    available: { borderRadius: '6px', backgroundColor: 'rgb(220 252 231)', color: 'rgb(22 101 52)', transform: 'scale(0.9)' },
                    booked: { borderRadius: '6px', backgroundColor: 'rgb(244 114 182)', color: 'rgb(80 7 36)', transform: 'scale(0.9)' },
                    interview: { borderRadius: '6px', backgroundColor: 'rgb(192 132 252)', color: 'rgb(59 7 100)', transform: 'scale(0.9)' },
                }}
                className={cn("rounded-md border", className)}
                {...props}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-green-100"></span>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-pink-400"></span>
                    <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm bg-purple-400"></span>
                    <span>Interview</span>
                </div>
            </div>
        </div>
    );
}
