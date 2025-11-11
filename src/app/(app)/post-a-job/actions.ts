
'use server';

import { z } from 'zod';
import type { Job } from '@/lib/types';

const PostJobSchema = z.object({
  role: z.string().min(1, { message: 'Role is required.' }),
  subject: z.string().optional(),
  payRate: z.coerce.number().min(1, { message: 'Pay rate is required.' }),
  location: z.string().min(1, { message: 'Location is required.' }),
  skills: z.string().min(1, { message: 'Please list at least one skill.' }),
  notes: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export async function postJobAction(values: z.infer<typeof PostJobSchema>): Promise<{ success?: Job, error?: string, fieldErrors?: any }> {
  const validatedFields = PostJobSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid input.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const { payRate, startDate, endDate } = validatedFields.data;
    const chargeRate = payRate * 1.40;

    // In a real app, this would save to a database and return the new job.
    // Here, we simulate creating a new job object.
    const newJob: Job = {
        id: `job-${Date.now()}`,
        title: validatedFields.data.role,
        description: validatedFields.data.skills, // Using skills for description as per form
        datePosted: new Date().toISOString(),
        status: 'Active',
        applicants: 0,
        shortlisted: 0,
        payRate: payRate,
        chargeRate: chargeRate,
        location: validatedFields.data.location,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
    };
    
    // We're not calling an AI flow here, just creating the job.
    // The success property now returns the full job object.
    return { success: newJob };
  } catch (error) {
    console.error("Job posting failed:", error);
    return { error: 'Failed to post the job. Please try again.' };
  }
}
