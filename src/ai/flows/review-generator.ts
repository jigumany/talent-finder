'use server';

/**
 * @fileOverview AI-powered review generator for clients to provide personalized feedback to candidates.
 *
 * - generateReview - A function that generates a review for a candidate based on their past performance.
 * - ReviewGeneratorInput - The input type for the generateReview function.
 * - ReviewGeneratorOutput - The return type for the generateReview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewGeneratorInputSchema = z.object({
  candidateName: z.string().describe('The name of the candidate being reviewed.'),
  clientName: z.string().describe('The name of the client writing the review.'),
  pastPerformance: z
    .string()
    .describe(
      'A detailed description of the candidate’s past performance during their engagement.'
    ),
  specificFeedbackRequest: z
    .string()
    .optional()
    .describe(
      'Optional specific feedback requests or areas to focus on in the review.'
    ),
});
export type ReviewGeneratorInput = z.infer<typeof ReviewGeneratorInputSchema>;

const ReviewGeneratorOutputSchema = z.object({
  review: z.string().describe('The generated review text for the candidate.'),
});
export type ReviewGeneratorOutput = z.infer<typeof ReviewGeneratorOutputSchema>;

export async function generateReview(input: ReviewGeneratorInput): Promise<ReviewGeneratorOutput> {
  return generateReviewFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reviewGeneratorPrompt',
  input: {schema: ReviewGeneratorInputSchema},
  output: {schema: ReviewGeneratorOutputSchema},
  prompt: `You are an AI-powered review generator, designed to help clients write personalized and targeted reviews for candidates based on their past performance.

  You will generate a review for the candidate, incorporating details from their past performance and any specific feedback requests from the client.
  The review should be constructive, specific, and helpful for the candidate’s professional development.

  Candidate Name: {{{candidateName}}}
  Client Name: {{{clientName}}}
  Past Performance: {{{pastPerformance}}}
  Specific Feedback Request: {{{specificFeedbackRequest}}}

  Review:`,
});

const generateReviewFlow = ai.defineFlow(
  {
    name: 'generateReviewFlow',
    inputSchema: ReviewGeneratorInputSchema,
    outputSchema: ReviewGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
