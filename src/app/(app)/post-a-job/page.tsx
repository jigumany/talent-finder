
'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, FilePlus2, Users, FileCheck2, Dot, ChevronDown } from "lucide-react";
import { PostJobForm } from "@/components/post-job-form";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockJobs, mockApplications, mockCandidates } from '@/lib/mock-data';
import type { Job, Application, ApplicationStatus } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EditJobForm } from '@/components/edit-job-form';
import { KanbanBoard } from '@/components/kanban-board';


export default function PostAJobPage() {
    const { role } = useRole();
    const [jobs, setJobs] = useState<Job[]>(mockJobs.filter(j => j.status === 'Active'));
    const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0] || null);
    const [isPostJobDialogOpen, setPostJobDialogOpen] = useState(false);

    const applications = useMemo(() => {
        if (!selectedJob) return [];
        return mockApplications.filter(app => app.jobId === selectedJob.id);
    }, [selectedJob]);


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
        setPostJobDialogOpen(false);
    }
    
    return (
        <div className="max-w-7xl mx-auto flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                 <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                        <FileCheck2 className="h-6 w-6 text-primary" />
                        <span>Hiring Pipeline</span>
                    </h1>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="text-lg font-semibold">
                          {selectedJob?.title || 'Select a Job'}
                          <ChevronDown className="ml-2 h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {jobs.map((job) => (
                           <DropdownMenuItem key={job.id} onSelect={() => setSelectedJob(job)}>
                            {job.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
                <Dialog open={isPostJobDialogOpen} onOpenChange={setPostJobDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><FilePlus2 className="mr-2" /> Post a New Job</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                         <DialogHeader>
                            <DialogTitle className="text-2xl">Post a New Job</DialogTitle>
                            <DialogDescription>
                                Fill in the details below. Our AI will find the best candidates for you.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-1">
                          <PostJobForm onJobPosted={handleJobPosted} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            {selectedJob ? (
                <KanbanBoard applications={applications} />
            ) : (
                 <div className="flex-1 flex items-center justify-center text-center text-muted-foreground col-span-full py-16 border-2 border-dashed rounded-lg">
                    <div>
                        <FileCheck2 className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-semibold">No job selected</p>
                        <p className="mt-1">Select a job from the dropdown or post a new one to see the applicant pipeline.</p>
                    </div>
                </div>
            )}
            
        </div>
    );
}
