
'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { postJobAction } from '@/app/(app)/actions';
import { Sparkles, Briefcase, Book, ListChecks, Pencil, Loader2, PoundSterling, MapPin, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Job } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Calendar } from './ui/calendar';

const postJobFormSchema = z.object({
  role: z.string().min(1, 'Role is required.'),
  subject: z.string().optional(),
  location: z.string().min(1, { message: 'Location is required.' }),
  skills: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

type PostJobFormValues = z.infer<typeof postJobFormSchema>;

interface PostJobFormProps {
  onJobPosted: (newJob: Job) => void;
}

export function PostJobForm({ onJobPosted }: PostJobFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<PostJobFormValues>({
    resolver: zodResolver(postJobFormSchema),
    defaultValues: {
      role: '',
      subject: '',
      location: '',
      skills: '',
      notes: '',
    },
  });

  const onSubmit = (values: PostJobFormValues) => {
    startTransition(async () => {
      const response = await postJobAction(values);
      if (response.success) {
        toast({
            title: "Job Posted!",
            description: "Your new job has been added to your postings.",
        });
        onJobPosted(response.success);
        form.reset();
      } else if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
      }
    });
  };
  

  return (
    <>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title / Role</FormLabel>
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
            
            <div className="grid md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                           <Input placeholder="e.g. London, UK" {...field} className="pl-10" />
                        </FormControl>
                    </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description & Skills (Optional)</FormLabel>
                   <div className="relative">
                      <ListChecks className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <FormControl>
                        <Textarea
                          placeholder="Describe the role, responsibilities, and required skills. e.g., 'PhD in History', '5+ Years Experience', 'First Aid certified'"
                          rows={5}
                          {...field}
                          className="pl-10 pt-2.5"
                        />
                      </FormControl>
                  </div>
                  <FormDescription>
                    The more detail you provide, the better the AI can match candidates.
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
                        <Textarea placeholder="Any other preferences or details about the school, hours, etc." rows={3} {...field} className="pl-10 pt-2.5" />
                      </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto" size="lg">
              {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting Job...
                </>
              ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Post Job
                </>
              )}
            </Button>
          </form>
        </Form>
    </>
  );
}
