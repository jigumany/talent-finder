
'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRole } from "@/context/role-context";
import { mockClientBookings, mockCandidates, mockCandidateBookings } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon, ClipboardEdit, Users, CheckCircle, XCircle, Star, PenSquare, PlusCircle, PoundSterling, Briefcase, MapPin } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Booking, Candidate } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";


function BookingsTable({ bookings, onCancelBooking, onRebookClick, onLogOutcomeClick, isClient, onLeaveReviewClick, reviewedBookingIds }: { bookings: Booking[], onCancelBooking: (id: string) => void, onRebookClick: (booking: Booking) => void, onLogOutcomeClick: (booking: Booking) => void, isClient: boolean, onLeaveReviewClick: (booking: Booking) => void, reviewedBookingIds: Set<string> }) {
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
                                variant={
                                    booking.status === 'Hired' || booking.status === 'Completed' ? 'default' :
                                    booking.status === 'Rejected' ? 'destructive' :
                                    'secondary'
                                }
                                className={cn({
                                    'bg-sky-500 text-sky-50': booking.status === 'Confirmed',
                                    'bg-green-600 text-white': booking.status === 'Completed' || booking.status === 'Hired',
                                    'bg-destructive text-destructive-foreground': booking.status === 'Rejected',
                                    'bg-purple-600 text-purple-50': booking.status === 'Interview'
                                })}
                            >
                                {booking.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                             {isClient && booking.status === 'Completed' && !reviewedBookingIds.has(booking.id) && (
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="warning" onClick={() => onLeaveReviewClick(booking)}>
                                        <PenSquare className="mr-2 h-4 w-4" />
                                        Leave Review
                                    </Button>
                                </DialogTrigger>
                            )}
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
                                 <DialogTrigger asChild>
                                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => onLogOutcomeClick(booking)}>
                                        <ClipboardEdit className="mr-2 h-4 w-4" />
                                        Log Outcome
                                    </Button>
                                 </DialogTrigger>
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

    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [bookings]);

    const applicantBookings = useMemo(() => sortedBookings.filter(b => ['Interview', 'Hired', 'Rejected'].includes(b.status)), [sortedBookings]);
    const upcomingBookings = useMemo(() => sortedBookings.filter(b => b.status === 'Confirmed'), [sortedBookings]);
    const completedBookings = useMemo(() => sortedBookings.filter(b => b.status === 'Completed'), [sortedBookings]);
    
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const { toast } = useToast();

    // State for rebooking dialog
    const [rebookDialogOpen, setRebookDialogOpen] = useState(false);
    const [rebookDates, setRebookDates] = useState<Date[] | undefined>([]);
    
    // State for new booking dialog
    const [addBookingDialogOpen, setAddBookingDialogOpen] = useState(false);
    const [newBookingCandidateId, setNewBookingCandidateId] = useState<string>('');
    const [newBookingDates, setNewBookingDates] = useState<Date[] | undefined>([]);
    const [newBookingRole, setNewBookingRole] = useState('');
    const [newBookingLocation, setNewBookingLocation] = useState('');


    // State for interview outcome dialog
    const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);
    const [outcome, setOutcome] = useState<'hired' | 'rejected' | ''>('');
    const [outcomeNotes, setOutcomeNotes] = useState('');
    
    // State for review dialog
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewHoverRating, setReviewHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set<string>());



    const handleCancelBooking = (bookingId: string) => {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        toast({
            title: "Booking Cancelled",
            description: `The booking has been successfully cancelled.`,
            variant: "destructive"
        });
    };
    
    const handleAddNewBooking = () => {
        if (!newBookingCandidateId || !newBookingDates || newBookingDates.length === 0 || !newBookingRole) {
            toast({
                title: "Incomplete Information",
                description: "Please select a candidate, role, and at least one date.",
                variant: "destructive",
            });
            return;
        }

        const candidate = mockCandidates.find(c => c.id === newBookingCandidateId);
        if (!candidate) return;

        const newBookings: Booking[] = newBookingDates.map(date => ({
            id: `b-${Date.now()}-${Math.random()}`,
            candidateName: candidate.name,
            candidateRole: newBookingRole,
            date: date.toISOString(),
            status: 'Confirmed'
        }));
        
        setBookings(prev => [...newBookings, ...prev]);

        toast({
            title: "Booking Confirmed!",
            description: `${candidate.name} has been booked for ${newBookingDates.map(d => format(d, 'PPP')).join(', ')}.`,
        });

        setAddBookingDialogOpen(false);
        setNewBookingCandidateId('');
        setNewBookingDates([]);
        setNewBookingRole('');
        setNewBookingLocation('');
    };

    const handleRebookClick = (booking: any) => {
        setSelectedBooking(booking);
        setRebookDates([]);
        setRebookDialogOpen(true);
    }

    const handleConfirmRebook = () => {
        if (!selectedBooking || !rebookDates || rebookDates.length === 0) return;
        
        const newBookings: Booking[] = rebookDates.map(date => ({
            id: `b-rebook-${Date.now()}-${Math.random()}`,
            candidateName: selectedBooking.candidateName,
            candidateRole: selectedBooking.candidateRole,
            date: date.toISOString(),
            status: 'Confirmed'
        }));

        setBookings(prev => [...newBookings, ...prev]);
        
        const bookedDates = rebookDates.map(date => format(date, "PPP")).join(', ');
        toast({
            title: "Booking Confirmed!",
            description: `${selectedBooking.candidateName} has been rebooked for ${bookedDates}.`,
        });
        setRebookDialogOpen(false);
    }
    
    const handleLogOutcomeClick = (booking: any) => {
        setSelectedBooking(booking);
        setOutcome('');
        setOutcomeNotes('');
        setOutcomeDialogOpen(true);
    };
    
    const handleLeaveReviewClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setReviewRating(0);
        setReviewHoverRating(0);
        setReviewText('');
        setReviewDialogOpen(true);
    };
    
    const handleConfirmReview = () => {
        if (!selectedBooking || reviewRating === 0 || !reviewText) {
             toast({
                title: "Incomplete Review",
                description: "Please provide a rating and some feedback.",
                variant: "destructive",
            });
            return;
        }
        
        setReviewedBookingIds(prev => new Set(prev).add(selectedBooking.id));

        setReviewDialogOpen(false);
        toast({
            title: "Review Submitted!",
            description: `Thank you for your feedback on ${selectedBooking.candidateName}.`,
        });
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
        onLeaveReviewClick: handleLeaveReviewClick,
        reviewedBookingIds,
        isClient
    };

    const candidateOptions = useMemo(() => mockCandidates.map(c => ({
        value: c.id,
        label: `${c.name} - ${c.role}`
    })), []);


    return (
        <Dialog>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold font-headline">My Bookings</h1>
                    {isClient && (
                        <Dialog open={addBookingDialogOpen} onOpenChange={setAddBookingDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Booking
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Add a New Booking</DialogTitle>
                                    <DialogDescription>
                                        Select a candidate and the dates you wish to book them for.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="candidate-select">Candidate</Label>
                                        <Combobox
                                            options={candidateOptions}
                                            value={newBookingCandidateId}
                                            onValueChange={setNewBookingCandidateId}
                                            placeholder="Select a candidate..."
                                            emptyMessage="No candidate found."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                         <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input id="role" placeholder="e.g. History Teacher" value={newBookingRole} onChange={(e) => setNewBookingRole(e.target.value)} className="pl-10" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input id="location" placeholder="e.g. London, UK" value={newBookingLocation} onChange={(e) => setNewBookingLocation(e.target.value)} className="pl-10" />
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Booking Dates</Label>
                                        <div className="flex justify-center">
                                            <Calendar
                                                mode="multiple"
                                                selected={newBookingDates}
                                                onSelect={setNewBookingDates}
                                                className="rounded-md border"
                                                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                            />
                                        </div>
                                     </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="destructive">Cancel</Button>
                                    </DialogClose>
                                    <Button type="button" onClick={handleAddNewBooking} disabled={!newBookingCandidateId || !newBookingDates || newBookingDates.length === 0 || !newBookingRole}>
                                        Confirm Booking
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
                
                
                <Card>
                    <Tabs defaultValue="applicants">
                        <CardHeader>
                            <TabsList className="grid w-full grid-cols-3">
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
                


                {/* Rebook Dialog */}
                <Dialog open={rebookDialogOpen} onOpenChange={setRebookDialogOpen}>
                  <DialogContent>
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
                     <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="destructive">
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
                <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log Interview Outcome</DialogTitle>
                      <DialogDescription>
                        Record the result of the interview with {selectedBooking?.candidateName}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 px-4">
                        <RadioGroup value={outcome} onValueChange={(value) => setOutcome(value as any)} className="flex justify-around gap-4">
                            <Label htmlFor="hired" className={cn(
                              "flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-colors duration-200 ease-in-out w-full",
                              "hover:bg-green-50 hover:border-green-400",
                               outcome === 'hired' ? "bg-green-100 border-green-500 text-green-800" : "bg-popover border-muted"
                            )}>
                                 <RadioGroupItem value="hired" id="hired" className="sr-only" />
                                 <CheckCircle className="mb-3 h-6 w-6" />
                                 Hire
                            </Label>

                             <Label htmlFor="rejected" className={cn(
                                "flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-colors duration-200 ease-in-out w-full",
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
                     <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="destructive">
                          Cancel
                        </Button>
                      </DialogClose>
                       <Button type="button" onClick={handleConfirmOutcome} disabled={!outcome}>
                            Submit Outcome
                        </Button>
                    </DialogFooter>
                </DialogContent>

                {/* Leave Review Dialog */}
                 <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Leave a Review</DialogTitle>
                      <DialogDescription>
                        Provide feedback for {selectedBooking?.candidateName}'s performance.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Rating</Label>
                            <div 
                                className="flex items-center gap-1"
                                onMouseLeave={() => setReviewHoverRating(0)}
                            >
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      'h-8 w-8 cursor-pointer transition-colors',
                                      (reviewHoverRating >= star || reviewRating >= star)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-muted-foreground/50'
                                    )}
                                    onClick={() => setReviewRating(star)}
                                    onMouseEnter={() => setReviewHoverRating(star)}
                                  />
                                ))}
                            </div>
                        </div>
                        <div className="grid w-full gap-1.5">
                            <Label htmlFor="review-text">Feedback</Label>
                            <Textarea 
                                id="review-text"
                                placeholder="Share your thoughts on their performance..." 
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={5}
                            />
                        </div>
                    </div>
                     <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="destructive">
                          Cancel
                        </Button>
                      </DialogClose>
                       <Button type="button" variant="warning" onClick={handleConfirmReview} disabled={reviewRating === 0 || !reviewText}>
                            Submit Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </div>
        </Dialog>
    );
}

    

    