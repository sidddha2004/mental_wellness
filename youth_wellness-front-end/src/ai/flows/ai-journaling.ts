'use server';

/**
 * @fileOverview AI-powered journaling flow that provides empathetic responses and personalized mental wellness tips.
 *
 * - aiJournaling - A function that takes a journal entry as input and returns an AI-generated response with mental wellness tips.
 * - AIJournalingInput - The input type for the aiJournaling function.
 * - AIJournalingOutput - The return type for the aiJournaling function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIJournalingInputSchema = z.object({
  journalEntry: z
    .string()
    .describe('The user journal entry to analyze and respond to.'),
});
export type AIJournalingInput = z.infer<typeof AIJournalingInputSchema>;

const AIJournalingOutputSchema = z.object({
  aiResponse: z
    .string()
    .describe(
      'An empathetic AI-generated response to the journal entry with personalized mental wellness tips.'
    ),
});
export type AIJournalingOutput = z.infer<typeof AIJournalingOutputSchema>;

export async function aiJournaling(input: AIJournalingInput): Promise<AIJournalingOutput> {
  return aiJournalingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiJournalingPrompt',
  input: {schema: AIJournalingInputSchema},
  output: {schema: AIJournalingOutputSchema},
  prompt: `You are an AI mental wellness assistant designed to provide empathetic responses and personalized mental wellness tips based on user journal entries.

  Analyze the following journal entry and provide an empathetic response along with actionable mental wellness tips tailored to the user's situation. Be culturally sensitive to Indian youth.

  Journal Entry: {{{journalEntry}}}
  `,
});

const aiJournalingFlow = ai.defineFlow(
  {
    name: 'aiJournalingFlow',
    inputSchema: AIJournalingInputSchema,
    outputSchema: AIJournalingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
