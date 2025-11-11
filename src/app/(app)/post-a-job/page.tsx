
'use client';
import { useState } from 'react';
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, FilePlus2, Users, FileCheck2, Dot } from "lucide-react";
import { PostJobForm } from "@/components/post-job-form";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockJobs } from '@/lib/mock-data';
import type { Job } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function JobCard({ job }: { job: Job }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                     <Badge 
                        variant={job.status === 'Active' ? 'default' : 'secondary'}
                        className={cn(job.status === 'Active' ? 'bg-green-600' : '')}
                    >
                        <Dot className={cn("mr-1 h-4 w-4", job.status === 'Active' ? 'text-white' : 'text-muted-foreground')} />
                        {job.status}
                    </Badge>
                </div>
                <CardDescription>
                    Posted {formatDistanceToNow(new Date(job.datePosted), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground line-clamp-2">{job.description}</p>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 flex justify-between">
                <div className="flex gap-4">
                    <div className="text-center">
                        <p className="font-bold text-lg">{job.applicants}</p>
                        <p className="text-xs text-muted-foreground">Applicants</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-lg">{job.shortlisted}</p>
                        <p className="text-xs text-muted-foreground">Shortlisted</p>
                    </div>
                </div>
                <Button size="sm">Manage Job</Button>
            </CardFooter>
        </Card>
    );
}


export default function PostAJobPage() {
    const { role } = useRole();
    const [jobs, setJobs] = useState<Job[]>(mockJobs);
    const [isDialogOpen, setDialogOpen] = useState(false);


    if (role !== 'client') {
        return (
            <div className="flex items-center justify-center h-full">
                 <Alert className="max-w-md">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        This feature is available for clients only.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    const handleJobPosted = () => {
        // In a real app, you'd re-fetch jobs here.
        // For now, we'll just close the dialog.
        setDialogOpen(false);
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <FileCheck2 className="h-6 w-6 text-primary" />
                    <span>My Job Postings</span>
                </h1>
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><FilePlus2 className="mr-2" /> Post a New Job</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                         <DialogHeader>
                            <DialogTitle className="text-2xl">Describe Your Ideal Candidate</DialogTitle>
                            <DialogDescription>
                                Fill in your requirements below, and our AI will find the best match for you from our pool of talented candidates.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-1">
                          <PostJobForm onJobPosted={handleJobPosted} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>

             {jobs.length === 0 && (
                <div className="text-center text-muted-foreground col-span-full py-16 border-2 border-dashed rounded-lg">
                    <FileCheck2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-lg font-semibold">No jobs posted yet.</p>
                    <p className="mt-1">Click "Post a New Job" to get started.</p>
                </div>
             )}
        </div>
    );
}
