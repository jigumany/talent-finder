'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, User, Mail, UserPlus, BookOpenText } from 'lucide-react';
import type { Candidate } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { toast } from '@/hooks/use-toast';
import { BookingCalendar } from './booking-calendar';
import { createBooking } from '@/lib/data-service';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const [dates, setDates] = useState<Date[] | undefined>([]);
  const [isBookingDialogOpen, setBookingDialogOpen] = useState(false);

  const handleBooking = async () => {
    if (!dates || dates.length === 0) return;

    const result = await createBooking({ candidateId: candidate.id, dates, role: candidate.role });

    if (result.success) {
        toast({
            title: "Booking Request Sent!",
            description: `Your request to book ${candidate.name} has been sent.`,
        });
        setBookingDialogOpen(false);
    } else {
         toast({
            title: "Booking Failed",
            description: "Could not create the booking. The candidate may not be available on the selected dates.",
            variant: "destructive",
        });
    }
  }

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('active') || lowerStatus.includes('available') || lowerStatus.includes('online')) return 'bg-green-500';
    if (lowerStatus.includes('stop') || lowerStatus.includes('pending') || lowerStatus.includes('pre-screen')) return 'bg-yellow-500';
    if (lowerStatus.includes('archived') || lowerStatus.includes('inactive')) return 'bg-red-500';
    return 'bg-gray-400';
  };
  
  const qualificationOrder = ['Key Stages', 'Qualifications', 'SEND', 'Languages', 'Additional Qualifications'];

  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full w-full max-w-full">
      <CardHeader className="flex flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-card">
        <div className="relative flex-shrink-0">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-primary/20">
            <AvatarImage src={candidate.imageUrl} alt={candidate.name} data-ai-hint="professional headshot" />
            <AvatarFallback className="text-sm sm:text-base">
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
           <Badge 
              variant="outline" 
              className={cn(
                'absolute -bottom-1 -right-2 text-[8px] xs:text-[9px] sm:text-[10px] px-1 xs:px-1.5 py-0 sm:py-0.5 whitespace-nowrap border-2 border-background', 
                getStatusColor(candidate.status), 
                'text-white'
              )}
              title={`Status: ${candidate.status}`}
            >
              <span className="truncate max-w-[50px] xs:max-w-[60px] sm:max-w-none">{candidate.status}</span>
            </Badge>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <CardTitle className="text-base sm:text-lg lg:text-xl font-headline truncate">
            {candidate.name}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            {candidate.role}
          </p>
          <div className="flex flex-wrap items-center gap-1 mt-1 text-xs sm:text-sm text-amber-500">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current flex-shrink-0" />
            <span className="font-bold">{candidate.rating.toFixed(1)}</span>
            <span className="text-muted-foreground/80 text-xs">
              ({candidate.reviews} reviews)
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 flex-grow space-y-2 sm:space-y-3 text-xs sm:text-sm">
        {/* Bio section */}
        <div className="flex items-start gap-2 text-muted-foreground">
            <BookOpenText className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 sm:mt-1 flex-shrink-0" />
            <p className="italic line-clamp-2 text-xs sm:text-sm leading-relaxed">
              {candidate.bio}
            </p>
        </div>

        <Separator className="my-1 sm:my-2" />

        {/* Contact info */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <a 
              href={`mailto:${candidate.email}`} 
              className="truncate hover:underline text-xs sm:text-sm"
            >
              {candidate.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate text-xs sm:text-sm">{candidate.location}</span>
          </div>
        </div>
        
        {/* Qualifications section */}
        {Object.keys(candidate.details).length > 0 && (
          <Separator className="my-2 sm:my-3" />
        )}

        <div className="space-y-2 sm:space-y-2.5">
          {qualificationOrder.map(category => {
            if (candidate.details[category] && candidate.details[category].length > 0) {
              return (
                <div key={category} className="mb-1 sm:mb-0">
                  <h4 className="font-semibold text-[10px] xs:text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {candidate.details[category].map((value, index) => (
                      <Badge 
                        key={`${category}-${value}-${index}`} 
                        variant={category === 'Key Stages' ? 'default' : 'secondary'}
                        className="text-[10px] xs:text-xs py-0 h-5 sm:h-6 px-1.5 sm:px-2"
                      >
                        <span className="truncate max-w-[80px] xs:max-w-[100px] sm:max-w-none">
                          {value}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            }
            return null;
          })}
        </div>
             
        {/* Rate section */}
        <p className="text-sm sm:text-base lg:text-lg font-semibold text-primary flex items-center pt-2 sm:pt-3">
          £{candidate.rate}
          <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">
            /{candidate.rateType}
          </span>
        </p>
      </CardContent>
      
      {/* Footer with buttons */}
      <CardFooter className="p-3 sm:p-4 bg-muted/50 flex flex-col xs:flex-row gap-2 sm:gap-2 mt-auto">
        <Button 
          variant="warning" 
          asChild 
          className="w-full xs:w-1/2 text-xs sm:text-sm py-2 h-auto min-h-[36px] sm:min-h-[40px]"
        >
          <Link href={`/profile/candidate/${candidate.id}`}>
            <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0"/>
            <span>View Profile</span>
          </Link>
        </Button>
        
        <Dialog open={isBookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full xs:w-1/2 text-xs sm:text-sm py-2 h-auto min-h-[36px] sm:min-h-[40px]">
              <UserPlus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0"/>
              <span>Book Now</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-md mx-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg lg:text-xl">
                Book {candidate.name}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Select one or more dates to book {candidate.role} for your school.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-center p-1 overflow-x-auto">
              <BookingCalendar
                mode="multiple"
                selected={dates}
                onSelect={setDates}
                candidate={candidate}
                className="scale-90 sm:scale-100 origin-top min-w-[280px]"
              />
            </div>
            
            <DialogFooter className="flex flex-col xs:flex-row gap-2 sm:gap-2 mt-4">
              <DialogClose asChild>
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="w-full xs:w-auto text-xs sm:text-sm"
                >
                  Cancel
                </Button>
              </DialogClose>
              
              <Button 
                type="button" 
                onClick={handleBooking} 
                disabled={!dates || dates.length === 0}
                className="w-full xs:w-auto text-xs sm:text-sm"
              >
                Confirm Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}