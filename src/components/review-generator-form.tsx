
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { generateReviewAction } from '@/app/(app)/review-generator/actions';
import { Sparkles, Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const reviewFormSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required.'),
  clientName: z.string().min(1, 'Your name is required.'),
  pastPerformance: z.string().min(10, 'Please describe their performance (at least 10 characters).'),
  specificFeedbackRequest: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function ReviewGeneratorForm() {
  const [isPending, startTransition] = useTransition();
  const [generatedReview, setGeneratedReview] = useState('');
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      candidateName: '',
      clientName: '',
      pastPerformance: '',
      specificFeedbackRequest: '',
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
                <FormControl>
                  <Input placeholder="e.g., Jane Doe" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="e.g., John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="pastPerformance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Candidate's Past Performance</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe their key strengths, accomplishments, and areas for improvement..."
                  rows={5}
                  {...field}
                />
              </FormControl>
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
              <FormControl>
                <Input placeholder="e.g., Focus on communication skills" {...field} />
              </FormControl>
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
