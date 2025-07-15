
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "lucide-react";

export default function DiaryPage() {

    return (
        <div className="max-w-4xl mx-auto">
             <h1 className="text-2xl font-bold font-headline mb-6">Diary</h1>
             <Card>
                <CardHeader>
                    <CardTitle>Coming Soon!</CardTitle>
                    <CardDescription>
                       This is where you will be able to manage your bookings in a calendar view.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-16">
                    <Alert className="max-w-md">
                        <Calendar className="h-4 w-4" />
                        <AlertTitle>Feature in Development</AlertTitle>
                        <AlertDescription>
                            The diary and calendar view is currently being built. Check back soon!
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        </div>
    );
}
