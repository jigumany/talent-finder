'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { Card } from '@/components/ui/card';
import { mockCandidates, mockClientBookings } from '@/lib/mock-data';

const interviewDays: Date[] = [
    new Date(2024, 7, 21), 
];

export function AvailabilityCalendar() {
    const [availableDays] = useState<Date[]>(mockCandidates[2].availability.map(d => new Date(d)));
    const [bookedDays] = useState<Date[]>(mockClientBookings.filter(b => b.status === 'Confirmed').map(b => new Date(b.date)));

    const modifiers = {
        available: availableDays,
        booked: bookedDays,
        interview: interviewDays
    };

    const modifierStyles = {
        available: { 
            color: 'white',
            backgroundColor: '#16a34a', // green-600
        },
        booked: { 
            color: 'white',
            backgroundColor: '#2563eb', // blue-600
        },
        interview: {
            color: 'white',
            backgroundColor: '#7e22ce' // purple-700
        }
    };
    
    return (
        <div className="flex flex-col items-center">
            <Card className="p-0 border-0 shadow-none flex justify-center w-full">
                <DayPicker
                    mode="single"
                    className="w-full"
                    modifiers={modifiers}
                    modifiersStyles={modifierStyles}
                    styles={{
                        caption: { color: 'hsl(var(--primary))' },
                        head: { color: 'hsl(var(--muted-foreground))' },
                    }}
                    modifiersClassNames={{
                        today: 'font-bold text-accent-foreground bg-accent/20 rounded-md',
                    }}
                />
            </Card>
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#16a34a]"></span>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2563eb]"></span>
                    <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#7e22ce]"></span>
                    <span>Interview</span>
                </div>
            </div>
        </div>
    );
}
