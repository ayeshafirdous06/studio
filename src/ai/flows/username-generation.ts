'use server';

/**
 * @fileOverview A Genkit flow for generating creative usernames.
 *
 * - generateUsernames - A function that suggests usernames based on a full name.
 * - GenerateUsernamesInput - The input type for the generateUsernames function.
 * - GenerateUsernamesOutput - The return type for the generateUsernames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUsernamesInputSchema = z.object({
  fullName: z.string().describe('The user\'s full name.'),
});
export type GenerateUsernamesInput = z.infer<typeof GenerateUsernamesInputSchema>;

const GenerateUsernamesOutputSchema = z.object({
  usernames: z.array(z.string()).describe('A list of 5 creative and unique username suggestions.'),
});
export type GenerateUsernamesOutput = z.infer<typeof GenerateUsernamesOutputSchema>;

export async function generateUsernames(
  input: GenerateUsernamesInput
): Promise<GenerateUsernamesOutput> {
  return usernameGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'usernameGenerationPrompt',
  input: {schema: GenerateUsernamesInputSchema},
  output: {schema: GenerateUsernamesOutputSchema},
  prompt: `You are a creative assistant that generates unique usernames.
  
  Based on the user's full name, suggest 5 distinct, creative, and modern-sounding usernames.
  The usernames should be lowercase and can include numbers or underscores, but should be easy to remember.

  Full Name: {{{fullName}}}
  `,
});

const usernameGenerationFlow = ai.defineFlow(
  {
    name: 'usernameGenerationFlow',
    inputSchema: GenerateUsernamesInputSchema,
    outputSchema: GenerateUsernamesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
