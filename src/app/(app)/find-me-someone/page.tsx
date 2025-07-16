
'use client';

import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, Wand2, Sparkles } from "lucide-react";
import { FindSomeoneForm } from "@/components/find-someone-form";

export default function FindMeSomeonePage() {
    const { role } = useRole();

    if (role !== 'client') {
        return (
            <div className="flex items-center justify-center h-full">
                 <Alert className="max-w-md">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        This feature is available for clients only.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold font-headline mb-6 flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-primary" />
                <span>Find Me Someone</span>
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                         <Sparkles className="h-5 w-5 text-primary" />
                         <span>Describe Your Ideal Candidate</span>
                    </CardTitle>
                    <CardDescription>
                        Fill in your requirements below, and our AI will find the best match for you from our pool of talented candidates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FindSomeoneForm />
                </CardContent>
            </Card>
        </div>
    );
}
