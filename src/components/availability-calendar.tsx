
'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { mockCandidates } from '@/lib/mock-data';

export function AvailabilityCalendar() {
  const [unavailableDays, setUnavailableDays] = useState<Date[]>(
    mockCandidates[2].availability.map(d => new Date(d))
  );

  const handleDayClick = (day: Date) => {
    setUnavailableDays(currentDays => {
      if (currentDays.some(d => d.getTime() === day.getTime())) {
        return currentDays.filter(d => d.getTime() !== day.getTime());
      }
      return [...currentDays, day];
    });
  };

  const footer = unavailableDays.length > 0
    ? `${unavailableDays.length} day(s) marked as available.`
    : `Click on dates to mark them as available.`;

  return (
    <Card className="p-4">
      <DayPicker
        mode="multiple"
        min={1}
        selected={unavailableDays}
        onDayClick={handleDayClick}
        footer={<div className="text-sm text-muted-foreground pt-4">{footer}</div>}
        styles={{
            caption: { color: 'hsl(var(--primary))' },
            head: { color: 'hsl(var(--muted-foreground))' },
        }}
        modifiersClassNames={{
            selected: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90',
            today: 'font-bold text-accent'
        }}
        className="w-full"
      />
    </Card>
  );
}
