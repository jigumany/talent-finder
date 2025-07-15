
'use server';

import { generateReview, type ReviewGeneratorInput } from '@/ai/flows/review-generator';
import { z } from 'zod';

const ReviewSchema = z.object({
  candidateName: z.string().min(1, { message: 'Candidate name is required.' }),
  clientName: z.string().min(1, { message: 'Your name is required.' }),
  pastPerformance: z.string().min(10, { message: 'Please provide some details on performance.' }),
  specificFeedbackRequest: z.string().optional(),
});

export async function generateReviewAction(values: ReviewGeneratorInput) {
  const validatedFields = ReviewSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid input.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateReview(validatedFields.data);
    return { success: result.review };
  } catch (error) {
    console.error("Review generation failed:", error);
    return { error: 'Failed to generate review. Please try again.' };
  }
}
