
'use client';

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DiaryCalendar } from "@/components/diary-calendar";
import { mockClientBookings } from "@/lib/mock-data";
import { isSameDay, format, parseISO } from "date-fns";
import type { Booking } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Briefcase, User } from "lucide-react";

export default function DiaryPage() {
    const [bookings] = useState<Booking[]>(mockClientBookings);
    
    // Default to the current date
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());


    const handleMonthChange = (month: Date) => {
        setDisplayedMonth(month);
        // Also update the selected date to the first of the new month
        // to ensure the side panel updates accordingly.
        setSelectedDate(month);
    }

    const selectedDayBookings = useMemo(() => bookings.filter(booking => 
        selectedDate && isSameDay(parseISO(booking.date), selectedDate)
    ), [bookings, selectedDate]);

    return (
        <div className="max-w-6xl mx-auto">
             <h1 className="text-2xl font-bold font-headline mb-6">My Diary</h1>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Schedule</CardTitle>
                            <CardDescription>
                               Click on a date to see the bookings for that day.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 md:p-6">
                            <DiaryCalendar 
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                month={displayedMonth}
                                onMonthChange={handleMonthChange}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 sticky top-20">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <Calendar className="h-5 w-5 text-muted-foreground" />
                               <span>
                                {selectedDate ? format(selectedDate, "do MMMM yyyy") : "Select a date"}
                               </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedDayBookings.length > 0 ? (
                                selectedDayBookings.map(booking => (
                                    <div key={booking.id} className="p-4 rounded-lg border bg-muted/50">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-primary flex items-center gap-2"><User className="h-4 w-4"/> {booking.candidateName}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4"/> {booking.candidateRole}</p>
                                            </div>
                                             <Badge
                                                variant={'outline'}
                                                className={cn({
                                                    'bg-primary text-primary-foreground border-transparent': booking.status === 'Confirmed',
                                                    'bg-green-600 text-white border-transparent': booking.status === 'Completed'
                                                }, booking.status === 'Interview' ? 'badge-yellow' : '')}
                                            >
                                                {booking.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <p>No bookings for this day.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
             </div>
        </div>
    );
}
