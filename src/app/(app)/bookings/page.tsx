
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
import { Calendar as CalendarIcon, ClipboardEdit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";


export default function BookingsPage() {
    const { role } = useRole();
    const isClient = role === 'client';
    const bookings = isClient ? mockClientBookings : mockCandidateBookings;
    const title = isClient ? "Manage Bookings" : "My Bookings";
    const description = isClient ? "Review your past and upcoming candidate bookings." : "Review your past and upcoming job assignments.";
    
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
        // In a real app, you'd make an API call here to actually cancel the booking.
        // For now, we'll just show a confirmation toast.
        toast({
            title: "Booking Cancelled",
            description: `The booking (ID: ${bookingId}) has been successfully cancelled.`,
            variant: "destructive"
        });
        // Here you would also update the state to remove the cancelled booking from the list.
    };

    const handleRebookClick = (booking: any) => {
        setSelectedBooking(booking);
        setRebookDates([]);
        setRebookDialogOpen(true);
    }

    const handleConfirmRebook = () => {
        if (!selectedBooking || !rebookDates || rebookDates.length === 0) return;
        
        const bookedDates = rebookDates.map(date => format(date, "PPP")).join(', ');
        toast({
            title: "Booking Request Sent!",
            description: `Your request to re-book ${selectedBooking.candidateName} for ${bookedDates} has been sent.`,
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

        setOutcomeDialogOpen(false);

        if (outcome === 'hired') {
            toast({
                title: "Outcome Logged: Hired!",
                description: `You've marked ${selectedBooking.candidateName} as hired. Please select their start date(s).`,
            });
            // Open the rebooking/scheduling modal
            setRebookDates([]);
            setRebookDialogOpen(true);
        } else {
            toast({
                title: `Outcome Logged: Rejected`,
                description: `You have logged the interview outcome for ${selectedBooking.candidateName}.`,
            });
        }
    };


    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold font-headline mb-6">{title}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
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
                                            className={cn("text-white", {
                                                'bg-primary': booking.status === 'Confirmed',
                                                'bg-green-600': booking.status === 'Completed',
                                                'badge-yellow': booking.status === 'Interview'
                                            })}
                                            variant={booking.status === 'Completed' ? 'default' : booking.status === 'Interview' ? 'secondary' : 'default'}
                                        >
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {isClient && booking.status === 'Completed' && (
                                            <Button size="sm" onClick={() => handleRebookClick(booking)}>Rebook</Button>
                                        )}
                                        {isClient && booking.status === 'Interview' && (
                                            <Button size="sm" className="badge-yellow" onClick={() => handleLogOutcomeClick(booking)}>
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
                                                          onClick={() => handleCancelBooking(booking.id)}
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
                </CardContent>
            </Card>

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
                    <RadioGroup value={outcome} onValueChange={(value) => setOutcome(value as any)}>
                        <Label>Outcome</Label>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hired" id="hired" />
                            <Label htmlFor="hired">Hire Candidate</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="rejected" id="rejected" />
                            <Label htmlFor="rejected">Reject Candidate</Label>
                        </div>
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
}
