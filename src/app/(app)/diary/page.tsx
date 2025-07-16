
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DiaryCalendar } from "@/components/diary-calendar";

export default function DiaryPage() {

    return (
        <div className="max-w-4xl mx-auto">
             <h1 className="text-2xl font-bold font-headline mb-6">My Diary</h1>
             <Card>
                <CardHeader>
                    <CardTitle>Booking Schedule</CardTitle>
                    <CardDescription>
                       Here is an overview of your confirmed bookings and tentative interview dates.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-2 md:p-6">
                    <DiaryCalendar />
                </CardContent>
            </Card>
        </div>
    );
}
