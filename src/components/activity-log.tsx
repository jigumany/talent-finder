
'use client';
import { useState, useEffect } from 'react';
import type { AuditLog } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { FilePlus2, Pencil, CheckCircle, PauseCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

const actionIcons: Record<string, React.ElementType> = {
  'Job Created': FilePlus2,
  'Job Edited': Pencil,
  'Status Changed': CheckCircle,
};

const getIconForAction = (action: string) => {
  if (action.includes('Paused')) return PauseCircle;
  if (action.includes('Closed')) return XCircle;
  if (action.includes('Active')) return CheckCircle;
  return actionIcons[action] || CheckCircle;
};

interface ActivityLogProps {
  logs: AuditLog[];
}

function LogItem({ log, isLast }: { log: AuditLog, isLast: boolean }) {
  const [timeAgo, setTimeAgo] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTimeAgo(formatDistanceToNow(new Date(log.date), { addSuffix: true }));
  }, [log.date]);

  const Icon = getIconForAction(log.action);

  return (
    <div className="flex gap-4 relative">
      <div className="flex flex-col items-center">
        <div className={cn("rounded-full bg-muted border p-2", 
          log.action.includes('Changed') && 'bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800',
          log.action.includes('Created') && 'bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800',
          log.action.includes('Edited') && 'bg-amber-100 dark:bg-amber-900/50 border-amber-200 dark:border-amber-800',
        )}>
          <Icon className={cn("h-5 w-5", 
             log.action.includes('Changed') && 'text-blue-600 dark:text-blue-400',
             log.action.includes('Created') && 'text-green-600 dark:text-green-400',
             log.action.includes('Edited') && 'text-amber-600 dark:text-amber-400',
             !log.action.includes('Changed') && !log.action.includes('Created') && !log.action.includes('Edited') && 'text-muted-foreground'
          )} />
        </div>
        {!isLast && <div className="w-px h-full bg-border grow" />}
      </div>
      <div className="flex-1 pb-6">
        <div className="flex justify-between items-center">
           <p className="font-semibold">{log.action}</p>
           <p className="text-xs text-muted-foreground" title={format(new Date(log.date), "PPP p")}>
              {isClient ? timeAgo : ''}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">by {log.user}</p>
        {log.details && (
          <Card className="mt-2 text-sm bg-muted/50">
              <CardContent className="p-3">
                   <p className="text-muted-foreground italic">"{log.details}"</p>
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


export function ActivityLog({ logs }: ActivityLogProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8">
        <p>No activity recorded for this job yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 p-2">
      {logs.map((log, index) => {
        const isLast = index === logs.length - 1;
        return <LogItem key={log.id} log={log} isLast={isLast} />;
      })}
    </div>
  );
}
