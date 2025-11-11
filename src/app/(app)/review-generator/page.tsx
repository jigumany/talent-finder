
'use client';
import { ReviewGeneratorForm } from "@/components/review-generator-form";
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, PenSquare, Star, Clock } from "lucide-react";
import { mockClientReviews } from "@/lib/mock-data";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

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
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold font-headline mb-2 flex items-center gap-2">
                    <PenSquare className="h-6 w-6 text-primary" />
                    <span>AI Review Generator</span>
                </h1>
                <p className="text-muted-foreground">
                    Create constructive reviews and browse your submission history.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Create a New Review</CardTitle>
                    <CardDescription>
                        Fill in the details below and our AI will help you draft a thoughtful and personalized review for your candidate.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ReviewGeneratorForm />
                </CardContent>
            </Card>

            <Separator />

            <div>
                <h2 className="text-xl font-bold font-headline">Review History</h2>
                 <Card className="mt-4">
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {mockClientReviews.map((review) => (
                                <div key={review.id} className="p-6">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">{review.candidateName}</h3>
                                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                               <Clock className="h-4 w-4" /> 
                                               Reviewed on {format(new Date(review.date), 'do MMMM, yyyy')}
                                            </p>
                                        </div>
                                         <div className="flex items-center gap-1 text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("h-5 w-5", i < review.rating ? 'fill-current' : 'fill-muted stroke-muted-foreground')} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground mt-4 italic border-l-4 border-muted-foreground/20 pl-4">
                                        "{review.reviewText}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

    