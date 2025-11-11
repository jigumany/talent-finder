
'use client';
import { useState } from 'react';
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, FilePlus2, Users, Briefcase, Pencil } from "lucide-react";
import { PostJobForm } from "@/components/post-job-form";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockJobs, mockApplications } from '@/lib/mock-data';
import type { Job } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { KanbanBoard } from '@/components/kanban-board';
import { Separator } from '@/components/ui/separator';
import { EditJobForm } from '@/components/edit-job-form';

interface JobCardProps {
    job: Job;
    onManageClick: (job: Job) => void;
}

function JobCard({ job, onManageClick }: JobCardProps) {
    const applicantCount = job.applicants ?? 0;
    const shortlistedCount = job.shortlisted ?? 0;

    return (
        <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold font-headline">{job.title}</CardTitle>
                    <Badge variant={job.status === 'Active' ? 'default' : 'secondary'} className={cn(job.status === 'Active' && 'bg-green-600')}>
                        {job.status}
                    </Badge>
                </div>
                <CardDescription>
                    Posted {formatDistanceToNow(new Date(job.datePosted), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm line-clamp-3">{job.description}</p>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-md">
                    <p className="text-2xl font-bold text-primary">{applicantCount}</p>
                    <p className="text-xs text-muted-foreground">Applicants</p>
                </div>
                <div className="p-2 rounded-md">
                    <p className="text-2xl font-bold text-primary">{shortlistedCount}</p>
                    <p className="text-xs text-muted-foreground">Shortlisted</p>
                </div>
                <div className="flex items-center justify-center">
                    <Button size="sm" onClick={() => onManageClick(job)}>Manage Job</Button>
                </div>
            </CardFooter>
        </Card>
    );
}


export default function PostAJobPage() {
    const { role } = useRole();
    const [jobs, setJobs] = useState<Job[]>(mockJobs);
    const [isPostJobDialogOpen, setPostJobDialogOpen] = useState(false);
    const [isManageJobDialogOpen, setManageJobDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isEditingJob, setIsEditingJob] = useState(false);


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
        // In a real app, you would refetch the jobs list here
    }

    const handleManageClick = (job: Job) => {
        setSelectedJob(job);
        setIsEditingJob(false);
        setManageJobDialogOpen(true);
    }
    
    const jobApplications = selectedJob ? mockApplications.filter(app => app.jobId === selectedJob.id) : [];
    
    const handleJobUpdated = () => {
        setIsEditingJob(false);
        // Here you would typically refetch job data
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span>My Job Postings</span>
                </h1>
                <Dialog open={isPostJobDialogOpen} onOpenChange={setPostJobDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><FilePlus2 className="mr-2" /> Post a New Job</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                         <DialogHeader>
                            <DialogTitle className="text-2xl">Post a New Job</DialogTitle>
                            <DialogDescription>
                                Fill in the details below. Our AI can then help find the best candidates for you.
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
                    <JobCard key={job.id} job={job} onManageClick={handleManageClick} />
                ))}
            </div>

            {selectedJob && (
                <Dialog open={isManageJobDialogOpen} onOpenChange={setManageJobDialogOpen}>
                    <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col">
                        {isEditingJob ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Edit Job Posting</DialogTitle>
                                    <DialogDescription>
                                        Update the details for your job posting: "{selectedJob.title}"
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="p-1 overflow-auto">
                                    <EditJobForm job={selectedJob} onJobUpdated={handleJobUpdated} />
                                </div>
                            </>
                        ) : (
                             <>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl flex items-center gap-3">
                                        <span>{selectedJob.title}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditingJob(true)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </DialogTitle>
                                    <DialogDescription>
                                        {selectedJob.description}
                                    </DialogDescription>
                                </DialogHeader>
                                <Separator />
                                <div className="flex-1 overflow-auto -mx-6 px-6">
                                    <KanbanBoard applications={jobApplications} />
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            )}

             {jobs.length === 0 && (
                 <div className="flex-1 flex items-center justify-center text-center text-muted-foreground col-span-full py-16 border-2 border-dashed rounded-lg">
                    <div>
                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-lg font-semibold">No jobs posted yet</p>
                        <p className="mt-1">Click "Post a New Job" to get started.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
