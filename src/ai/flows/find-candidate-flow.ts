
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
import { fetchCandidates } from '@/lib/data-service';

const FindCandidateInputSchema = z.object({
  role: z.string().describe('The desired role for the candidate (e.g., "Math Teacher", "Teaching Assistant").'),
  subject: z.string().optional().describe('The specific subject the candidate should be proficient in (e.g., "Algebra", "History").'),
  skills: z.string().describe('A description of the required skills, certifications, or qualifications (e.g., "QTS", "PGCE", "First Aid certified").'),
  location: z.string().optional().describe('The desired location for the candidate (e.g., "London", "Manchester").'),
  maxRate: z.number().optional().describe('The maximum daily or hourly rate the client is willing to pay.'),
  availability: z.string().optional().describe('The desired start date or date range (e.g., "next Monday", "September 1st to October 31st").'),
  notes: z.string().optional().describe('Any other notes or preferences about the ideal candidate.'),
});
export type FindCandidateInput = z.infer<typeof FindCandidateInputSchema>;

const FindCandidateOutputSchema = z.object({
  bestMatch: z.object({
    id: z.string().describe("The ID of the recommended candidate. This MUST be an ID from the provided candidate list."),
    name: z.string().describe("The name of the recommended candidate."),
    reasoning: z.string().describe("A brief explanation of why this candidate is the best match, considering all criteria."),
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


const prompt = ai.definePrompt({
  name: 'findCandidatePrompt',
  input: {
    schema: z.object({
      ...FindCandidateInputSchema.shape,
      // We are adding the candidates directly to the prompt context
      candidates: z.string().describe('A JSON string of all available candidates, including their availability dates.'),
    }),
  },
  output: {schema: FindCandidateOutputSchema},
  prompt: `You are an expert recruitment consultant for the education sector. Your task is to find the best candidate for a school based on their specific requirements.

Carefully analyze the client's request and the list of available candidates provided in the JSON block below.

Available Candidates:
{{{candidates}}}

The candidate JSON contains an 'availability' array with dates in YYYY-MM-DD format. Use this to check if a candidate is available for the requested dates. Today's date is {{currentDate}}.

Your recommendation MUST consider all the client's criteria: role, subject, skills, location, rate, and availability.

Identify the single best match from the list.
IMPORTANT: You must provide a best match. The 'id' for the bestMatch and any otherCandidates in your output MUST be one of the exact 'id's from the provided JSON list. Do NOT invent, create, or modify an ID in any way.

Provide a concise, compelling reason for your choice in the 'reasoning' field.

After identifying the best match, also provide a list of 1-2 other candidates who are also a good fit in the 'otherCandidates' field.

Client's Request:
- Role: {{{role}}}
- Subject: {{#if subject}}{{{subject}}}{{else}}N/A{{/if}}
- Required Skills/Qualifications: {{{skills}}}
- Location: {{#if location}}{{{location}}}{{else}}Any{{/if}}
- Maximum Rate: {{#if maxRate}}£{{{maxRate}}}{{else}}Any{{/if}}
- Availability: {{#if availability}}{{{availability}}}{{else}}Any{{/if}}
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
    // Fetch live candidate data instead of using mocks
    const candidates = await fetchCandidates();
    
    // Pass the live candidates directly into the prompt's context.
    const {output} = await prompt({
        ...input,
        candidates: JSON.stringify(candidates),
        currentDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
    });
    return output!;
  }
);
