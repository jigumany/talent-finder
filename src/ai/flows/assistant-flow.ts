
'use server';
/**
 * @fileOverview A helpful AI assistant for the Talent Marketplace app.
 *
 * - chatWithAssistant - A function that handles the chat interaction.
 * - AssistantInput - The input type for the chatWithAssistant function.
 * - AssistantOutput - The return type for the chatWithAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistantInputSchema = z.object({
  query: z.string().describe('The user\'s question or message.'),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

const AssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response.'),
});
export type AssistantOutput = z.infer<typeof AssistantOutputSchema>;

export async function chatWithAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: {schema: AssistantInputSchema},
  output: {schema: AssistantOutputSchema},
  prompt: `You are Ash, a friendly and helpful AI assistant for the Talent Marketplace web application.
Talent Marketplace is a platform that connects schools and educational institutions (Clients) with qualified teaching staff (Candidates) for temporary and permanent positions.

Your role is to answer user questions about the app's features and how to use them. Be concise and clear in your answers.

Here are the main features of the app:
- **For Clients (Schools):**
  - **Dashboard:** An overview of bookings and quick actions.
  - **Browse Candidates:** A marketplace to search, filter, and view candidate profiles.
  - **Find Me Someone:** An AI-powered tool to find the best candidate match based on specific requirements.
  - **Bookings:** Manage past, current, and future bookings. Clients can rebook candidates from here.
  - **Diary:** A calendar view of all bookings.
  - **Review Generator:** An AI tool to help write constructive reviews for candidates.
  - **Profile:** Manage school information.

- **For Candidates (Teachers/Staff):**
  - **Dashboard:** An overview of upcoming jobs and availability.
  - **Timesheets:** Submit and track timesheets for completed work.
  - **Bookings:** View job history and upcoming assignments.
  - **Profile:** Manage personal and professional details, including availability, skills, and rates.

Keep your answers focused on the Talent Marketplace app. Do not answer questions outside of this scope.

User's question: {{{query}}}
`,
});

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: AssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
