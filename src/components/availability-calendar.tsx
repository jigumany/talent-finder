
'use client';

import { useState } from 'react';
import { DayPicker, type DayProps } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { Card } from '@/components/ui/card';
import { mockCandidates, mockClientBookings } from '@/lib/mock-data';

const interviewDays: Date[] = [
    new Date(2024, 7, 21), 
];

function DayWithCircle(props: DayProps) {
    const { date, displayMonth } = props;
    const [availableDays] = useState<Date[]>(mockCandidates[2].availability.map(d => new Date(d)));
    const [bookedDays] = useState<Date[]>(mockClientBookings.filter(b => b.status === 'Confirmed').map(b => new Date(b.date)));

    const isAvailable = availableDays.some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth());
    const isBooked = bookedDays.some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth());
    const isInterview = interviewDays.some(d => d.getDate() === date.getDate() && d.getMonth() === date.getMonth());

    if (displayMonth.getMonth() !== date.getMonth()) {
        return <div {...props.rootProps}>{props.formattedDate}</div>;
    }

    return (
        <div {...props.rootProps} className="relative">
            {props.formattedDate}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                {isAvailable && <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>}
                {isBooked && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                {isInterview && <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>}
            </div>
        </div>
    );
}

export function AvailabilityCalendar() {
    
    return (
        <div className="flex flex-col items-center">
            <Card className="p-0 border-0 shadow-none flex justify-center">
                <DayPicker
                    mode="single"
                    className="w-full"
                    components={{ Day: DayWithCircle }}
                    styles={{
                        caption: { color: 'hsl(var(--primary))' },
                        head: { color: 'hsl(var(--muted-foreground))' },
                        table: { width: '100%', maxWidth: 'none' },
                        month: { width: '100%' },
                    }}
                    modifiersClassNames={{
                        today: 'font-bold text-accent-foreground bg-accent/20',
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
