import OpenAI from 'openai';

export function getOpenAIClient(apiKey: string) {
  return new OpenAI({ apiKey });
}
