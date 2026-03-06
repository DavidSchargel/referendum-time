import { describe, expect, it, vi } from 'vitest';

vi.mock('openai', () => {
  class OpenAI {
    apiKey: string;
    constructor(opts: { apiKey: string }) {
      this.apiKey = opts.apiKey;
    }
  }
  return { default: OpenAI };
});

import { getOpenAIClient } from './openaiClient';

describe('getOpenAIClient', () => {
  it('constructs an OpenAI client with the provided apiKey', () => {
    const client = getOpenAIClient('k123') as any;
    expect(client.apiKey).toBe('k123');
  });
});
