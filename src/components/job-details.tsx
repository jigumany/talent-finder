
'use client';
import type { Job } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Separator } from './ui/separator';
import { format } from 'date-fns';
import { CalendarIcon, PoundSterling, MapPin, ListChecks, Pencil, Book, PauseCircle, XCircle, Trash2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


interface JobDetailsProps {
    job: Job;
    onEditClick: () => void;
    onStatusChange: (jobId: string, status: Job['status']) => void;
    onDelete: (jobId: string) => void;
}

function DetailItem({ icon: Icon, label, value, isDescription = false }: { icon: React.ElementType, label: string, value?: string | number | null, isDescription?: boolean }) {
    if (!value && !isDescription) return null;
    return (
        <div className="flex items-start gap-4">
            <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className={isDescription ? "text-foreground whitespace-pre-wrap" : "text-foreground font-semibold"}>
                    {value || 'Not specified'}
                </p>
            </div>
        </div>
    );
}

export function JobDetails({ job, onEditClick, onStatusChange, onDelete }: JobDetailsProps) {

    const chargeRate = job.payRate ? (job.payRate * 1.40).toFixed(2) : 'N/A';

    return (
        <div className="py-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
             <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>
                            Posted on {format(new Date(job.datePosted), 'do MMMM, yyyy')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-4">
                            <DetailItem icon={ListChecks} label="Job Description & Skills" value={job.description} isDescription />
                            <Separator />
                            <DetailItem icon={Pencil} label="Additional Notes" value={job.notes || 'No additional notes provided.'} isDescription />
                        </div>
                    </CardContent>
                </Card>
             </div>
             <div className="space-y-6">
                <Card>
                     <CardHeader>
                        <CardTitle className="text-lg">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DetailItem icon={Book} label="Subject" value={job.subject} />
                        <DetailItem icon={MapPin} label="Location" value={job.location} />
                    </CardContent>
                </Card>
                 <Card>
                     <CardHeader>
                        <CardTitle className="text-lg">Schedule & Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DetailItem icon={CalendarIcon} label="Start Date" value={job.startDate ? format(new Date(job.startDate), 'PPP') : undefined} />
                        <DetailItem icon={CalendarIcon} label="End Date" value={job.endDate ? format(new Date(job.endDate), 'PPP') : undefined} />
                        <Separator />
                        <DetailItem icon={PoundSterling} label="Charge Rate" value={`£${chargeRate}`} />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Button onClick={onEditClick} variant="outline">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Job
                        </Button>
                        
                        {job.status !== 'Closed' && (
                             <Button variant="outline" onClick={() => onStatusChange(job.id, job.status === 'Paused' ? 'Active' : 'Paused')}>
                                {job.status === 'Paused' ? <CheckCircle className="mr-2 h-4 w-4" /> : <PauseCircle className="mr-2 h-4 w-4" />}
                                {job.status === 'Paused' ? 'Resume Job' : 'Pause Job'}
                            </Button>
                        )}
                        
                        {job.status !== 'Closed' && (
                             <Button variant="outline" onClick={() => onStatusChange(job.id, 'Closed')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Close Job
                            </Button>
                        )}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Job
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the job posting for "{job.title}".
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => onDelete(job.id)}>
                                        Yes, delete job
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                    </CardContent>
                </Card>
             </div>
        </div>
    );
}
