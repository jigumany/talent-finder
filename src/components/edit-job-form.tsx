
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
import { Sparkles, Briefcase, Book, ListChecks, Pencil, Loader2, PoundSterling, MapPin, CalendarIcon, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Job } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Calendar } from './ui/calendar';
import { LocationInput } from './location-input';

const editJobFormSchema = z.object({
  role: z.string().min(1, 'Role is required.'),
  subject: z.string().optional(),
  location: z.string().min(1, { message: 'Location is required.' }),
  skills: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

type EditJobFormValues = z.infer<typeof editJobFormSchema>;

interface EditJobFormProps {
  job: Job;
  onJobUpdated: (updatedJob: Job) => void;
  onCancel: () => void;
}

export function EditJobForm({ job, onJobUpdated, onCancel }: EditJobFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<EditJobFormValues>({
    resolver: zodResolver(editJobFormSchema),
    defaultValues: {
      role: job.title,
      subject: job.subject || '',
      location: job.location || '',
      skills: job.description, // Mapping description to skills
      notes: job.notes || '',
      startDate: job.startDate ? new Date(job.startDate) : undefined,
      endDate: job.endDate ? new Date(job.endDate) : undefined,
    },
  });

  const onSubmit = (values: EditJobFormValues) => {
    startTransition(async () => {
       // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedJob: Job = {
        ...job,
        title: values.role,
        subject: values.subject,
        location: values.location,
        description: values.skills || 'No specific skills provided.',
        notes: values.notes,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
      };
      
      toast({
        title: "Job Updated!",
        description: "Your job posting has been successfully updated.",
      });
      onJobUpdated(updatedJob);
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
                    <FormControl>
                        <LocationInput
                           value={field.value}
                           onChange={(address, lat, lng) => {
                               field.onChange(address);
                               // In a real app you'd save lat/lng to state or form
                           }}
                        />
                    </FormControl>
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
             <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
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
    </>
  );
}
