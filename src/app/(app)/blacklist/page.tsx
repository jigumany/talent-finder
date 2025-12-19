
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRole } from '@/context/role-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Combobox } from '@/components/ui/combobox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Lock, Ban, PlusCircle, UserX, Loader2 } from 'lucide-react';
import { fetchCandidates } from '@/lib/data-service';
import type { Candidate } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface BlacklistedCandidate {
    id: string;
    candidate: Candidate;
    reason: string;
    date: string;
}

export default function BlacklistPage() {
    const { role } = useRole();
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(role === 'client');
    const [blacklist, setBlacklist] = useState<BlacklistedCandidate[]>([]);
    const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const candidates = await fetchCandidates();
            setAllCandidates(candidates);

            // Create a mock blacklist from the first two candidates for demonstration
            if (candidates.length >= 2) {
                setBlacklist([
                    {
                        id: 'bl-1',
                        candidate: candidates[6],
                        reason: 'Repeatedly late for assignments without prior notice. Disrupted class schedules.',
                        date: '2024-06-15T10:00:00Z',
                    },
                    {
                        id: 'bl-2',
                        candidate: candidates[7],
                        reason: 'Did not follow school policies regarding student interaction. A formal complaint was filed.',
                        date: '2024-05-20T14:30:00Z',
                    },
                ]);
            }
            setIsLoading(false);
        }
        loadData();
    }, []);

    const handleAddToBlacklist = () => {
        if (!selectedCandidateId || !reason) {
            toast({
                title: 'Error',
                description: 'Please select a candidate and provide a reason.',
                variant: 'destructive',
            });
            return;
        }

        const candidate = allCandidates.find(c => c.id === selectedCandidateId);
        if (candidate) {
            if(blacklist.some(item => item.candidate.id === selectedCandidateId)) {
                toast({
                    title: 'Already Blacklisted',
                    description: `${candidate.name} is already on the blacklist.`,
                    variant: 'destructive',
                });
                return;
            }
            
            const newEntry: BlacklistedCandidate = {
                id: `bl-${Date.now()}`,
                candidate,
                reason,
                date: new Date().toISOString(),
            };
            setBlacklist(prev => [newEntry, ...prev]);
            toast({
                title: 'Candidate Blacklisted',
                description: `${candidate.name} has been added to your blacklist.`,
            });
            setIsDialogOpen(false);
            setSelectedCandidateId('');
            setReason('');
        }
    };
    
    const handleRemoveFromBlacklist = (id: string) => {
        const entry = blacklist.find(item => item.id === id);
        if (entry) {
            setBlacklist(prev => prev.filter(item => item.id !== id));
            toast({
                title: 'Candidate Removed',
                description: `${entry.candidate.name} has been removed from the blacklist.`,
                variant: 'destructive'
            });
        }
    };

    if (!isClient) {
        return (
            <div className="flex items-center justify-center h-full">
                <Alert className="max-w-md">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>This feature is available for clients only.</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const availableCandidates = allCandidates.filter(c => !blacklist.some(bl => bl.candidate.id === c.id));
    
    const candidateOptions = useMemo(() => {
        return availableCandidates.map(c => ({
            value: c.id,
            label: `${c.name} - ${c.role}`
        }));
    }, [availableCandidates]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <Ban className="h-6 w-6 text-destructive" />
                    <span>Candidate Blacklist</span>
                </h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add to Blacklist
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Add Candidate to Blacklist</DialogTitle>
                            <DialogDescription>
                                Select a candidate and provide a reason for blacklisting. This will prevent them from appearing in your searches.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="candidate-select">Candidate</Label>
                                <Combobox
                                    options={candidateOptions}
                                    value={selectedCandidateId}
                                    onValueChange={setSelectedCandidateId}
                                    placeholder="Select a candidate..."
                                    emptyMessage="No candidate found."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason for Blacklisting</Label>
                                <Textarea 
                                    id="reason"
                                    placeholder="Provide a clear and concise reason..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button type="button" variant="destructive" onClick={handleAddToBlacklist} disabled={!selectedCandidateId || !reason}>
                                Confirm Blacklist
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Blacklisted Candidates</CardTitle>
                    <CardDescription>
                        This is a list of candidates you have chosen not to work with. They will not appear in marketplace searches.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {blacklist.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Date Added</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {blacklist.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                             <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border">
                                                    <AvatarImage src={item.candidate.imageUrl} alt={item.candidate.name} />
                                                    <AvatarFallback>{item.candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{item.candidate.name}</p>
                                                    <p className="text-sm text-muted-foreground">{item.candidate.role}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{format(new Date(item.date), "PPP")}</TableCell>
                                        <TableCell className="max-w-xs">
                                            <p className="line-clamp-3">{item.reason}</p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleRemoveFromBlacklist(item.id)}>
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center text-muted-foreground py-12">
                            <UserX className="h-12 w-12 mx-auto text-muted-foreground/50" />
                            <p className="mt-4 font-semibold">Your blacklist is empty.</p>
                            <p className="text-sm">You have not blacklisted any candidates.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
