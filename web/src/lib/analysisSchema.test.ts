import { describe, expect, it } from 'vitest';

import { AnalysisSchema, SourceItemSchema } from './analysisSchema';

describe('analysisSchema', () => {
  it('applies defaults for array fields', () => {
    const parsed = AnalysisSchema.parse({
      billId: 'HB4123',
      plainLanguageSummary: 'Summary',
      debate: { proVoice: 'pro', conVoice: 'con' },
      generatedAtIso: '2020-01-01T00:00:00.000Z',
    });

    expect(parsed.pros).toEqual([]);
    expect(parsed.cons).toEqual([]);
    expect(parsed.whoBenefits).toEqual([]);
    expect(parsed.whoMightBeHarmed).toEqual([]);
    expect(parsed.uncertainties).toEqual([]);
    expect(parsed.sources).toEqual([]);
  });

  it('validates SourceItem url', () => {
    expect(() => SourceItemSchema.parse({ title: 't', url: 'not-a-url' })).toThrow();

    const ok = SourceItemSchema.parse({ title: 't', url: 'https://example.com' });
    expect(ok.url).toBe('https://example.com');
  });
});
