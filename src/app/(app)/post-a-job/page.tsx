
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRole } from "@/context/role-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Lock, FilePlus2, Users, Briefcase, Pencil, ListChecks, CheckSquare, MoreVertical, Trash2, PauseCircle, XCircle, Activity, Info, Star, Calendar as CalendarIcon, MessageSquare, BriefcaseBusiness, Ban, PlusCircle, MapPin } from "lucide-react";
import { PostJobForm } from "@/components/post-job-form";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { mockJobs, mockApplications, mockAuditLogs, mockCandidates, mockClientBookings } from '@/lib/mock-data';
import type { Job, AuditLog, Application, Candidate, ApplicationStatus, Booking } from '@/lib/types';
import { formatDistanceToNow, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EditJobForm } from '@/components/edit-job-form';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityLog } from '@/components/activity-log';
import { JobDetails } from '@/components/job-details';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Calendar } from '@/components/ui/calendar';
import { LocationInput } from '@/components/location-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


interface ApplicantTableProps {
    applications: { application: Application; candidate: Candidate }[];
    onStatusChange: (applicationId: string, newStatus: ApplicationStatus) => void;
    onBookNowClick: (candidate: Candidate) => void;
    onAddCandidateClick: () => void;
}

function ApplicantTable({ applications, onStatusChange, onBookNowClick, onAddCandidateClick }: ApplicantTableProps) {
    if (applications.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-8">
                <p>No applicants for this job yet.</p>
                 <Button onClick={onAddCandidateClick} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Candidate
                </Button>
            </div>
        );
    }
    return (
        <>
            <div className="text-right mb-4">
                <Button onClick={onAddCandidateClick}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Candidate
                </Button>
            </div>
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
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarImage src={candidate.imageUrl} alt={candidate.name} data-ai-hint="professional headshot" />
                                        <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{candidate.name}</p>
                                        <p className="text-sm text-muted-foreground">{candidate.role}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={cn({
                                    'bg-purple-600 text-purple-50 hover:bg-purple-600/90': application.status === 'Interview',
                                    'bg-yellow-500 text-yellow-50 hover:bg-yellow-500/90': application.status === 'Shortlisted',
                                    'bg-red-600 text-red-50 hover:bg-red-600/90': application.status === 'Rejected',
                                    'bg-green-600 text-green-50 hover:bg-green-600/90': application.status === 'Hired',
                                    'bg-sky-500 text-sky-50 hover:bg-sky-500/90': application.status === 'Offer',
                                    'bg-gray-200 text-gray-800 hover:bg-gray-200/90': application.status === 'Applied'
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
                            <TableCell className="text-right space-x-2">
                                <Button variant="warning" size="sm" asChild>
                                    <Link href={`/profile/candidate/${candidate.id}`}>
                                        View Profile
                                    </Link>
                                </Button>
                                {application.status === 'Applied' && (
                                    <Button size="sm" onClick={() => onStatusChange(application.id, 'Shortlisted')} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                        <Star className="mr-2 h-4 w-4" /> Shortlist
                                    </Button>
                                )}
                                {(application.status === 'Applied' || application.status === 'Shortlisted') && (
                                    <Button size="sm" onClick={() => onStatusChange(application.id, 'Interview')} className="bg-purple-600 hover:bg-purple-700 text-white">
                                        <MessageSquare className="mr-2 h-4 w-4" /> Interview
                                    </Button>
                                )}
                                {(application.status === 'Interview' || application.status === 'Shortlisted' || application.status === 'Offer') && (
                                    <Button size="sm" onClick={() => onBookNowClick(candidate)} className="bg-green-600 hover:bg-green-700 text-white">
                                    <BriefcaseBusiness className="mr-2 h-4 w-4" /> Book Now
                                    </Button>
                                )}
                                {application.status !== 'Rejected' && application.status !== 'Hired' && (
                                    <Button variant="destructive" size="sm" onClick={() => onStatusChange(application.id, 'Rejected')}>
                                        <Ban className="mr-2 h-4 w-4" /> Not a Match
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

interface JobCardProps {
    job: Job;
    onManageClick: (job: Job) => void;
}

function JobCard({ job, onManageClick }: JobCardProps) {
    const applicantCount = job.applicants ?? 0;
    const shortlistedCount = job.shortlisted ?? 0;
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
                    <Button size="sm" onClick={() => onManageClick(job)}>Manage Booking</Button>
                </div>
            </CardFooter>
        </Card>
    );
}


export default function PostAJobPage() {
    const { role } = useRole();
    const [jobs, setJobs] = useState<Job[]>(mockJobs);
    const [bookings, setBookings] = useState<Booking[]>(mockClientBookings);
    const [applications, setApplications] = useState<Application[]>(mockApplications);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
    const [isPostJobDialogOpen, setPostJobDialogOpen] = useState(false);
    const [isManageJobDialogOpen, setManageJobDialogOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isEditingJob, setIsEditingJob] = useState(false);
    const [activeTab, setActiveTab] = useState('applicants');
    const isMobile = useIsMobile();

    // State for booking from job page
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [candidateToBook, setCandidateToBook] = useState<Candidate | null>(null);
    const [bookingDates, setBookingDates] = useState<Date[] | undefined>([]);
    const [bookingLocation, setBookingLocation] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const JOBS_PER_PAGE = 6;

     const jobsWithCounts = useMemo(() => {
        return jobs.map(job => {
            const jobApplications = applications.filter(app => app.jobId === job.id);
            const applicantCount = jobApplications.length;
            const shortlistedCount = jobApplications.filter(app => ['Shortlisted', 'Interview', 'Offer', 'Hired'].includes(app.status)).length;
            return { ...job, applicants: applicantCount, shortlisted: shortlistedCount };
        });
    }, [jobs, applications]);

    const totalPages = useMemo(() => Math.ceil(jobsWithCounts.length / JOBS_PER_PAGE), [jobsWithCounts.length]);

    const paginatedJobs = useMemo(() => {
        const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
        const endIndex = startIndex + JOBS_PER_PAGE;
        return jobsWithCounts.slice(startIndex, endIndex);
    }, [jobsWithCounts, currentPage]);
    
    const { totalActiveJobs, totalApplicants, totalShortlisted } = useMemo(() => {
        const activeJobs = jobsWithCounts.filter(j => j.status === 'Active');
        const applicants = jobsWithCounts.reduce((acc, job) => acc + (job.applicants || 0), 0);
        const shortlisted = jobsWithCounts.reduce((acc, job) => acc + (job.shortlisted || 0), 0);
        return {
            totalActiveJobs: activeJobs.length,
            totalApplicants: applicants,
            totalShortlisted: shortlisted,
        };
    }, [jobsWithCounts]);

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
    
    const getChanges = (original: Job, updated: Job): string => {
        const changes: string[] = [];
        const originalJob = {
            ...original,
            title: original.title,
            description: original.description,
            subject: original.subject || '',
            location: original.location || '',
            notes: original.notes || '',
            startDate: original.startDate ? format(new Date(original.startDate), 'PPP') : '',
            endDate: original.endDate ? format(new Date(original.endDate), 'PPP') : ''
        };

        const updatedJob = {
            ...updated,
            startDate: updated.startDate ? format(new Date(updated.startDate), 'PPP') : '',
            endDate: updated.endDate ? format(new Date(updated.endDate), 'PPP') : ''
        };
        
        const keyMap: Record<keyof Job, string> = {
            title: "Title",
            description: "Description",
            subject: "Subject",
            location: "Location",
            notes: "Notes",
            startDate: "Start Date",
            endDate: "End Date"
        };


        (Object.keys(keyMap) as Array<keyof Job>).forEach(key => {
            const originalValue = originalJob[key] || '';
            const updatedValue = updatedJob[key] || '';
            if (originalValue !== updatedValue) {
                changes.push(
                    `${keyMap[key]} changed from "${originalValue || 'empty'}" to "${updatedValue || 'empty'}".`
                );
            }
        });

        return changes.join(' ');
    };

    const handleJobUpdated = (updatedJob: Job) => {
        if (selectedJob) {
            const changeDetails = getChanges(selectedJob, updatedJob);
            if (changeDetails) {
                 addAuditLog(updatedJob.id, 'Job Edited', changeDetails);
            }
        }
        
        setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
        if (selectedJob) {
            setSelectedJob(updatedJob);
        }
        setIsEditingJob(false);
    };

    const handleJobStatusChange = (jobId: string, status: Job['status']) => {
        setJobs(prev => prev.map(job => job.id === jobId ? { ...job, status } : job));
        if (selectedJob?.id === jobId) {
            setSelectedJob(prev => prev ? { ...prev, status } : null);
        }
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
        setManageJobDialogOpen(false);
        setSelectedJob(null);
        toast({
            title: "Job Deleted",
            description: "The job posting has been successfully deleted.",
            variant: 'destructive',
        });
    };

    const handleBookNowClick = (candidate: Candidate) => {
        if (!selectedJob) return;
        setCandidateToBook(candidate);
        setBookingLocation(selectedJob.location ?? '');
        setBookingDates([]);
        setIsBookingDialogOpen(true);
    };
    
    const handleAddCandidateClick = () => {
        if (!selectedJob) return;
        setCandidateToBook(null); // Clear any previously selected candidate for booking
        setIsBookingDialogOpen(true); // Open the generic booking dialog
    };


    const handleConfirmBooking = () => {
         if (!selectedJob || !bookingDates || bookingDates.length === 0) {
            toast({
                title: "Incomplete Information",
                description: "Please select at least one date.",
                variant: "destructive",
            });
            return;
        }

        let candidateToAdd = candidateToBook;
        // If booking from "Add Candidate" flow, the candidate is in the select input
        if (!candidateToBook) {
            const selectedId = (document.getElementById('add-candidate-select') as HTMLSelectElement)?.value;
             if (!selectedId) {
                toast({ title: "Candidate not selected", description: "Please select a candidate to add.", variant: "destructive" });
                return;
            }
            candidateToAdd = mockCandidates.find(c => c.id === selectedId) || null;
        }
        
        if (!candidateToAdd) {
             toast({ title: "Error", description: "Could not find selected candidate.", variant: "destructive" });
             return;
        }


        const newBookings: Booking[] = bookingDates.map(date => ({
            id: `b-${Date.now()}-${Math.random()}`,
            candidateName: candidateToAdd!.name,
            candidateRole: selectedJob.title,
            date: date.toISOString(),
            status: 'Confirmed'
        }));
        
        setBookings(prev => [...newBookings, ...prev]);

        // Check if an application already exists. If not, create one.
        let application = applications.find(app => app.candidateId === candidateToAdd!.id && app.jobId === selectedJob.id);
        
        if (application) {
             handleApplicationStatusChange(application.id, 'Hired');
        } else {
            const newApplication: Application = {
                id: `app-${Date.now()}`,
                jobId: selectedJob.id,
                candidateId: candidateToAdd!.id,
                status: 'Hired',
                dateApplied: new Date().toISOString(),
            };
            setApplications(prev => [...prev, newApplication]);
            addAuditLog(selectedJob.id, 'Applicant Added', `${candidateToAdd!.name} was added and booked.`);
        }


        toast({
            title: "Booking Confirmed!",
            description: `${candidateToAdd!.name} has been booked for ${bookingDates.map(d => format(d, 'PPP')).join(', ')}.`,
        });

        setIsBookingDialogOpen(false);
        setCandidateToBook(null);
    };
    
    const selectedJobLogs = useMemo(() => selectedJob ? auditLogs.filter(log => log.jobId === selectedJob.id) : [], [selectedJob, auditLogs]);
    
    const jobApplications = useMemo(() => selectedJob 
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
        : [], [selectedJob, applications]);


    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    <span>Booking Management</span>
                </h1>
                <div className="flex gap-2">
                    <Dialog open={isPostJobDialogOpen} onOpenChange={setPostJobDialogOpen}>
                        <DialogTrigger asChild>
                             <Button><FilePlus2 className="mr-2" /> Add a Booking</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                             <DialogHeader>
                                <DialogTitle className="text-2xl">Add your Booking</DialogTitle>
                                <DialogDescription>
                                    Fill in the details below. Our AI can then help find the best candidates for you.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-1 pt-8">
                              <PostJobForm onJobPosted={handleJobPosted} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
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
                {paginatedJobs.map(job => (
                    <JobCard 
                        key={job.id} 
                        job={job} 
                        onManageClick={handleManageClick} 
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                href="#" 
                                onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                            />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink 
                                    href="#" 
                                    isActive={currentPage === i + 1}
                                    onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext 
                                href="#"
                                onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

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
                                <div className="p-1 overflow-auto pt-8">
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
                                            <TabsList>
                                                <TabsTrigger value="applicants"><Users className="mr-2 h-4 w-4" />Applicants</TabsTrigger>
                                                <TabsTrigger value="details"><Info className="mr-2 h-4 w-4" />Details</TabsTrigger>
                                                <TabsTrigger value="activity"><Activity className="mr-2 h-4 w-4" />Activity</TabsTrigger>
                                            </TabsList>
                                             <DialogClose asChild>
                                                <Button variant="ghost" size="icon" className="ml-auto">
                                                    <XCircle className="h-6 w-6" />
                                                </Button>
                                            </DialogClose>
                                        </div>
                                    </div>
                                </DialogHeader>
                                <TabsContent value="applicants" className="flex-1 mt-4 overflow-auto">
                                     <ApplicantTable applications={jobApplications} onStatusChange={handleApplicationStatusChange} onBookNowClick={handleBookNowClick} onAddCandidateClick={handleAddCandidateClick} />
                                </TabsContent>
                                <TabsContent value="details" className="flex-1 overflow-auto mt-4">
                                  <ScrollArea className="h-full">
                                    <JobDetails 
                                        job={selectedJob} 
                                        onEditClick={() => setIsEditingJob(true)}
                                        onStatusChange={handleJobStatusChange}
                                        onDelete={handleJobDelete}
                                    />
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

             {selectedJob && (
                <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{candidateToBook ? `Book ${candidateToBook.name}` : 'Add a Candidate to this Job'}</DialogTitle>
                            <DialogDescription>
                                {candidateToBook ? `Schedule ${candidateToBook.name} for the role of ${selectedJob.title}.` : 'Select a candidate and the dates to book them.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 pt-8">
                             {!candidateToBook && (
                                <div className="space-y-2">
                                    <Label htmlFor="add-candidate-select">Candidate</Label>
                                    <Select>
                                        <SelectTrigger id="add-candidate-select">
                                            <SelectValue placeholder="Select a candidate..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockCandidates.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                             <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                 <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="role" value={selectedJob.title} readOnly className="pl-10 bg-muted" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <LocationInput
                                    value={bookingLocation}
                                    onChange={(address) => setBookingLocation(address)}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label>Booking Dates</Label>
                                <div className="flex justify-center">
                                    <Calendar
                                        mode="multiple"
                                        selected={bookingDates}
                                        onSelect={setBookingDates}
                                        className="rounded-md border"
                                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                    />
                                </div>
                             </div>
                        </div>
                        <DialogFooter className="sm:justify-end gap-2 pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="destructive" onClick={() => setCandidateToBook(null)}>Cancel</Button>
                            </DialogClose>
                            <Button type="button" variant="warning" onClick={handleConfirmBooking} disabled={!bookingDates || bookingDates.length === 0}>
                                Confirm Booking
                            </Button>
                        </DialogFooter>
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
