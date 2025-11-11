'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { postJobAction } from '@/app/(app)/post-a-job/actions';
import { Sparkles, ArrowLeft, Briefcase, Book, ListChecks, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FindCandidateOutput } from '@/ai/flows/find-candidate-flow';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { mockCandidates } from '@/lib/mock-data';
import { CandidateCard } from './candidate-card';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';

const postJobFormSchema = z.object({
  role: z.string().min(1, 'Role is required.'),
  subject: z.string().optional(),
  skills: z.string().min(1, 'Please list at least one required skill or qualification.'),
  notes: z.string().optional(),
});

type PostJobFormValues = z.infer<typeof postJobFormSchema>;

export function PostJobForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<FindCandidateOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<PostJobFormValues>({
    resolver: zodResolver(postJobFormSchema),
    defaultValues: {
      role: '',
      subject: '',
      skills: '',
      notes: '',
    },
  });

  const onSubmit = (values: PostJobFormValues) => {
    setResult(null);
    startTransition(async () => {
      const response = await postJobAction(values);
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
  const otherCandidates = result?.otherCandidates?.map(other => mockCandidates.find(c => c.id === other.id.toString())).filter(Boolean) || [];


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
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input placeholder="e.g., Science Teacher" {...field} className="pl-10" />
                        </FormControl>
                    </div>
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
                     <div className="relative">
                        <Book className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                          <Input placeholder="e.g., Chemistry" {...field} className="pl-10" />
                        </FormControl>
                    </div>
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
                   <div className="relative">
                      <ListChecks className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'PhD in History', '5+ Years Experience', 'First Aid certified'"
                          rows={3}
                          {...field}
                          className="pl-10 pt-2.5"
                        />
                      </FormControl>
                  </div>
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
                  <div className="relative">
                      <Pencil className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Textarea placeholder="Any other preferences or details..." rows={3} {...field} className="pl-10 pt-2.5" />
                      </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isPending ? 'Finding Candidates...' : 'Get Recommendations'}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-primary">We found some great candidates for you!</h2>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-center">Top Recommendation</h3>
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
            </div>

            {otherCandidates.length > 0 && (
              <div>
                <Separator className="my-8" />
                <h3 className="text-xl font-semibold mb-4 text-center">Other Potential Candidates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherCandidates.map(candidate => (
                    candidate ? <CandidateCard key={candidate.id} candidate={candidate} /> : null
                  ))}
                </div>
              </div>
            )}


            <div className="text-center mt-8">
                <Button onClick={() => {
                    setResult(null);
                    form.reset();
                }}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Post Another Job
                </Button>
            </div>
        </div>
      )}
    </>
  );
}
