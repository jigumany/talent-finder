
'use client';

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DiaryCalendar } from "@/components/diary-calendar";
import { mockClientBookings } from "@/lib/mock-data";
import { isSameDay, format, parseISO } from "date-fns";
import type { Booking } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Briefcase, User, MoreVertical, CalendarClock, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Calendar as CalendarSelector } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";

export default function DiaryPage() {
    const [bookings, setBookings] = useState<Booking[]>(mockClientBookings);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());
    const { toast } = useToast();

    // State for dialogs
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
    const [bookingToReschedule, setBookingToReschedule] = useState<Booking | null>(null);
    const [rescheduleDates, setRescheduleDates] = useState<Date[] | undefined>([]);
    const [isRescheduleConfirmOpen, setRescheduleConfirmOpen] = useState(false);


    const handleMonthChange = (month: Date) => {
        setDisplayedMonth(month);
        setSelectedDate(month);
    }

    const selectedDayBookings = useMemo(() => bookings.filter(booking => 
        selectedDate && isSameDay(parseISO(booking.date), selectedDate)
    ), [bookings, selectedDate]);

    const handleCancelBooking = (bookingId: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        setBookings(prev => prev.filter(b => b.id !== bookingId));
        toast({
            title: "Booking Cancelled",
            description: `The booking with ${booking.candidateName} has been cancelled.`,
            variant: "destructive"
        });
        setBookingToCancel(null);
    };

    const handleRescheduleClick = (booking: Booking) => {
        setBookingToReschedule(booking);
        setRescheduleDates([]);
    };
    
    const handleConfirmReschedule = () => {
        if (!bookingToReschedule || !rescheduleDates || rescheduleDates.length === 0) return;

        const newBookings: Booking[] = rescheduleDates.map(date => ({
            ...bookingToReschedule,
            id: `b-rebook-${Date.now()}-${Math.random()}`,
            date: date.toISOString(),
            status: 'Confirmed'
        }));

        // Remove old booking and add new ones
        setBookings(prev => [...prev.filter(b => b.id !== bookingToReschedule.id), ...newBookings]);
        
        const bookedDates = rescheduleDates.map(date => format(date, "PPP")).join(', ');
        toast({
            title: "Booking Rescheduled!",
            description: `${bookingToReschedule.candidateName} has been rebooked for ${bookedDates}.`,
        });
        setBookingToReschedule(null);
        setRescheduleConfirmOpen(false);
    };


    return (
        <div className="max-w-6xl mx-auto">
             <h1 className="text-2xl font-bold font-headline mb-6">My Diary</h1>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Schedule</CardTitle>
                            <CardDescription>
                               Click on a date to see the bookings for that day.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-2 md:p-6">
                            <DiaryCalendar 
                                bookings={bookings}
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                month={displayedMonth}
                                onMonthChange={handleMonthChange}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 sticky top-20">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                               <Calendar className="h-5 w-5 text-muted-foreground" />
                               <span>
                                {selectedDate ? format(selectedDate, "do MMMM yyyy") : "Select a date"}
                               </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedDayBookings.length > 0 ? (
                                selectedDayBookings.map(booking => (
                                    <div key={booking.id} className="p-4 rounded-lg border bg-muted/50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-semibold text-primary flex items-center gap-2"><User className="h-4 w-4"/> {booking.candidateName}</p>
                                                <p className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="h-4 w-4"/> {booking.candidateRole}</p>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                 <Badge
                                                    variant={'outline'}
                                                    className={cn({
                                                        'bg-primary text-primary-foreground border-transparent': booking.status === 'Confirmed',
                                                        'bg-green-600 text-white border-transparent': booking.status === 'Completed',
                                                        'bg-amber-500 text-white border-transparent': booking.status === 'Interview'
                                                    })}
                                                >
                                                    {booking.status}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                         {(booking.status === 'Confirmed' || booking.status === 'Interview') && (
                                                            <DropdownMenuItem onClick={() => handleRescheduleClick(booking)}>
                                                                <CalendarClock className="mr-2 h-4 w-4" />
                                                                Reschedule
                                                            </DropdownMenuItem>
                                                         )}
                                                          {(booking.status === 'Confirmed' || booking.status === 'Interview') && (
                                                            <DropdownMenuItem className="text-destructive" onClick={() => setBookingToCancel(booking)}>
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Cancel
                                                            </DropdownMenuItem>
                                                         )}
                                                          {booking.status === 'Completed' && (
                                                             <DropdownMenuItem disabled>
                                                                No actions available
                                                            </DropdownMenuItem>
                                                          )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                             </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <p>No bookings for this day.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
             </div>

             {/* Cancel Booking Dialog */}
            <AlertDialog open={!!bookingToCancel} onOpenChange={(open) => !open && setBookingToCancel(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will cancel the {bookingToCancel?.status.toLowerCase()} with {bookingToCancel?.candidateName}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Back</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => bookingToCancel && handleCancelBooking(bookingToCancel.id)}
                            className={buttonVariants({ variant: "destructive" })}
                        >
                            Confirm Cancellation
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Reschedule Booking Dialog */}
            <Dialog open={!!bookingToReschedule} onOpenChange={(open) => !open && setBookingToReschedule(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Reschedule {bookingToReschedule?.status}</DialogTitle>
                  <DialogDescription>
                    Select one or more new dates to reschedule with {bookingToReschedule?.candidateName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center">
                     <CalendarSelector
                        mode="multiple"
                        selected={rescheduleDates}
                        onSelect={setRescheduleDates}
                        className="rounded-md border"
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    />
                </div>
                 <DialogFooter className="sm:justify-end gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <AlertDialog open={isRescheduleConfirmOpen} onOpenChange={setRescheduleConfirmOpen}>
                    <AlertDialogTrigger asChild>
                         <Button type="button" disabled={!rescheduleDates || rescheduleDates.length === 0}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Confirm Reschedule
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Reschedule</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to reschedule this booking for the selected dates? The original booking will be removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleConfirmReschedule}>
                                Yes, Reschedule
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                   </AlertDialog>
                </DialogFooter>
              </DialogContent>
            </Dialog>

        </div>
    );
}

