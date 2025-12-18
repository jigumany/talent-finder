
'use server';

import { findCandidate, type FindCandidateInput } from '@/ai/flows/find-candidate-flow';
import { z } from 'zod';

const FindSomeoneSchema = z.object({
  role: z.string().min(1, { message: 'Role is required.' }),
  subject: z.string().optional(),
  skills: z.string().min(1, { message: 'Please list at least one skill.' }),
  location: z.string().optional(),
  maxRate: z.coerce.number().optional(),
  availability: z.string().optional(),
  notes: z.string().optional(),
});

export async function findSomeoneAction(values: z.infer<typeof FindSomeoneSchema>) {
  const validatedFields = FindSomeoneSchema.safeParse(values);

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
