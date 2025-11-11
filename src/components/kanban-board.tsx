
'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import type { Application, Candidate, ApplicationStatus } from '@/lib/types';
import { mockCandidates } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const kanbanColumns: { title: string; status: ApplicationStatus, color: string }[] = [
  { title: 'Applied', status: 'Applied', color: 'bg-sky-100/70 border-sky-200' },
  { title: 'Shortlisted', status: 'Shortlisted', color: 'bg-amber-100/60 border-amber-200' },
  { title: 'Interview', status: 'Interview', color: 'bg-purple-100/60 border-purple-200' },
  { title: 'Offer', status: 'Offer', color: 'bg-green-100/60 border-green-200' },
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
            <AvatarImage src={candidate.imageUrl} alt={candidate.name} />
            <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold leading-tight">{candidate.name}</p>
            <p className="text-sm text-muted-foreground leading-tight">{candidate.role}</p>
            <p className="text-xs text-muted-foreground mt-1">
                Applied {formatDistanceToNow(new Date(application.dateApplied), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
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
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {kanbanColumns.map(column => {
        const columnApps = getApplicationsByStatus(column.status);
        return (
          <div key={column.status} className="flex flex-col h-full">
            <div className={cn("flex-1 flex flex-col rounded-lg border", column.color)}>
              <CardHeader className="p-3 border-b-2 border-inherit">
                <CardTitle className="text-base font-semibold flex justify-between items-center">
                  <span className="text-foreground/80">{column.title}</span>
                  <span className="text-sm font-normal text-muted-foreground bg-background/50 rounded-full px-2 py-0.5">
                    {columnApps.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex-1">
                {columnApps.length > 0 ? (
                  columnApps.map(item => (
                    <KanbanCard key={item.application.id} application={item.application} candidate={item.candidate} />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground p-4">
                    <p>No candidates in this stage.</p>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        );
      })}
    </div>
  );
}
