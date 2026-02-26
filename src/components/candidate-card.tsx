
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
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { useUser } from '@/context/user-context';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CandidateCardProps {
  candidate: Candidate;
}

type DayDetail = {
  date: Date;
  session: 'allday' | 'am' | 'pm';
  startTime?: string;
  endTime?: string;
};

export function CandidateCard({ candidate }: CandidateCardProps) {
  const [dates, setDates] = useState<Date[] | undefined>([]);
  const [isBookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'Day' | 'Hourly'>('Day');
  
  const [dayDetails, setDayDetails] = useState<Record<string, DayDetail>>({});
  const { user } = useUser();

  const [recurring, setRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });
  
  const handleDateSelect = (selectedDates: Date[] | undefined) => {
    setDates(selectedDates);
    const newDayDetails: Record<string, DayDetail> = {};
    selectedDates?.forEach(d => {
      const dateString = d.toISOString().split('T')[0];
      newDayDetails[dateString] = dayDetails[dateString] || {
        date: d,
        session: 'allday',
        startTime: '09:00',
        endTime: '17:00'
      };
    });
    setDayDetails(newDayDetails);
  };
  
  const handleDayDetailChange = (dateString: string, field: keyof DayDetail, value: any) => {
    setDayDetails(prev => ({
      ...prev,
      [dateString]: {
        ...prev[dateString],
        [field]: value
      }
    }));
  };

  const handleBooking = async () => {
    if (!dates || dates.length === 0) return;

    const sortedDates = dates.sort((a,b) => a.getTime() - b.getTime());
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    let booking_pattern: any;
    if (recurring) {
      booking_pattern = Object.entries(recurringDays)
        .filter(([, isSelected]) => isSelected)
        .reduce((acc, [day]) => {
          // For now, recurring is always allday. This could be expanded.
          acc[day] = 'allday';
          return acc;
        }, {} as Record<string, string>);
    } else {
      if (bookingType === 'Day') {
         booking_pattern = Object.values(dayDetails).map(detail => ({
           date: format(detail.date, 'yyyy-MM-dd'),
           type: detail.session
         }));
      } else { // Hourly
         booking_pattern = Object.values(dayDetails).map(detail => ({
           date: format(detail.date, 'yyyy-MM-dd'),
           start_time: detail.startTime,
           end_time: detail.endTime
         }));
      }
    }

    const result = await createBooking({ 
      candidateId: candidate.id,
      companyId: user?.profile?.company?.id as number,
      candidateName: candidate.name,
      payRate: candidate.rate || 0,
      charge: 350,
      recurring,
      booking_pattern,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      booking_type: bookingType,
      booking_role: candidate.role,
    });

    if (result.success && result.bookings) {
        toast({
            title: "Booking Request Sent!",
            description: `Your request to book ${candidate.name} has been sent.`,
        });
        setBookingDialogOpen(false);
    } else {
         toast({
            title: "Booking Failed",
            description: "Could not create the booking. The candidate may not be available on the selected dates or your session has expired.",
            variant: "destructive",
        });
    }
  }

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('available')) return 'bg-green-500';
    if (lowerStatus.includes('booked')) return 'bg-yellow-500';
    if (lowerStatus.includes('unavailable') || lowerStatus.includes('inactive')) return 'bg-red-500';
    if (lowerStatus.includes('online')) return 'bg-green-500';
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
            {candidate.reviews > 0 ? (
              <>
                <span className="font-bold">{candidate.rating.toFixed(1)}</span>
                <span className="text-muted-foreground/80 text-xs">
                  ({candidate.reviews} reviews)
                </span>
              </>
            ) : (
              <span className="text-muted-foreground/80 text-xs">No reviews yet</span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 flex-grow space-y-2 sm:space-y-3 text-xs sm:text-sm">
        {/* Contact info */}
        <div className="space-y-1.5 sm:space-y-2">
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
           <DialogContent className="w-[95vw] max-w-fit mx-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg lg:text-xl">
                Book {candidate.name}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Select dates and booking details for {candidate.role}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid md:grid-cols-2 gap-6 items-start">
               <div className="space-y-4">
                  <BookingCalendar
                    mode="multiple"
                    selected={dates}
                    onSelect={handleDateSelect}
                    candidate={candidate}
                    className="scale-90 sm:scale-100 origin-top min-w-[280px]"
                  />
                  <div className="space-y-2">
                    <Label>Booking Type</Label>
                    <RadioGroup value={bookingType} onValueChange={(v: 'Day' | 'Hourly') => setBookingType(v)} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Day" id="day-card" />
                            <Label htmlFor="day-card">Daily</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Hourly" id="hourly-card" />
                            <Label htmlFor="hourly-card">Hourly</Label>
                        </div>
                    </RadioGroup>
                  </div>
               </div>

               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {recurring ? (
                    <div className="space-y-2">
                      <Label>Select Recurring Days</Label>
                       {Object.keys(recurringDays).map((day) => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox
                              id={`rec-${day}-card`}
                              checked={recurringDays[day as keyof typeof recurringDays]}
                              onCheckedChange={(checked) => setRecurringDays(prev => ({...prev, [day]: !!checked}))}
                            />
                            <label htmlFor={`rec-${day}-card`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {day}
                            </label>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <>
                      {dates && dates.length > 0 ? (
                        <div className="space-y-4">
                           {Object.values(dayDetails).map(detail => (
                            <div key={detail.date.toISOString()} className="p-3 border rounded-md space-y-3">
                              <p className="font-semibold">{format(detail.date, 'PPP')}</p>
                              {bookingType === 'Day' ? (
                                <Select value={detail.session} onValueChange={(value) => handleDayDetailChange(detail.date.toISOString().split('T')[0], 'session', value)}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select session" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="allday">All Day</SelectItem>
                                    <SelectItem value="am">AM</SelectItem>
                                    <SelectItem value="pm">PM</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs">Start Time</Label>
                                    <Input type="time" value={detail.startTime} onChange={e => handleDayDetailChange(detail.date.toISOString().split('T')[0], 'startTime', e.target.value)} />
                                  </div>
                                   <div>
                                    <Label className="text-xs">End Time</Label>
                                    <Input type="time" value={detail.endTime} onChange={e => handleDayDetailChange(detail.date.toISOString().split('T')[0], 'endTime', e.target.value)} />
                                  </div>
                                </div>
                              )}
                            </div>
                           ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center pt-8">Select dates on the calendar to configure sessions.</p>
                      )}
                    </>
                  )}
               </div>
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

    
