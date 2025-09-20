
'use server';

/**
 * @fileOverview A tool to generate personalized affirmations based on user needs and goals.
 *
 * - generateAffirmation - A function that generates an affirmation.
 * - GenerateAffirmationInput - The input type for the generateAffirmation function.
 * - GenerateAffirmationOutput - The return type for the generateAffirmation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAffirmationInputSchema = z.object({
  needsAndGoals: z
    .string()
    .describe(
      'A description of the users needs and goals to base the affirmation on.'
    ),
});
export type GenerateAffirmationInput = z.infer<typeof GenerateAffirmationInputSchema>;

const GenerateAffirmationOutputSchema = z.object({
  affirmation: z.string().describe('The generated personalized affirmation.'),
});
export type GenerateAffirmationOutput = z.infer<typeof GenerateAffirmationOutputSchema>;

export async function generateAffirmation(
  input: GenerateAffirmationInput
): Promise<GenerateAffirmationOutput> {
  return generateAffirmationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAffirmationPrompt',
  input: {schema: GenerateAffirmationInputSchema},
  output: {schema: GenerateAffirmationOutputSchema},
  prompt: `You are a compassionate AI assistant that provides short, empathetic affirmations.

  Based on the user's needs and goals, create a brief, warm, and understanding affirmation that acknowledges their feelings while gently encouraging positive self-talk. Keep it concise (1-2 sentences max) and emotionally supportive.

  User's needs and goals: {{{needsAndGoals}}}

  Respond with empathy, understanding, and gentle encouragement.`,
});

const generateAffirmationFlow = ai.defineFlow(
  {
    name: 'generateAffirmationFlow',
    inputSchema: GenerateAffirmationInputSchema,
    outputSchema: GenerateAffirmationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
