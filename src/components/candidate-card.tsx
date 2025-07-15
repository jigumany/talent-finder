
import Image from 'next/image';
import { Star, MapPin, FileDown, BookUser } from 'lucide-react';
import type { Candidate } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-start gap-4 p-4 bg-card">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          <AvatarImage src={candidate.imageUrl} alt={candidate.name} data-ai-hint="teacher portrait" />
          <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-xl font-headline">{candidate.name}</CardTitle>
          <p className="text-muted-foreground">{candidate.role}</p>
          <div className="flex items-center gap-1 mt-1 text-sm text-amber-500">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-bold">{candidate.rating.toFixed(1)}</span>
            <span className="text-muted-foreground/80">({candidate.reviews} reviews)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{candidate.location}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {candidate.qualifications.map(q => (
                    <Badge key={q} variant="secondary">{q}</Badge>
                ))}
            </div>
            <p className="text-lg font-semibold text-primary">
                ${candidate.rate}<span className="text-sm font-normal text-muted-foreground">/{candidate.rateType}</span>
            </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/50 grid grid-cols-2 gap-2">
        <Button variant="outline"><FileDown />CV</Button>
        <Button className="bg-accent hover:bg-accent/90"><BookUser />Book Now</Button>
      </CardFooter>
    </Card>
  );
}
