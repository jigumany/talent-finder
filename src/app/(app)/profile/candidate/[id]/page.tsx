
'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Candidate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, PoundSterling, Star, MapPin, FileText, CheckCircle, MessageSquare } from 'lucide-react';
import { AvailabilityCalendar } from '@/components/availability-calendar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription as DialogDescriptionComponent, // Renamed to avoid conflict
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import images from '@/lib/placeholder-images.json';
import { cn } from '@/lib/utils';
import { notFound, useParams } from 'next/navigation';
import { mockCandidates, mockClientBookings } from '@/lib/mock-data';
import { BookingCalendar } from '@/components/booking-calendar';


export default function CandidatePublicProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const candidate = mockCandidates.find((c) => c.id === id);

  const [dates, setDates] = useState<Date[] | undefined>([]);
  const [isBookingDialogOpen, setBookingDialogOpen] = useState(false);
  const resumeImage = images['document-resume'];

  if (!candidate) {
    notFound();
  }

  const handleBooking = () => {
    const bookedDates = dates?.map(date => format(date, "PPP")).join(', ') || 'your selected dates';
    toast({
        title: "Booking Request Sent!",
        description: `Your request to book ${candidate.name} for ${bookedDates} has been sent.`,
    });
    setBookingDialogOpen(false);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
       <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary/10">
                <AvatarImage src={candidate.imageUrl} alt={candidate.name} data-ai-hint="professional headshot" />
                <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <h1 className="text-3xl font-bold font-headline">{candidate.name}</h1>
                <p className="text-lg text-muted-foreground">{candidate.role}</p>
                 <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{candidate.location}</span>
                    </div>
                     <div className="flex items-center gap-1.5 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">{candidate.rating.toFixed(1)}</span>
                        <span>({candidate.reviews} reviews)</span>
                    </div>
                </div>
            </div>
            <div className="w-full md:w-auto flex flex-col gap-2">
                 <Dialog open={isBookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full"><CalendarIcon className="mr-2"/> Book Now</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book {candidate.name}</DialogTitle>
                      <DialogDescriptionComponent>
                        Select one or more dates to book {candidate.role} for your school.
                      </DialogDescriptionComponent>
                    </DialogHeader>
                    <div className="flex justify-center p-1">
                         <BookingCalendar
                            mode="multiple"
                            selected={dates}
                            onSelect={setDates}
                            className="rounded-md border"
                            candidate={candidate}
                            allBookings={mockClientBookings}
                        />
                    </div>
                     <DialogFooter className="sm:justify-end gap-2">
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Cancel
                        </Button>
                      </DialogClose>
                       <Button type="button" onClick={handleBooking} disabled={!dates || dates.length === 0}>
                          Confirm Booking
                        </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="warning" className="w-full">
                      <FileText className="mr-2"/> View CV
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl flex flex-col h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>CV Preview</DialogTitle>
                      <DialogDescriptionComponent>
                        A preview of the CV for {candidate.name}.
                      </DialogDescriptionComponent>
                    </DialogHeader>
                    <div className="relative flex-1 mt-4 rounded-md overflow-hidden bg-muted/50">
                        <Image 
                            src={resumeImage.src}
                            alt="CV Preview"
                            width={resumeImage.width}
                            height={resumeImage.height}
                            style={{objectFit: 'contain', width: '100%', height: '100%'}}
                            data-ai-hint={resumeImage.hint}
                        />
                    </div>
                     <DialogFooter className="sm:justify-end mt-4">
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Close
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </div>
       </div>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>About Me</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                            {candidate.bio}
                        </p>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Qualifications & Skills</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {candidate.qualifications.map(q => (
                            <Badge key={q} variant="secondary" className="text-base py-1 px-3 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                {q}
                            </Badge>
                        ))}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Recent Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {candidate.reviewsData && candidate.reviewsData.length > 0 ? (
                            candidate.reviewsData.map((review, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold">{review.reviewerName}</p>
                                            <p className="text-sm text-muted-foreground">{format(new Date(review.date), 'MMMM yyyy')}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("h-5 w-5", i < review.rating ? 'fill-current' : 'fill-muted stroke-muted-foreground')} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground mt-2 italic">"{review.comment}"</p>
                                    {index < candidate.reviewsData!.length - 1 && <Separator className="mt-6" />}
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8">
                                <MessageSquare className="h-10 w-10 mb-4" />
                                <p className="font-semibold">No reviews yet</p>
                                <p className="text-sm">This candidate has not received any reviews.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Rates</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-baseline">
                             <span className="text-muted-foreground">Daily Rate</span>
                             <span className="text-2xl font-bold">£{candidate.rateType === 'daily' ? candidate.rate : 'N/A'}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-baseline">
                             <span className="text-muted-foreground">Hourly Rate</span>
                             <span className="text-2xl font-bold">£{candidate.rateType === 'hourly' ? candidate.rate : 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Availability</CardTitle>
                         <CardDescription>
                            This calendar shows the candidate's general availability.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center p-1">
                        <AvailabilityCalendar />
                      </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
