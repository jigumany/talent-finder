
'use client';
import { ReviewGeneratorForm } from "@/components/review-generator-form";
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";

export default function ReviewGeneratorPage() {
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
            <h1 className="text-2xl font-bold font-headline mb-6">AI Review Generator</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Create a Constructive Review</CardTitle>
                    <CardDescription>
                        Fill in the details below and our AI will help you draft a thoughtful and personalized review for your candidate.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReviewGeneratorForm />
                </CardContent>
            </Card>
        </div>
    );
}
