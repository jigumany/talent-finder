
'use server';

import { findCandidate, type FindCandidateInput } from '@/ai/flows/find-candidate-flow';
import { z } from 'zod';

const PostJobSchema = z.object({
  role: z.string().min(1, { message: 'Role is required.' }),
  subject: z.string().optional(),
  skills: z.string().min(1, { message: 'Please list at least one skill.' }),
  notes: z.string().optional(),
});

export async function postJobAction(values: FindCandidateInput) {
  const validatedFields = PostJobSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid input.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await findCandidate(validatedFields.data);
    return { success: result };
  } catch (error) {
    console.error("Candidate finding failed:", error);
    return { error: 'Failed to find a candidate. Please try again.' };
  }
}
