
'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { mockCandidates } from '@/lib/mock-data';

export function AvailabilityCalendar() {
  const [availableDays, setAvailableDays] = useState<Date[]>(
    mockCandidates[2].availability.map(d => new Date(d))
  );

  const handleDayClick = (day: Date, { selected }: { selected: boolean }) => {
    // Prevent selecting dates in the past
    if (day < new Date(new Date().setHours(0, 0, 0, 0))) {
        return;
    }

    if (selected) {
      setAvailableDays(currentDays => currentDays.filter(d => d.getTime() !== day.getTime()));
    } else {
      setAvailableDays(currentDays => [...currentDays, day].sort((a,b) => a.getTime() - b.getTime()));
    }
  };

  const footer = availableDays.length > 0
    ? `${availableDays.length} day(s) marked as available.`
    : `Click on dates to mark them as available.`;

  return (
    <Card className="p-0 border-0 shadow-none flex justify-center">
      <DayPicker
        mode="multiple"
        min={0}
        selected={availableDays}
        onDayClick={handleDayClick}
        disabled={{ before: new Date() }}
        footer={<div className="text-sm text-muted-foreground pt-4 text-center">{footer}</div>}
        styles={{
            caption: { color: 'hsl(var(--primary))' },
            head: { color: 'hsl(var(--muted-foreground))' },
        }}
        modifiersClassNames={{
            selected: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90',
            today: 'font-bold text-accent-foreground bg-accent/50'
        }}
      />
    </Card>
  );
}
