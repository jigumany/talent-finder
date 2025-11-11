
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Job } from '@/lib/types';
import { Briefcase, Loader2, Save } from 'lucide-react';
import { useState, useTransition } from 'react';

const editJobFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
});

type EditJobFormValues = z.infer<typeof editJobFormSchema>;

interface EditJobFormProps {
  job: Job;
  onJobUpdated: () => void;
}

export function EditJobForm({ job, onJobUpdated }: EditJobFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<EditJobFormValues>({
    resolver: zodResolver(editJobFormSchema),
    defaultValues: {
      title: job.title,
      description: job.description,
    },
  });

  const onSubmit = (values: EditJobFormValues) => {
    startTransition(async () => {
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Updated Job Values:', values);
      toast({
        title: "Job Updated!",
        description: "Your job posting has been successfully updated.",
      });
      onJobUpdated();
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., Senior History Teacher" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the role, responsibilities, and required skills..."
                  rows={8}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onJobUpdated}>Cancel</Button>
            <Button type="submit" disabled={isPending} size="lg">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
        </div>
      </form>
    </Form>
  );
}
