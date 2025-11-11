
'use client';
import Link from 'next/link';
import type { Application, Candidate, ApplicationStatus } from '@/lib/types';
import { mockCandidates } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

const kanbanColumns: { title: string; status: ApplicationStatus, headerColor: string, bodyColor: string }[] = [
  { title: 'Applied', status: 'Applied', headerColor: 'bg-sky-600', bodyColor: 'bg-sky-50' },
  { title: 'Shortlisted', status: 'Shortlisted', headerColor: 'bg-yellow-500', bodyColor: 'bg-yellow-50' },
  { title: 'Interview', status: 'Interview', headerColor: 'bg-purple-600', bodyColor: 'bg-purple-50' },
  { title: 'Offer', status: 'Offer', headerColor: 'bg-lime-600', bodyColor: 'bg-lime-50' },
];

interface KanbanCardProps {
  application: Application;
  candidate: Candidate;
}

function KanbanCard({ application, candidate }: KanbanCardProps) {
  return (
    <Card className="mb-3 bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={candidate.imageUrl} alt={candidate.name} data-ai-hint="professional headshot" />
            <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold leading-tight">{candidate.name}</p>
            <p className="text-sm text-muted-foreground leading-tight">{candidate.role}</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold">{candidate.rating.toFixed(1)}</span>
                <span className="text-muted-foreground/80">({candidate.reviews} reviews)</span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center">
             <p className="text-xs text-muted-foreground">
                Applied {formatDistanceToNow(new Date(application.dateApplied), { addSuffix: true })}
            </p>
            <Button variant="outline" size="sm" asChild>
                <Link href={`/profile/candidate/${candidate.id}`}>
                    <User className="mr-2 h-3 w-3" />
                    Profile
                </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface KanbanBoardProps {
  applications: Application[];
}

export function KanbanBoard({ applications }: KanbanBoardProps) {

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return applications
      .filter(app => app.status === status)
      .map(app => {
        const candidate = mockCandidates.find(c => c.id === app.candidateId);
        return candidate ? { application: app, candidate } : null;
      })
      .filter(Boolean) as { application: Application; candidate: Candidate }[];
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-6 pb-4 px-6 sm:px-0">
            {kanbanColumns.map(column => {
                const columnApps = getApplicationsByStatus(column.status);
                return (
                <div key={column.status} className="w-[280px] flex-shrink-0 inline-block align-top">
                    <div className={cn("flex flex-col rounded-lg border overflow-hidden h-full", column.bodyColor)}>
                        <div className={cn("p-3", column.headerColor)}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-semibold text-white">{column.title}</h3>
                                <span className="text-sm font-normal text-white bg-black/20 rounded-full px-2 py-0.5">
                                    {columnApps.length}
                                </span>
                            </div>
                        </div>
                        <ScrollArea className="flex-1 h-full">
                            <div className="p-2">
                                {columnApps.length > 0 ? (
                                columnApps.map(item => (
                                    <KanbanCard key={item.application.id} application={item.application} candidate={item.candidate} />
                                ))
                                ) : (
                                <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground p-4">
                                    <p>No candidates in this stage.</p>
                                </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
                );
            })}
        </div>
        <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
