
'use client';

import { useRole } from "@/context/role-context";
import { mockClientBookings, mockCandidateBookings } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BookingsPage() {
    const { role } = useRole();
    const isClient = role === 'client';
    const bookings = isClient ? mockClientBookings : mockCandidateBookings;
    const title = isClient ? "Manage Bookings" : "My Bookings";
    const description = isClient ? "Review your past and upcoming candidate bookings." : "Review your past and upcoming job assignments.";

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
                                {isClient && <TableHead className="text-right">Action</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">
                                        <div>{isClient ? booking.candidateName : booking.candidateRole}</div>
                                        {isClient && <div className="text-sm text-muted-foreground">{booking.candidateRole}</div>}
                                    </TableCell>
                                    <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={booking.status === 'Completed' ? 'outline' : 'default'}>{booking.status}</Badge>
                                    </TableCell>
                                    {isClient && (
                                        <TableCell className="text-right">
                                            {booking.status === 'Completed' && <Button size="sm">Rebook</Button>}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
