'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { findCandidateAction } from '@/app/(app)/find-me-someone/actions';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FindCandidateOutput } from '@/ai/flows/find-candidate-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { mockCandidates } from '@/lib/mock-data';
import { CandidateCard } from './candidate-card';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

const findSomeoneFormSchema = z.object({
  role: z.string().min(1, 'Role is required.'),
  subject: z.string().optional(),
  skills: z.string().min(1, 'Please list at least one required skill or qualification.'),
  notes: z.string().optional(),
});

type FindSomeoneFormValues = z.infer<typeof findSomeoneFormSchema>;

export function FindSomeoneForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<FindCandidateOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FindSomeoneFormValues>({
    resolver: zodResolver(findSomeoneFormSchema),
    defaultValues: {
      role: '',
      subject: '',
      skills: '',
      notes: '',
    },
  });

  const onSubmit = (values: FindSomeoneFormValues) => {
    setResult(null);
    startTransition(async () => {
      const response = await findCandidateAction(values);
      if (response.success) {
        setResult(response.success);
      } else if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      }
    });
  };
  
  const recommendedCandidate = result ? mockCandidates.find(c => c.id === result.bestMatch.id.toString()) : null;

  return (
    <>
      {!result ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Science Teacher" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chemistry" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Skills / Certifications</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'PhD in History', '5+ Years Experience', 'First Aid certified'"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a comma-separated list or a sentence describing the qualifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any other preferences or details..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isPending ? 'Finding Match...' : 'Find Match'}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-primary">We found a great match for you!</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-start">
                 <div className="max-w-sm mx-auto">
                    {recommendedCandidate ? (
                        <CandidateCard candidate={recommendedCandidate} />
                   ) : (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Could not find the details for the recommended candidate (ID: {result.bestMatch.id}).
                      </AlertDescription>
                    </Alert>
                   )}
                </div>
                <div className="space-y-4">
                     <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <span>AI Recommendation</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground italic">"{result.bestMatch.reasoning}"</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="text-center">
                <Button onClick={() => {
                    setResult(null);
                    form.reset();
                }}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Start a New Search
                </Button>
            </div>
        </div>
      )}
    </>
  );
}
