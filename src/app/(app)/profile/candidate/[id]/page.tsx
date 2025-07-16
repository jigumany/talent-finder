
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { mockCandidates } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, PoundSterling, Briefcase, Star, MapPin, FileText, CheckCircle } from 'lucide-react';
import { AvailabilityCalendar } from '@/components/availability-calendar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Calendar } from '@/components/ui/calendar';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';


export default function CandidatePublicProfilePage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [dates, setDates] = useState<Date[] | undefined>([]);
  const [isBookingDialogOpen, setBookingDialogOpen] = useState(false);

  const candidate = mockCandidates.find((c) => c.id === id);

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
    <div className="max-w-4xl mx-auto space-y-8">
       <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary/10">
                <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
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
                      <DialogDescription>
                        Select one or more dates to book {candidate.role} for your school.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center">
                         <Calendar
                            mode="multiple"
                            min={0}
                            selected={dates}
                            onSelect={setDates}
                            className="rounded-md border"
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
                    <Button size="lg" variant="outline" className="w-full">
                      <FileText className="mr-2"/> View CV
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>CV Preview</DialogTitle>
                      <DialogDescription>
                        A preview of the CV for {candidate.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative h-full w-full mt-4 rounded-md overflow-hidden">
                        <Image 
                            src="https://placehold.co/800x1100.png" 
                            alt="CV Preview"
                            layout="fill"
                            objectFit="contain"
                            data-ai-hint="document resume"
                        />
                    </div>
                     <DialogFooter className="sm:justify-end">
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Close
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </div>
       </div>

        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
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
                        <AvailabilityCalendar />
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
