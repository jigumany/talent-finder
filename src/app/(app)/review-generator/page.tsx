
'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReviewGeneratorForm } from "@/components/review-generator-form";
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, PenSquare, Star, Clock, Inbox } from "lucide-react";
import { mockClientReviews } from "@/lib/mock-data";
import { fetchBookings } from '@/lib/data-service';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Booking, ClientReview } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const REVIEWS_PER_PAGE = 5;

function ReviewGeneratorContent() {
    const { role } = useRole();
    const searchParams = useSearchParams();
    const [bookings, setBookings] = useState<Booking[]>([]);
    
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
    
    // State to track reviews submitted during the session
    const [sessionReviewedBookingIds, setSessionReviewedBookingIds] = useState<Set<string>>(new Set());
    const [sessionReviews, setSessionReviews] = useState<ClientReview[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        async function getBookings() {
            const fetchedBookings = await fetchBookings();
            setBookings(fetchedBookings);

            const bookingIdFromUrl = searchParams.get('bookingId');
            if (bookingIdFromUrl) {
                const bookingToReview = fetchedBookings.find(b => b.id === bookingIdFromUrl);
                if (bookingToReview) {
                    handleWriteReviewClick(bookingToReview);
                }
            }
        }
        getBookings();
    }, [searchParams]);

    const completedBookings = useMemo(() => {
        return bookings.filter(b => b.status === 'Completed' || b.status.startsWith('Finished'));
    }, [bookings]);
    
    // Combine mock reviews with session reviews
    const reviewedBookingIds = useMemo(() => {
        const initialIds = new Set(mockClientReviews.map(r => r.bookingId));
        sessionReviewedBookingIds.forEach(id => initialIds.add(id));
        return initialIds;
    }, [sessionReviewedBookingIds]);

    const allReviews = useMemo(() => {
        return [...sessionReviews, ...mockClientReviews].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sessionReviews]);


    const pendingReviews = useMemo(() => {
        return completedBookings
            .filter(b => !reviewedBookingIds.has(b.id))
            .map(booking => {
                // In a real app with candidates in state, we would get image here
                return { booking, candidate: { imageUrl: `https://picsum.photos/seed/${booking.candidateId}/100/100`, name: booking.candidateName } };
            })
    }, [completedBookings, reviewedBookingIds]);

    const totalPages = Math.ceil(pendingReviews.length / REVIEWS_PER_PAGE);
    const paginatedPendingReviews = useMemo(() => {
        const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
        return pendingReviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);
    }, [pendingReviews, currentPage]);


    const handleWriteReviewClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setReviewDialogOpen(true);
    };

    const handleReviewSubmitted = (newReview: ClientReview) => {
        if (newReview.bookingId) {
            setSessionReviewedBookingIds(prev => new Set(prev).add(newReview.bookingId!));
        }
        setSessionReviews(prev => [newReview, ...prev]);
        setReviewDialogOpen(false);
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

    const renderPagination = () => {
        if (totalPages <= 1) return null;
        return (
            <Pagination className="mt-6">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(Math.max(1, currentPage - 1)) }} className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined} />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1) }} isActive={currentPage === i + 1}>{i + 1}</PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(Math.min(totalPages, currentPage + 1)) }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        );
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
                                Review History ({allReviews.length})
                            </TabsTrigger>
                        </TabsList>
                    </CardHeader>
                    <CardContent>
                        <TabsContent value="pending" className="space-y-4">
                            {paginatedPendingReviews.length > 0 ? (
                                <>
                                    {paginatedPendingReviews.map(({ booking, candidate }) => (
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
                                    ))}
                                    {renderPagination()}
                                </>
                            ) : (
                                <div className="text-center text-muted-foreground py-12">
                                    <Inbox className="h-12 w-12 mx-auto text-muted-foreground/50" />
                                    <p className="mt-4 font-semibold">All caught up!</p>
                                    <p className="text-sm">You have no pending reviews.</p>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="history">
                            <div className="space-y-6">
                                {allReviews.map((review) => (
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
                            bookingId={selectedBooking?.id}
                            onReviewSubmitted={handleReviewSubmitted}
                         />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}


export default function ReviewGeneratorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ReviewGeneratorContent />
        </Suspense>
    )
}
