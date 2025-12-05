
'use client';

import { useState, useTransition, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateReviewAction } from '@/app/(app)/review-generator/actions';
import { Sparkles, Clipboard, Star, User, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mockClientBookings, mockCandidates } from '@/lib/mock-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const reviewFormSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required.'),
  clientName: z.string().min(1, 'Your name is required.'),
  rating: z.number().min(1, "A rating of at least 1 star is required.").max(5),
  pastPerformance: z.string().min(10, 'Please describe their performance (at least 10 characters).'),
  specificFeedbackRequest: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ReviewGeneratorForm() {
  const [isPending, startTransition] = useTransition();
  const [generatedReview, setGeneratedReview] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const { toast } = useToast();

  const previouslyBookedCandidates = useMemo(() => {
    const candidateNames = new Set(mockClientBookings.map(b => b.candidateName));
    return mockCandidates.filter(c => candidateNames.has(c.name));
  }, []);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      candidateName: '',
      clientName: '',
      pastPerformance: '',
      specificFeedbackRequest: '',
      rating: 0,
    },
  });

  const onSubmit = (values: ReviewFormValues) => {
    setGeneratedReview('');
    startTransition(async () => {
      const result = await generateReviewAction(values);
      if (result.success) {
        setGeneratedReview(result.success);
      } else if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReview);
    toast({
        title: 'Copied!',
        description: 'Review copied to clipboard.',
    });
  }

  const currentRating = form.watch('rating');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="candidateName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Candidate Name</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a previously booked candidate" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {previouslyBookedCandidates.map(c => (
                      <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name (as the reviewer)</FormLabel>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g., John Smith" {...field} className="pl-10" />
                    </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                 <FormControl>
                     <div 
                        className="flex items-center gap-1"
                        onMouseLeave={() => setHoverRating(0)}
                     >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-8 w-8 cursor-pointer transition-colors',
                              (hoverRating >= star || currentRating >= star)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-muted-foreground/50'
                            )}
                            onClick={() => form.setValue('rating', star, { shouldValidate: true })}
                            onMouseEnter={() => setHoverRating(star)}
                          />
                        ))}
                    </div>
                 </FormControl>
                 <FormMessage />
              </FormItem>
            )}
        />
        
        <FormField
          control={form.control}
          name="pastPerformance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Candidate's Past Performance</FormLabel>
               <div className="relative">
                  <Clipboard className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <FormControl>
                    <Textarea
                      placeholder="Describe their key strengths, accomplishments, and areas for improvement..."
                      rows={5}
                      {...field}
                      className="pl-10 pt-2.5"
                    />
                  </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specificFeedbackRequest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specific Feedback Request (Optional)</FormLabel>
               <div className="relative">
                  <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="e.g., Focus on communication skills" {...field} className="pl-10"/>
                  </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isPending ? 'Generating...' : 'Generate Review'}
        </Button>
      </form>

      {generatedReview && (
        <div className="mt-8 pt-8 border-t">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Review</h3>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Clipboard className="mr-2 h-4 w-4" />
                    Copy
                </Button>
            </div>
          <Textarea
            readOnly
            value={generatedReview}
            rows={10}
            className="bg-muted"
          />
        </div>
      )}
    </Form>
  );
}
