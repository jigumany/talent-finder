
'use client';
import { useState, useEffect } from 'react';
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock, FilePlus2, Users, Briefcase, Pencil, ListChecks, CheckSquare, MoreVertical, Trash2, PauseCircle, XCircle, Activity, Info, Star, Calendar, MessageSquare, BriefcaseBusiness, Ban } from "lucide-react";
import { PostJobForm } from "@/components/post-job-form";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { mockJobs, mockApplications, mockAuditLogs, mockCandidates } from '@/lib/mock-data';
import type { Job, AuditLog, Application, Candidate, ApplicationStatus } from '@/lib/types';
import { formatDistanceToNow, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EditJobForm } from '@/components/edit-job-form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityLog } from '@/components/activity-log';
import { JobDetails } from '@/components/job-details';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface ApplicantTableProps {
    applications: { application: Application; candidate: Candidate }[];
    onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
}

function ApplicantTable({ applications, onStatusChange }: ApplicantTableProps) {
    if (applications.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8">
                <p>No applicants for this job yet.</p>
            </div>
        );
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {applications.map(({ application, candidate }) => (
                    <TableRow key={application.id}>
                        <TableCell>
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={candidate.imageUrl} alt={candidate.name} data-ai-hint="professional headshot" />
                                    <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{candidate.name}</p>
                                    <p className="text-sm text-muted-foreground">{candidate.role}</p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">"{candidate.bio}"</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={
                                application.status === 'Interview' || application.status === 'Offer' ? 'default' :
                                application.status === 'Shortlisted' ? 'secondary' : 'outline'
                            } className={cn({
                                'bg-purple-600': application.status === 'Interview',
                                'badge-yellow': application.status === 'Shortlisted',
                                'bg-destructive': application.status === 'Rejected',
                                'bg-green-600': application.status === 'Hired',
                            })}>
                                {application.status}
                            </Badge>
                        </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-1 text-sm text-amber-500">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="font-bold">{candidate.rating.toFixed(1)}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/profile/candidate/${candidate.id}`}>
                                            <Users className="mr-2 h-4 w-4" /> View Profile
                                        </Link>
                                    </DropdownMenuItem>
                                     <DropdownMenuSeparator />
                                     {application.status === 'Applied' && (
                                        <DropdownMenuItem onClick={() => onStatusChange(application.id, 'Shortlisted')}>
                                            <Star className="mr-2 h-4 w-4" /> Shortlist
                                        </DropdownMenuItem>
                                     )}
                                     {(application.status === 'Applied' || application.status === 'Shortlisted') && (
                                        <DropdownMenuItem onClick={() => onStatusChange(application.id, 'Interview')}>
                                            <MessageSquare className="mr-2 h-4 w-4" /> Schedule Interview
                                        </DropdownMenuItem>
                                     )}
                                     {(application.status === 'Interview' || application.status === 'Shortlisted') && (
                                        <DropdownMenuItem onClick={() => onStatusChange(application.id, 'Hired')}>
                                           <BriefcaseBusiness className="mr-2 h-4 w-4" /> Book Now
                                        </DropdownMenuItem>
                                     )}
                                     {application.status !== 'Rejected' && application.status !== 'Hired' && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onStatusChange(application.id, 'Rejected')} className="text-destructive focus:text-destructive">
                                                <Ban className="mr-2 h-4 w-4" /> Not a Match
                                            </DropdownMenuItem>
                                        </>
                                     )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

interface JobCardProps {
    job: Job;
    onManageClick: (job: Job) => void;
    onStatusChange: (jobId: string, status: Job['status']) => void;
    onDelete: (jobId: string) => void;
}

function JobCard({ job, onManageClick, onStatusChange, onDelete }: JobCardProps) {
    const applicantCount = job.applicants ?? 0;
    const shortlistedCount = job.shortlisted ?? 0;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [postedAt, setPostedAt] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setPostedAt(formatDistanceToNow(new Date(job.datePosted), { addSuffix: true }));
    }, [job.datePosted]);

    return (
        <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold font-headline">{job.title}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant={job.status === 'Active' ? 'default' : 'secondary'} className={cn(
                            job.status === 'Active' && 'bg-green-600',
                            job.status === 'Paused' && 'bg-amber-500',
                        )}>
                            {job.status}
                        </Badge>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {job.status !== 'Closed' && (
                                    <>
                                        <DropdownMenuItem onClick={() => onStatusChange(job.id, job.status === 'Paused' ? 'Active' : 'Paused')}>
                                            <PauseCircle className="mr-2 h-4 w-4" />
                                            <span>{job.status === 'Paused' ? 'Resume' : 'Pause'}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onStatusChange(job.id, 'Closed')}>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            <span>Close</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                {job.status === 'Closed' && (
                                    <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <CardDescription>
                    {isClient ? `Posted ${postedAt}` : ''}
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
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the job posting for "{job.title}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(job.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}


export default function PostAJobPage() {
    const { role } = useRole();
    const [jobs, setJobs] = useState<Job[]>(mockJobs);
    const [applications, setApplications] = useState<Application[]>(mockApplications);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
    const [isPostJobDialogOpen, setPostJobDialogOpen] = useState(false);
    const [isManageJobDialogOpen, setManageJobDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isEditingJob, setIsEditingJob] = useState(false);
    const [activeTab, setActiveTab] = useState('applicants');
    const isMobile = useIsMobile();


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

    const addAuditLog = (jobId: string, action: string, details?: string) => {
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            jobId,
            date: new Date().toISOString(),
            action,
            user: 'Jane Doe (Admin)',
            details,
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    const handleJobPosted = (newJob: Job) => {
        setJobs(prevJobs => [newJob, ...prevJobs]);
        addAuditLog(newJob.id, 'Job Created', 'Initial posting.');
        setPostJobDialogOpen(false);
    }

    const handleManageClick = (job: Job) => {
        setSelectedJob(job);
        setIsEditingJob(false);
        setActiveTab('applicants');
        setManageJobDialogOpen(true);
    }
    
    const handleJobUpdated = (updatedJob: Job) => {
        setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
        if (selectedJob) {
            setSelectedJob(updatedJob);
        }
        addAuditLog(updatedJob.id, 'Job Edited', 'Job details were updated.');
        setIsEditingJob(false);
    };
    
    const totalActiveJobs = jobs.filter(j => j.status === 'Active').length;
    const totalApplicants = jobs.reduce((acc, job) => acc + (job.applicants || 0), 0);
    const totalShortlisted = jobs.reduce((acc, job) => acc + (job.shortlisted || 0), 0);

    const handleJobStatusChange = (jobId: string, status: Job['status']) => {
        setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status } : job));
        addAuditLog(jobId, 'Status Changed', `Job status changed to ${status}.`);
        toast({
            title: "Job Status Updated",
            description: `The job has been set to "${status}".`
        });
    };
    
    const handleApplicationStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
        const application = applications.find(app => app.id === applicationId);
        if(!application) return;

        setApplications(prev => prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app));
        
        const candidate = mockCandidates.find(c => c.id === application.candidateId);

        toast({
            title: 'Applicant Status Updated',
            description: `${candidate?.name} has been moved to ${newStatus}.`,
            variant: newStatus === 'Rejected' ? 'destructive' : 'default',
        });
        
        addAuditLog(application.jobId, 'Applicant Status Changed', `${candidate?.name} moved to ${newStatus}`);
    }

    const handleJobDelete = (jobId: string) => {
        setJobs(prev => prev.filter(job => job.id !== jobId));
        toast({
            title: "Job Deleted",
            description: "The job posting has been successfully deleted.",
            variant: 'destructive',
        });
    };
    
    const selectedJobLogs = selectedJob ? auditLogs.filter(log => log.jobId === selectedJob.id) : [];
    
    const jobApplications = selectedJob 
        ? applications
            .filter(app => app.jobId === selectedJob.id)
            .map(application => {
                const candidate = mockCandidates.find(c => c.id === application.candidateId);
                return { application, candidate: candidate! };
            })
            .filter(item => item.candidate)
            .sort((a,b) => {
                const statusOrder: ApplicationStatus[] = ['Offer', 'Hired', 'Interview', 'Shortlisted', 'Applied', 'Rejected'];
                return statusOrder.indexOf(a.application.status) - statusOrder.indexOf(b.application.status);
            })
        : [];


    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span>Booking Management</span>
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
            
             <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalActiveJobs}</div>
                        <p className="text-xs text-muted-foreground">Currently open positions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalApplicants}</div>
                        <p className="text-xs text-muted-foreground">Across all jobs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Shortlisted</CardTitle>
                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalShortlisted}</div>
                        <p className="text-xs text-muted-foreground">Candidates in consideration</p>
                    </CardContent>
                </Card>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map(job => (
                    <JobCard 
                        key={job.id} 
                        job={job} 
                        onManageClick={handleManageClick} 
                        onStatusChange={handleJobStatusChange}
                        onDelete={handleJobDelete}
                    />
                ))}
            </div>

            {selectedJob && (
                 <Dialog open={isManageJobDialogOpen} onOpenChange={setManageJobDialogOpen}>
                    <DialogContent className="max-w-full w-full sm:max-w-6xl sm:h-auto flex flex-col data-[state=open]:sm:h-[90vh]">
                         {isEditingJob ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle>Edit Job Posting</DialogTitle>
                                    <DialogDescription>
                                        Update the details for your job posting: "{selectedJob.title}"
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="p-1 overflow-auto">
                                    <EditJobForm job={selectedJob} onJobUpdated={(updatedJob) => handleJobUpdated(updatedJob)} onCancel={() => setIsEditingJob(false)} />
                                </div>
                            </>
                        ) : (
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                                <DialogHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div className="flex-1">
                                            <DialogTitle className="text-2xl">
                                                {selectedJob.title}
                                            </DialogTitle>
                                            <DialogDescription>
                                                Manage applicants and view job activity.
                                            </DialogDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <TabsList className={cn('grid w-full sm:w-auto sm:inline-flex', { 'hidden': isMobile })}>
                                                <TabsTrigger value="applicants"><Users className="mr-2 h-4 w-4" />Applicants</TabsTrigger>
                                                <TabsTrigger value="details"><Info className="mr-2 h-4 w-4" />Details</TabsTrigger>
                                                <TabsTrigger value="activity"><Activity className="mr-2 h-4 w-4" />Activity</TabsTrigger>
                                            </TabsList>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setIsEditingJob(true)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        <span>Edit Job</span>
                                                    </DropdownMenuItem>
                                                     {isMobile && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuLabel>Views</DropdownMenuLabel>
                                                            <DropdownMenuRadioGroup value={activeTab} onValueChange={setActiveTab}>
                                                                <DropdownMenuRadioItem value="applicants">
                                                                    <Users className="mr-2 h-4 w-4" /> Applicants
                                                                </DropdownMenuRadioItem>
                                                                <DropdownMenuRadioItem value="details">
                                                                    <Info className="mr-2 h-4 w-4" /> Details
                                                                </DropdownMenuRadioItem>
                                                                <DropdownMenuRadioItem value="activity">
                                                                    <Activity className="mr-2 h-4 w-4" /> Activity
                                                                </DropdownMenuRadioItem>
                                                            </DropdownMenuRadioGroup>
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DialogClose asChild>
                                                        <DropdownMenuItem>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            <span>Close</span>
                                                        </DropdownMenuItem>
                                                    </DialogClose>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </DialogHeader>
                                <TabsContent value="applicants" className="flex-1 mt-4 overflow-auto">
                                     <ApplicantTable applications={jobApplications} onStatusChange={handleApplicationStatusChange} />
                                </TabsContent>
                                <TabsContent value="details" className="flex-1 overflow-auto mt-4">
                                  <ScrollArea className="h-full">
                                    <JobDetails job={selectedJob} />
                                  </ScrollArea>
                                </TabsContent>
                                <TabsContent value="activity" className="flex-1 overflow-auto mt-4">
                                  <ScrollArea className="h-full">
                                    <ActivityLog logs={selectedJobLogs} />
                                  </ScrollArea>
                                </TabsContent>
                            </Tabs>
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

    

    