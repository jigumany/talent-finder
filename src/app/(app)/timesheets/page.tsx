
'use client';
import { useRole } from "@/context/role-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lock, FilePlus2 } from "lucide-react";
import { mockTimesheets } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export default function TimesheetsPage() {
    const { role } = useRole();

    if (role !== 'candidate') {
        return (
            <div className="flex items-center justify-center h-full">
                <Alert className="max-w-md">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        This feature is available for candidates only.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold font-headline">My Timesheets</h1>
                <Button><FilePlus2 className="mr-2 h-4 w-4" />Submit New Timesheet</Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Timesheet History</CardTitle>
                    <CardDescription>
                        Here is a list of your submitted timesheets.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockTimesheets.map((sheet) => (
                                <TableRow key={sheet.id}>
                                    <TableCell className="font-medium">{new Date(sheet.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{sheet.hours}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={sheet.status === 'Approved' ? 'default' : sheet.status === 'Rejected' ? 'destructive' : 'secondary'}
                                        className={sheet.status === 'Approved' ? 'bg-green-600' : ''}>
                                            {sheet.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
