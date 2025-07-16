
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, User, BookUser, Calendar as CalendarIcon } from 'lucide-react';
import type { Candidate } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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


interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isBookingDialogOpen, setBookingDialogOpen] = useState(false);

  const handleBooking = () => {
    toast({
        title: "Booking Confirmed!",
        description: `${candidate.name} has been booked for ${format(date!, "PPP")}.`,
    });
    setBookingDialogOpen(false);
  }

  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-4 p-4 bg-card">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src={candidate.imageUrl} alt={candidate.name} data-ai-hint="teacher portrait" />
          <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-xl font-headline">{candidate.name}</CardTitle>
          <p className="text-muted-foreground">{candidate.role}</p>
          <div className="flex items-center gap-1 mt-1 text-sm text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{candidate.rating.toFixed(1)}</span>
            <span className="text-muted-foreground/80">({candidate.reviews} reviews)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{candidate.location}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {candidate.qualifications.map(q => (
                    <Badge key={q} variant="secondary">{q}</Badge>
                ))}
            </div>
            <p className="text-lg font-semibold text-primary">
                ${candidate.rate}<span className="text-sm font-normal text-muted-foreground">/{candidate.rateType}</span>
            </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50 grid grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <Link href={`/profile/candidate/${candidate.id}`}>
            <User />View Profile
          </Link>
        </Button>
         <Dialog open={isBookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogTrigger asChild>
            <Button><BookUser />Book Now</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Book {candidate.name}</DialogTitle>
              <DialogDescription>
                Select a date to book {candidate.role} for your school.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
                 <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                />
            </div>
             <DialogFooter className="sm:justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
               <Button type="button" onClick={handleBooking} disabled={!date}>
                  Confirm Booking
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
