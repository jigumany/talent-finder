
'use client';

import { useState } from "react";
import { useRole } from "@/context/role-context";
import { mockClientBookings, mockCandidateBookings } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";


export default function BookingsPage() {
    const { role } = useRole();
    const isClient = role === 'client';
    const bookings = isClient ? mockClientBookings : mockCandidateBookings;
    const title = isClient ? "Manage Bookings" : "My Bookings";
    const description = isClient ? "Review your past and upcoming candidate bookings." : "Review your past and upcoming job assignments.";
    
    // State for rebooking dialog
    const [rebookDialogOpen, setRebookDialogOpen] = useState(false);
    const [rebookDates, setRebookDates] = useState<Date[] | undefined>([]);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    const { toast } = useToast();

    const handleCancelBooking = (bookingId: string) => {
        // In a real app, you'd make an API call here to actually cancel the booking.
        // For now, we'll just show a confirmation toast.
        toast({
            title: "Booking Cancelled",
            description: `The booking (ID: ${bookingId}) has been successfully cancelled.`,
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
                                        <Badge variant={booking.status === 'Completed' ? 'outline' : booking.status === 'Confirmed' ? 'default' : 'secondary'}>{booking.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isClient && booking.status === 'Completed' && (
                                            <Button size="sm" onClick={() => handleRebookClick(booking)}>Rebook</Button>
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
                                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
                  <DialogTitle>Rebook {selectedBooking?.candidateName}</DialogTitle>
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
        </div>
    );
}
