
'use server';

import { chatWithAssistant } from '@/ai/flows/assistant-flow';
import { findCandidate } from '@/ai/flows/find-candidate-flow';
import { generateReview } from '@/ai/flows/review-generator';

// This file re-exports server actions to be safely used on the client.
export { chatWithAssistant, findCandidate, generateReview };
