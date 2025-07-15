
'use server';

/**
 * @fileOverview AI-powered candidate finder.
 *
 * - findCandidate - A function that finds a suitable candidate based on client requirements.
 * - FindCandidateInput - The input type for the findCandidate function.
 * - FindCandidateOutput - The return type for the findCandidate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { mockCandidates } from '@/lib/mock-data';

const FindCandidateInputSchema = z.object({
  role: z.string().describe('The desired role for the candidate (e.g., "Math Teacher", "Teaching Assistant").'),
  subject: z.string().optional().describe('The specific subject the candidate should be proficient in (e.g., "Algebra", "History").'),
  skills: z.string().describe('A description of the required skills, certifications, or qualifications.'),
  notes: z.string().optional().describe('Any other notes or preferences about the ideal candidate.'),
});
export type FindCandidateInput = z.infer<typeof FindCandidateInputSchema>;

const FindCandidateOutputSchema = z.object({
  bestMatch: z.object({
    id: z.string().describe("The ID of the recommended candidate."),
    name: z.string().describe("The name of the recommended candidate."),
    reasoning: z.string().describe("A brief explanation of why this candidate is the best match."),
  }),
  otherCandidates: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ).optional().describe("A list of other potential candidates who could also be a good fit."),
});
export type FindCandidateOutput = z.infer<typeof FindCandidateOutputSchema>;


export async function findCandidate(input: FindCandidateInput): Promise<FindCandidateOutput> {
  return findCandidateFlow(input);
}

// Simple service to get candidate list. In a real app, this would query a database.
const getAvailableCandidates = ai.defineTool(
    {
        name: 'getAvailableCandidates',
        description: 'Returns a list of all available candidates in the system.',
        outputSchema: z.array(z.object({
            id: z.string(),
            name: z.string(),
            role: z.string(),
            qualifications: z.array(z.string()),
            // bio: z.string(), // A short bio would be useful here in a real app
        }))
    },
    async () => {
        return mockCandidates.map(c => ({
            id: c.id,
            name: c.name,
            role: c.role,
            qualifications: c.qualifications,
        }));
    }
);

const prompt = ai.definePrompt({
  name: 'findCandidatePrompt',
  input: {schema: FindCandidateInputSchema},
  output: {schema: FindCandidateOutputSchema},
  tools: [getAvailableCandidates],
  prompt: `You are an expert recruitment consultant for the education sector. Your task is to find the best candidate for a school based on their specific requirements.

First, use the getAvailableCandidates tool to get a list of all candidates.

Then, carefully analyze the client's request and the list of available candidates. Identify the single best match. Provide a concise, compelling reason for your choice. You must provide a best match.

Client's Request:
- Role: {{{role}}}
- Subject: {{#if subject}}{{{subject}}}{{else}}N/A{{/if}}
- Required Skills/Qualifications: {{{skills}}}
- Additional Notes: {{#if notes}}{{{notes}}}{{else}}N/A{{/if}}

Your response must be in the specified JSON format.
`,
});

const findCandidateFlow = ai.defineFlow(
  {
    name: 'findCandidateFlow',
    inputSchema: FindCandidateInputSchema,
    outputSchema: FindCandidateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
