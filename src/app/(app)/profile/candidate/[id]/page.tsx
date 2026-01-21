'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Candidate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, FileText, Star, MapPin, MessageSquare, Loader2, UserPlus } from 'lucide-react';
import { AvailabilityCalendar } from '@/components/availability-calendar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription as DialogDescriptionComponent,
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
import { fetchCandidateById, createBooking } from '@/lib/data-service';
import { useUser } from '@/context/user-context';
import { BookingCalendar } from '@/components/booking-calendar';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DayDetail {
  date: Date;
  session: 'allday' | 'am' | 'pm';
  startTime?: string;
  endTime?: string;
}

export default function CandidatePublicProfilePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [dates, setDates] = useState<Date[] | undefined>([]);
  const [isBookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'Day' | 'Hourly'>('Day');
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
  const [dayDetails, setDayDetails] = useState<Record<string, DayDetail>>({});
  
  const resumeImage = images['document-resume'];
  const { user } = useUser();
  
  useEffect(() => {
      if (!id) return;
      
      async function loadCandidate() {
          setIsLoading(true);
          const fetchedCandidate = await fetchCandidateById(id);
          if (fetchedCandidate) {
              setCandidate(fetchedCandidate);
          }
          setIsLoading(false);
      }
      loadCandidate();
  }, [id]);

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

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('available')) return 'bg-green-500';
    if (lowerStatus.includes('booked')) return 'bg-yellow-500';
    if (lowerStatus.includes('unavailable') || lowerStatus.includes('inactive')) return 'bg-red-500';
    if (lowerStatus.includes('online')) return 'bg-green-500';
    return 'bg-gray-400';
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (!candidate) {
    notFound();
  }
  
  const qualificationOrder = ['Key Stages', 'Qualifications', 'SEND', 'Languages', 'Additional Qualifications'];

  const handleBooking = async () => {
    if (!candidate || !dates || dates.length === 0) return;

    const sortedDates = dates.sort((a,b) => a.getTime() - b.getTime());
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];

    let booking_pattern: any;
    if (recurring) {
      booking_pattern = Object.entries(recurringDays)
        .filter(([, isSelected]) => isSelected)
        .reduce((acc, [day]) => {
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

    if (result.success) {
      toast({
          title: "Booking Request Sent!",
          description: `Your request to book ${candidate.name} has been sent.`,
      });
      setBookingDialogOpen(false);
      // Reset form
      setDates([]);
      setDayDetails({});
      setRecurring(false);
      setBookingType('Day');
    } else {
        toast({
          title: "Booking Failed",
          description: "Could not create the booking. The candidate may not be available on the selected dates.",
          variant: "destructive",
      });
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
       <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-primary/10">
                <AvatarImage src={candidate.imageUrl} alt={candidate.name} data-ai-hint="professional headshot" />
                <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold font-headline">{candidate.name}</h1>
                   {candidate.status && (
                    <Badge 
                      variant="outline" 
                      className={cn('text-base whitespace-nowrap', getStatusColor(candidate.status), 'border-transparent text-white')}
                      title={`Status: ${candidate.status}`}
                    >
                      {candidate.status}
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-muted-foreground">{candidate.role}</p>
                 <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{candidate.location}</span>
                    </div>
                     {candidate.rating && candidate.rating > 0 && (
                        <div className="flex items-center gap-1.5 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-bold">{candidate.rating.toFixed(1)}</span>
                            {candidate.reviews && (
                              <span>({candidate.reviews} reviews)</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full md:w-auto flex flex-col gap-2">
                 <Dialog open={isBookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Book Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Book {candidate.name}</DialogTitle>
                      <DialogDescriptionComponent className="text-sm">
                        Configure booking details for {candidate.role}.
                      </DialogDescriptionComponent>
                    </DialogHeader>
                    
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                      <div className="space-y-4">
                        <BookingCalendar
                          mode="multiple"
                          selected={dates}
                          onSelect={handleDateSelect}
                          candidate={candidate}
                        />
                        
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label className="text-base">Booking Type</Label>
                            <RadioGroup 
                              value={bookingType} 
                              onValueChange={(v: 'Day' | 'Hourly') => setBookingType(v)} 
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Day" id="day-profile" />
                                <Label htmlFor="day-profile" className="text-sm">Daily</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Hourly" id="hourly-profile" />
                                <Label htmlFor="hourly-profile" className="text-sm">Hourly</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          
                          <div className="flex items-center space-x-2 pt-2">
                            <Switch
                              id="recurring-profile"
                              checked={recurring}
                              onCheckedChange={setRecurring}
                            />
                            <Label htmlFor="recurring-profile" className="text-sm">
                              Recurring Booking
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {recurring ? (
                          <div className="space-y-4">
                            <Label className="text-base">Select Recurring Days</Label>
                            <div className="grid grid-cols-2 gap-3">
                              {Object.keys(recurringDays).map((day) => (
                                <div key={day} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`rec-${day}-profile`}
                                    checked={recurringDays[day as keyof typeof recurringDays]}
                                    onCheckedChange={(checked) => setRecurringDays(prev => ({...prev, [day]: !!checked}))}
                                  />
                                  <label htmlFor={`rec-${day}-profile`} className="text-sm font-medium">
                                    {day}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground pt-2">
                              This will create a recurring booking for the selected days of the week.
                            </p>
                          </div>
                        ) : (
                          <>
                            {dates && dates.length > 0 ? (
                              <div className="space-y-4">
                                <Label className="text-base">Configure Selected Dates</Label>
                                {Object.values(dayDetails).map(detail => (
                                  <div key={detail.date.toISOString()} className="p-4 border rounded-lg space-y-3 bg-card">
                                    <p className="font-semibold text-sm">{format(detail.date, 'EEEE, MMMM d, yyyy')}</p>
                                    {bookingType === 'Day' ? (
                                      <div className="space-y-2">
                                        <Label className="text-sm">Session Type</Label>
                                        <Select 
                                          value={detail.session} 
                                          onValueChange={(value) => handleDayDetailChange(detail.date.toISOString().split('T')[0], 'session', value)}
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select session" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="allday">All Day (Full Day)</SelectItem>
                                            <SelectItem value="am">Morning Session (AM)</SelectItem>
                                            <SelectItem value="pm">Afternoon Session (PM)</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                          <Label className="text-sm">Start Time</Label>
                                          <Input 
                                            type="time" 
                                            value={detail.startTime} 
                                            onChange={e => handleDayDetailChange(detail.date.toISOString().split('T')[0], 'startTime', e.target.value)}
                                            className="w-full"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label className="text-sm">End Time</Label>
                                          <Input 
                                            type="time" 
                                            value={detail.endTime} 
                                            onChange={e => handleDayDetailChange(detail.date.toISOString().split('T')[0], 'endTime', e.target.value)}
                                            className="w-full"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-8 text-center">
                                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-sm text-muted-foreground">
                                  Select dates on the calendar to configure sessions
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
                      <DialogClose asChild>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full sm:w-auto"
                          onClick={() => {
                            setDates([]);
                            setDayDetails({});
                            setRecurring(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      
                      <Button 
                        type="button" 
                        onClick={handleBooking} 
                        disabled={!dates || dates.length === 0 || (recurring && !Object.values(recurringDays).some(day => day))}
                        className="w-full sm:w-auto"
                      >
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
                 {candidate.details && Object.keys(candidate.details).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Qualifications & Skills</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {qualificationOrder.map(category => {
                                if (candidate.details && candidate.details[category] && candidate.details[category].length > 0) {
                                    return (
                                    <div key={category}>
                                        <h3 className="font-semibold text-md mb-2">{category}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.details[category].map((value, index) => (
                                                <Badge key={`${category}-${value}-${index}`} variant={category === 'Key Stages' ? 'default' : 'secondary'} className="text-base py-1 px-3">
                                                    {value}
                                                </Badge>
                                            ))}
                                        </div>
                                        <Separator className="mt-4" />
                                    </div>
                                    )
                                }
                                return null;
                                })
                            }
                        </CardContent>
                    </Card>
                )}
            </div>
            <div className="space-y-8">
              {candidate.reviewsData && candidate.reviewsData.length > 0 && (
                  <Card>
                    <CardHeader>
                        <CardTitle>Recent Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {candidate.reviewsData.map((review, index) => (
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
                        ))}
                    </CardContent>
                </Card>
              )}
            </div>
        </div>
    </div>
  );
}