
'use client';
import { useState, useMemo } from 'react';
import { ReviewGeneratorForm } from "@/components/review-generator-form";
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, PenSquare, Star, Clock, Inbox } from "lucide-react";
import { mockClientReviews, mockClientBookings, mockCandidates } from "@/lib/mock-data";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Booking } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function ReviewGeneratorPage() {
    const { role } = useRole();
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);

    const completedBookings = useMemo(() => {
        return mockClientBookings.filter(b => b.status === 'Completed');
    }, []);

    const reviewedBookingIds = useMemo(() => {
        return new Set(mockClientReviews.map(r => r.bookingId));
    }, []);

    const pendingReviews = useMemo(() => {
        return completedBookings
            .filter(b => !reviewedBookingIds.has(b.id))
            .map(booking => {
                const candidate = mockCandidates.find(c => c.name === booking.candidateName);
                return { booking, candidate };
            })
            .filter(item => item.candidate);
    }, [completedBookings, reviewedBookingIds]);


    const handleWriteReviewClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setReviewDialogOpen(true);
    };

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
                    <span>Review Management</span>
                </h1>
                <p className="text-muted-foreground">
                    Create constructive reviews for completed jobs and browse your submission history.
                </p>
            </div>

            <Card>
                <Tabs defaultValue="pending">
                    <CardHeader>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="pending">
                                <Clock className="mr-2 h-4 w-4" />
                                Pending Reviews ({pendingReviews.length})
                            </TabsTrigger>
                            <TabsTrigger value="history">
                                <Star className="mr-2 h-4 w-4" />
                                Review History ({mockClientReviews.length})
                            </TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="pending" className="space-y-4">
                            {pendingReviews.length > 0 ? pendingReviews.map(({ booking, candidate }) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border">
                                            <AvatarImage src={candidate?.imageUrl} alt={candidate?.name} />
                                            <AvatarFallback>{candidate?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{booking.candidateName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Completed on {format(new Date(booking.date), 'do MMMM, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleWriteReviewClick(booking)}>Write Review</Button>
                                </div>
                            )) : (
                                <div className="text-center text-muted-foreground py-12">
                                    <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                    <p className="mt-4 font-semibold">All caught up!</p>
                                    <p className="text-sm">You have no pending reviews.</p>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="history">
                            <div className="space-y-6">
                                {mockClientReviews.map((review) => (
                                    <div key={review.id} className="p-4 rounded-lg border">
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
                        </TabsContent>
                    </CardContent>
                </Tabs>
            </Card>

            <Dialog open={isReviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Write a Review for {selectedBooking?.candidateName}</DialogTitle>
                        <DialogDescription>
                            Fill in the details below and our AI will help you draft a thoughtful and personalized review.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="pt-4">
                         <ReviewGeneratorForm 
                            candidateName={selectedBooking?.candidateName}
                            onReviewSubmitted={() => setReviewDialogOpen(false)}
                         />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
