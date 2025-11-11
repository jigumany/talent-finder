
'use client';

import { useState } from "react";
import { useRole } from "@/context/role-context";
import { mockClientBookings, mockCandidateBookings } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ClipboardEdit, Users, CheckCircle, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking } from "@/lib/types";


function BookingsTable({ bookings, onCancelBooking, onRebookClick, onLogOutcomeClick, isClient }: { bookings: Booking[], onCancelBooking: (id: string) => void, onRebookClick: (booking: Booking) => void, onLogOutcomeClick: (booking: Booking) => void, isClient: boolean }) {
    if (bookings.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p className="font-semibold">No entries found in this category.</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{isClient ? "Candidate" : "Role"}</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                            <div>{isClient ? booking.candidateName : booking.candidateRole}</div>
                            {isClient && <div className="text-sm text-muted-foreground">{booking.candidateRole}</div>}
                        </TableCell>
                        <TableCell>{format(new Date(booking.date), "PPP")}</TableCell>
                        <TableCell>
                            <Badge
                                className={cn({
                                    'bg-primary text-primary-foreground': booking.status === 'Confirmed',
                                    'bg-green-600 text-white': booking.status === 'Completed' || booking.status === 'Hired',
                                    'bg-destructive text-destructive-foreground': booking.status === 'Rejected',
                                }, 'badge-yellow')}
                            >
                                {booking.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                            {isClient && booking.status === 'Completed' && (
                                <Button size="sm" onClick={() => onRebookClick(booking)}>Rebook</Button>
                            )}
                             {isClient && booking.status === 'Hired' && (
                                <Button size="sm" onClick={() => onRebookClick(booking)}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    Schedule
                                </Button>
                            )}
                            {isClient && booking.status === 'Interview' && (
                                <Button size="sm" className="badge-yellow" onClick={() => onLogOutcomeClick(booking)}>
                                    <ClipboardEdit className="mr-2 h-4 w-4" />
                                    Log Outcome
                                </Button>
                            )}
                            {isClient && booking.status === 'Confirmed' && (
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive">Cancel</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently cancel the booking with {booking.candidateName}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Back</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => onCancelBooking(booking.id)}
                                              className={buttonVariants({ variant: "destructive" })}
                                            >
                                              Confirm Cancellation
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function BookingsPage() {
    const { role } = useRole();
    const isClient = role === 'client';
    
    const [bookings, setBookings] = useState<Booking[]>(isClient ? mockClientBookings : mockCandidateBookings);

    const applicantBookings = bookings.filter(b => ['Interview', 'Hired', 'Rejected'].includes(b.status));
    const upcomingBookings = bookings.filter(b => b.status === 'Confirmed');
    const completedBookings = bookings.filter(b => b.status === 'Completed');
    
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const { toast } = useToast();

    // State for rebooking dialog
    const [rebookDialogOpen, setRebookDialogOpen] = useState(false);
    const [rebookDates, setRebookDates] = useState<Date[] | undefined>([]);

    // State for interview outcome dialog
    const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);
    const [outcome, setOutcome] = useState<'hired' | 'rejected' | ''>('');
    const [outcomeNotes, setOutcomeNotes] = useState('');


    const handleCancelBooking = (bookingId: string) => {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        toast({
            title: "Booking Cancelled",
            description: `The booking has been successfully cancelled.`,
            variant: "destructive"
        });
    };

    const handleRebookClick = (booking: any) => {
        setSelectedBooking(booking);
        setRebookDates([]);
        setRebookDialogOpen(true);
    }

    const handleConfirmRebook = () => {
        if (!selectedBooking || !rebookDates || rebookDates.length === 0) return;
        
        // In a real app, this would create new booking records.
        // For now, we just show a toast.
        const bookedDates = rebookDates.map(date => format(date, "PPP")).join(', ');
        toast({
            title: "Booking Request Sent!",
            description: `Your request to book ${selectedBooking.candidateName} for ${bookedDates} has been sent.`,
        });
        setRebookDialogOpen(false);
    }
    
    const handleLogOutcomeClick = (booking: any) => {
        setSelectedBooking(booking);
        setOutcome('');
        setOutcomeNotes('');
        setOutcomeDialogOpen(true);
    };

    const handleConfirmOutcome = () => {
        if (!selectedBooking || !outcome) return;

        setBookings(prev => prev.map(b => 
            b.id === selectedBooking.id 
            ? { ...b, status: outcome === 'hired' ? 'Hired' : 'Rejected' } 
            : b
        ));

        setOutcomeDialogOpen(false);

        if (outcome === 'hired') {
            toast({
                title: "Outcome Logged: Hired!",
                description: `You've marked ${selectedBooking.candidateName} as hired. You can now schedule them from the 'Applicants' tab.`,
            });
        } else {
            toast({
                title: `Outcome Logged: Rejected`,
                description: `You have logged the interview outcome for ${selectedBooking.candidateName}.`,
            });
        }
    };

    const tableProps = {
        onCancelBooking: handleCancelBooking,
        onRebookClick: handleRebookClick,
        onLogOutcomeClick: handleLogOutcomeClick,
        isClient
    };


    return (
        <div className="max-w-4xl mx-auto">
            
            {isClient ? (
                <Card>
                    <Tabs defaultValue="applicants">
                        <CardHeader>
                            <CardTitle>Manage Your Pipeline</CardTitle>
                            <CardDescription>Manage job applicants, upcoming work, and completed bookings.</CardDescription>
                            <TabsList className="grid w-full grid-cols-3 mt-4">
                                <TabsTrigger value="applicants">
                                    <Users className="mr-2 h-4 w-4" />
                                    Applicants ({applicantBookings.length})
                                </TabsTrigger>
                                <TabsTrigger value="upcoming">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    Upcoming ({upcomingBookings.length})
                                </TabsTrigger>
                                <TabsTrigger value="completed">
                                    <ClipboardEdit className="mr-2 h-4 w-4" />
                                    Completed ({completedBookings.length})
                                </TabsTrigger>
                            </TabsList>
                        </CardHeader>
                        <CardContent>
                            <TabsContent value="applicants">
                                <BookingsTable bookings={applicantBookings} {...tableProps} />
                            </TabsContent>
                            <TabsContent value="upcoming">
                                <BookingsTable bookings={upcomingBookings} {...tableProps} />
                            </TabsContent>
                            <TabsContent value="completed">
                                <BookingsTable bookings={completedBookings} {...tableProps} />
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>
            ) : (
                 <Card>
                    <CardHeader>
                        <CardTitle>My Jobs</CardTitle>
                        <CardDescription>Review your past and upcoming job assignments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <BookingsTable bookings={bookings} {...tableProps} />
                    </CardContent>
                </Card>
            )}


            {/* Rebook Dialog */}
            <Dialog open={rebookDialogOpen} onOpenChange={setRebookDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Book {selectedBooking?.candidateName}</DialogTitle>
                  <DialogDescription>
                    Select one or more new dates to book {selectedBooking?.candidateRole}.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center">
                     <Calendar
                        mode="multiple"
                        selected={rebookDates}
                        onSelect={setRebookDates}
                        className="rounded-md border"
                    />
                </div>
                 <DialogFooter className="sm:justify-end gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                   <Button type="button" onClick={handleConfirmRebook} disabled={!rebookDates || rebookDates.length === 0}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        Confirm Booking
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Log Interview Outcome Dialog */}
            <Dialog open={outcomeDialogOpen} onOpenChange={setOutcomeDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Log Interview Outcome</DialogTitle>
                  <DialogDescription>
                    Record the result of the interview with {selectedBooking?.candidateName}.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <RadioGroup value={outcome} onValueChange={(value) => setOutcome(value as any)} className="flex justify-around">
                        <Label htmlFor="hired" className={cn(
                          "flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-colors duration-200 ease-in-out",
                          "hover:bg-green-50 hover:border-green-400",
                           outcome === 'hired' ? "bg-green-100 border-green-500 text-green-800" : "bg-popover border-muted"
                        )}>
                             <RadioGroupItem value="hired" id="hired" className="sr-only" />
                             <CheckCircle className="mb-3 h-6 w-6" />
                             Hire
                        </Label>

                         <Label htmlFor="rejected" className={cn(
                            "flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-colors duration-200 ease-in-out",
                            "hover:bg-red-50 hover:border-red-400",
                            outcome === 'rejected' ? "bg-red-100 border-red-500 text-red-800" : "bg-popover border-muted"
                          )}>
                             <RadioGroupItem value="rejected" id="rejected" className="sr-only" />
                             <XCircle className="mb-3 h-6 w-6" />
                             Reject
                        </Label>
                    </RadioGroup>
                    <div className="grid w-full gap-1.5">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea 
                            placeholder="Add any relevant notes..." 
                            id="notes" 
                            value={outcomeNotes}
                            onChange={(e) => setOutcomeNotes(e.target.value)}
                        />
                    </div>
                </div>
                 <DialogFooter className="sm:justify-end gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                   <Button type="button" onClick={handleConfirmOutcome} disabled={!outcome}>
                        Submit Outcome
                    </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
    );

    